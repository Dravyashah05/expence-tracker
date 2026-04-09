require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

function loadFirebaseCredential() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidatePaths = [
    serviceAccountPath,
    googleCredentialsPath,
    path.join(process.cwd(), 'backend', 'firebase-service-account.json'),
    path.join(process.cwd(), 'firebase-service-account.json'),
    path.join(__dirname, 'firebase-service-account.json'),
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    const resolved = path.isAbsolute(candidate)
      ? candidate
      : path.resolve(process.cwd(), candidate);
    if (fs.existsSync(resolved)) {
      const raw = fs.readFileSync(resolved, 'utf8');
      return admin.credential.cert(JSON.parse(raw));
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }

  throw new Error(
    'Firebase credentials are missing. Configure FIREBASE_SERVICE_ACCOUNT_PATH (or GOOGLE_APPLICATION_CREDENTIALS) to a service-account JSON file.',
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: loadFirebaseCredential() });
}

const db = admin.firestore();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

function validateRequired(values) {
  return values.every(
    (value) => value !== undefined && value !== null && String(value).trim() !== '',
  );
}

function userTransactionsRef(userId) {
  return db.collection('users').doc(userId).collection('transactions');
}

function normalizeTransaction(doc) {
  const data = doc.data();
  const rawDate = data.date;
  let date = rawDate;

  if (rawDate && typeof rawDate.toDate === 'function') {
    date = rawDate.toDate().toISOString();
  }

  return {
    id: doc.id,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    description: data.description || '',
    date,
    paymentMethod: data.paymentMethod || 'Cash',
    paymentSource: data.paymentSource || '',
  };
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!validateRequired([email, password, name])) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db
      .collection('users')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    if (!existing.empty) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = db.collection('users').doc();

    await userDoc.set({
      email: normalizedEmail,
      passwordHash,
      name: String(name).trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      user: {
        id: userDoc.id,
        email: normalizedEmail,
        name: String(name).trim(),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateRequired([email, password])) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();

    if (users.empty) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userDoc = users.docs[0];
    const userData = userDoc.data();
    const isValid = await bcrypt.compare(password, userData.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updates = {};
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Name is required.' });
      }
      updates.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      const existing = await db
        .collection('users')
        .where('email', '==', normalizedEmail)
        .limit(1)
        .get();
      if (!existing.empty && existing.docs[0].id !== userId) {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      updates.email = normalizedEmail;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    await userRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await userRef.get();
    const data = updatedDoc.data();

    return res.json({
      user: {
        id: updatedDoc.id,
        email: data.email,
        name: data.name,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

app.put('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!validateRequired([currentPassword, newPassword])) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = userDoc.data();
    const isValid = await bcrypt.compare(String(currentPassword), userData.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await userRef.update({
      passwordHash,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
});

app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await userTransactionsRef(userId).orderBy('date', 'desc').get();
    const transactions = snapshot.docs.map(normalizeTransaction);
    return res.json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
});

app.post('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, category, amount, date, description, paymentMethod, paymentSource } = req.body;

    if (!validateRequired([type, category, amount, date])) {
      return res.status(400).json({ message: 'Type, category, amount, and date are required.' });
    }

    const docRef = userTransactionsRef(userId).doc();
    const payload = {
      type,
      category,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      description: description || '',
      paymentMethod: paymentMethod || 'Cash',
      paymentSource: paymentSource || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(payload);

    return res.status(201).json({
      transaction: {
        id: docRef.id,
        ...payload,
      },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return res.status(500).json({ message: 'Failed to create transaction.' });
  }
});

app.put('/api/transactions/:userId/:transactionId', async (req, res) => {
  try {
    const { userId, transactionId } = req.params;
    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
    }

    if (updates.date !== undefined) {
      updates.date = new Date(updates.date).toISOString();
    }

    await userTransactionsRef(userId).doc(transactionId).update(updates);

    const doc = await userTransactionsRef(userId).doc(transactionId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    return res.json({ transaction: normalizeTransaction(doc) });
  } catch (error) {
    console.error('Update transaction error:', error);
    return res.status(500).json({ message: 'Failed to update transaction.' });
  }
});

app.delete('/api/transactions/:userId/:transactionId', async (req, res) => {
  try {
    const { userId, transactionId } = req.params;
    await userTransactionsRef(userId).doc(transactionId).delete();
    return res.status(204).send();
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
