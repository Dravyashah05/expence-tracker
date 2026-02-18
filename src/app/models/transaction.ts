export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  description: string;
  date: Date;
  paymentMethod?: 'Cash' | 'Card' | 'Bank';
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}
