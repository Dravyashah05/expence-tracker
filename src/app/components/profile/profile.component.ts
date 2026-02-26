import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { LoaderComponent } from '../loader/loader.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoaderComponent, MatIconModule],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Profile</h1>
            <p class="page-subtitle">Manage identity, security, and a quick view of your app preferences.</p>
          </div>
          <a routerLink="/settings" class="btn-outline back-btn">
            <mat-icon>arrow_back</mat-icon>
            Back to Settings
          </a>
        </header>

        <section class="profile-grid">
          <article class="surface-card panel profile-panel">
            <div class="profile-hero">
              <div class="hero-overlay"></div>
              <div class="avatar" [class.with-image]="!!avatarUrl()">
                @if (avatarUrl()) {
                  <img [src]="avatarUrl()" alt="Profile image">
                } @else {
                  {{ initials() }}
                }
              </div>
              <div class="hero-copy">
                <h2>{{ userName() }}</h2>
                <p>{{ userEmail() }}</p>
                <div class="identity-chips">
                  <span>Active Account</span>
                  <span>{{ settingsService.currency() }} default</span>
                </div>
              </div>
            </div>

            <div class="stats-grid">
              <article class="mini-stat">
                <span class="label"><mat-icon>badge</mat-icon>User ID</span>
                <strong class="break-text">{{ userId() }}</strong>
              </article>
              <article class="mini-stat">
                <span class="label"><mat-icon>verified</mat-icon>Status</span>
                <strong>Active</strong>
              </article>
              <article class="mini-stat">
                <span class="label"><mat-icon>schedule</mat-icon>Last Sign-In</span>
                <strong>Stored Locally</strong>
              </article>
              <article class="mini-stat">
                <span class="label"><mat-icon>shield</mat-icon>Security</span>
                <strong>{{ isEditing() ? 'Editing Mode' : 'Protected' }}</strong>
              </article>
            </div>

            <div class="profile-actions">
              <button class="btn-outline" type="button" (click)="toggleEdit()">
                <mat-icon>{{ isEditing() ? 'close' : 'edit' }}</mat-icon>
                {{ isEditing() ? 'Cancel' : 'Edit Profile' }}
              </button>
              <button class="btn-solid" type="button" (click)="saveProfile()" [disabled]="profileForm.invalid || isSaving()">
                @if (isSaving()) {
                  <app-loader size="sm"></app-loader>
                  Saving...
                } @else {
                  <mat-icon>check_circle</mat-icon>
                  Save Changes
                }
              </button>
            </div>

            @if (isEditing()) {
              <form class="edit-form" [formGroup]="profileForm">
                <section class="edit-section">
                  <h3>Identity</h3>
                  <label>
                    <span><mat-icon>person</mat-icon>Full Name</span>
                    <input type="text" formControlName="name" placeholder="Your name">
                  </label>
                  <label>
                    <span><mat-icon>mail</mat-icon>Email</span>
                    <input type="email" formControlName="email" placeholder="you@example.com">
                  </label>
                </section>

                <section class="edit-section upload-card">
                  <div>
                    <strong><mat-icon>photo_camera</mat-icon>Profile Image</strong>
                    <small>JPEG/PNG, auto-compressed under 1 MB.</small>
                  </div>
                  <div class="upload-actions">
                    <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
                    <button class="btn-outline" type="button" (click)="fileInput.click()">Upload Image</button>
                    <button class="btn-ghost" type="button" (click)="removeAvatar()" [disabled]="!avatarUrl()">Remove</button>
                  </div>
                  @if (uploadError()) {
                    <p class="error">{{ uploadError() }}</p>
                  }
                </section>

                <section class="edit-section security-card">
                  <div>
                    <strong><mat-icon>lock</mat-icon>Password</strong>
                    <small>Leave empty if you are not changing password.</small>
                  </div>
                  <label>
                    <span>Current Password</span>
                    <input type="password" formControlName="currentPassword" placeholder="Current password">
                  </label>
                  <label>
                    <span>New Password</span>
                    <input type="password" formControlName="newPassword" placeholder="New password">
                  </label>
                  <label>
                    <span>Confirm Password</span>
                    <input type="password" formControlName="confirmPassword" placeholder="Confirm new password">
                  </label>
                </section>

                @if (saveMessage()) {
                  <p class="success">{{ saveMessage() }}</p>
                }
                @if (saveError()) {
                  <p class="error">{{ saveError() }}</p>
                }
              </form>
            }
          </article>

          <article class="surface-card panel snapshot-panel">
            <div class="snapshot-head">
              <h2>Preference Snapshot</h2>
              <small>Live from your current settings</small>
            </div>

            <div class="snapshot-grid">
              <article class="snapshot-item">
                <span>Theme</span>
                <strong>{{ settingsService.themeColor() }}</strong>
              </article>
              <article class="snapshot-item">
                <span>Mode</span>
                <strong>{{ settingsService.darkMode() ? 'Dark' : 'Light' }}</strong>
              </article>
              <article class="snapshot-item">
                <span>Currency</span>
                <strong>{{ settingsService.currency() }}</strong>
              </article>
              <article class="snapshot-item">
                <span>Notifications</span>
                <strong>{{ settingsService.notification() ? 'Enabled' : 'Off' }}</strong>
              </article>
              <article class="snapshot-item">
                <span>Auto-save</span>
                <strong>{{ settingsService.autoSave() ? 'On' : 'Off' }}</strong>
              </article>
              <article class="snapshot-item">
                <span>Transaction Sounds</span>
                <strong>{{ settingsService.transactionSounds() ? 'On' : 'Off' }}</strong>
              </article>
            </div>

            <div class="sources-wrap">
              <h3>Payment Sources</h3>
              <div class="source-row">
                <span>Bank Accounts</span>
                <strong>{{ settingsService.bankAccounts().length }}</strong>
              </div>
              <div class="source-pills">
                @if (settingsService.bankAccounts().length === 0) {
                  <span class="pill-muted">No bank accounts</span>
                } @else {
                  @for (account of settingsService.bankAccounts(); track account) {
                    <span class="pill">{{ account }}</span>
                  }
                }
              </div>

              <div class="source-row">
                <span>Cards</span>
                <strong>{{ settingsService.cards().length }}</strong>
              </div>
              <div class="source-pills">
                @if (settingsService.cards().length === 0) {
                  <span class="pill-muted">No cards</span>
                } @else {
                  @for (card of settingsService.cards(); track card) {
                    <span class="pill">{{ card }}</span>
                  }
                }
              </div>
            </div>

            <a routerLink="/settings" class="btn-solid settings-link">
              <mat-icon>tune</mat-icon>
              Adjust Settings
            </a>
          </article>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.22fr 0.78fr;
      gap: 0.95rem;
      align-items: start;
    }

    .panel {
      padding: 1rem;
      display: grid;
      gap: 0.9rem;
      align-content: start;
    }

    .profile-panel {
      gap: 1rem;
    }

    .profile-hero {
      position: relative;
      border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--line));
      border-radius: 18px;
      padding: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.95rem;
      background:
        radial-gradient(260px 130px at 95% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent),
        linear-gradient(135deg, color-mix(in srgb, var(--primary) 13%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 90%, transparent) 100%);
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--surface) 80%, transparent) 100%);
      pointer-events: none;
    }

    .avatar {
      position: relative;
      z-index: 1;
      width: 62px;
      height: 62px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: grid;
      place-items: center;
      font-weight: 800;
      color: white;
      letter-spacing: 0.05em;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--line) 70%, #fff 30%);
      box-shadow: 0 10px 18px color-mix(in srgb, var(--primary) 20%, transparent);
    }

    .avatar.with-image {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero-copy {
      position: relative;
      z-index: 1;
      min-width: 0;
    }

    .hero-copy h2 {
      font-size: 1.1rem;
      margin: 0;
    }

    .hero-copy p {
      color: var(--text-soft);
      font-size: 0.85rem;
      margin: 0.25rem 0 0;
      overflow-wrap: anywhere;
    }

    .identity-chips {
      margin-top: 0.45rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.32rem;
    }

    .identity-chips span {
      border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--line));
      border-radius: 999px;
      padding: 0.18rem 0.56rem;
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary-strong);
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.58rem;
    }

    .mini-stat {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: color-mix(in srgb, var(--surface) 90%, transparent);
      padding: 0.62rem 0.7rem;
      display: grid;
      gap: 0.3rem;
    }

    .label {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .label mat-icon {
      width: 15px;
      height: 15px;
      font-size: 15px;
      color: var(--primary-strong);
    }

    .mini-stat strong {
      font-size: 0.96rem;
      line-height: 1.25;
    }

    .break-text {
      overflow-wrap: anywhere;
    }

    .profile-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    .profile-actions .btn-outline,
    .profile-actions .btn-solid {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .profile-actions .btn-outline mat-icon,
    .profile-actions .btn-solid mat-icon,
    .settings-link mat-icon,
    .back-btn mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .edit-form {
      display: grid;
      gap: 0.75rem;
      border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--line));
      border-radius: 16px;
      padding: 0.82rem;
      background:
        radial-gradient(240px 90px at 100% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent),
        color-mix(in srgb, var(--surface) 92%, transparent);
    }

    .edit-section {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 0.7rem;
      display: grid;
      gap: 0.6rem;
      background: var(--surface);
    }

    .edit-section h3 {
      font-size: 0.95rem;
      margin: 0;
    }

    .edit-form label {
      display: grid;
      gap: 0.36rem;
    }

    .edit-form label span {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .edit-form label span mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: var(--primary-strong);
    }

    .edit-form input {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text);
      font: inherit;
      padding: 0.7rem;
    }

    .edit-form input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent);
    }

    .upload-card {
      border-style: dashed;
    }

    .upload-card strong {
      display: block;
      font-size: 0.9rem;
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .upload-card small {
      color: var(--text-soft);
      font-size: 0.78rem;
    }

    .upload-card mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: var(--primary-strong);
    }

    .security-card {
      background: color-mix(in srgb, var(--surface) 94%, var(--bg));
    }

    .security-card strong {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .security-card mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: var(--primary-strong);
    }

    .upload-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .btn-ghost {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.45rem 0.8rem;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .error {
      margin: 0;
      color: var(--danger);
      font-size: 0.82rem;
      font-weight: 600;
    }

    .success {
      margin: 0;
      color: var(--success);
      font-size: 0.82rem;
      font-weight: 600;
    }

    .snapshot-panel {
      position: sticky;
      top: 0.8rem;
      gap: 0.88rem;
      background:
        radial-gradient(240px 120px at 100% 0%, color-mix(in srgb, var(--primary) 13%, transparent), transparent),
        var(--surface);
    }

    .snapshot-head {
      display: grid;
      gap: 0.18rem;
    }

    .snapshot-head h2 {
      font-size: 1.05rem;
    }

    .snapshot-head small {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .snapshot-grid {
      display: grid;
      gap: 0.48rem;
    }

    .snapshot-item {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: color-mix(in srgb, var(--surface) 90%, transparent);
      padding: 0.58rem 0.64rem;
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      align-items: center;
    }

    .snapshot-item span {
      color: var(--text-soft);
      font-size: 0.79rem;
      font-weight: 700;
    }

    .snapshot-item strong {
      font-size: 0.89rem;
    }

    .sources-wrap {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: color-mix(in srgb, var(--surface-soft) 70%, transparent);
      padding: 0.68rem;
      display: grid;
      gap: 0.44rem;
    }

    .sources-wrap h3 {
      margin: 0 0 0.2rem;
      font-size: 0.95rem;
    }

    .source-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.6rem;
    }

    .source-row span {
      color: var(--text-soft);
      font-size: 0.79rem;
      font-weight: 700;
    }

    .source-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.28rem;
      margin-bottom: 0.35rem;
    }

    .pill,
    .pill-muted {
      border-radius: 999px;
      padding: 0.2rem 0.56rem;
      font-size: 0.72rem;
      font-weight: 700;
      border: 1px solid var(--line);
      background: var(--surface);
    }

    .pill {
      color: var(--text);
    }

    .pill-muted {
      color: var(--text-soft);
      background: color-mix(in srgb, var(--surface-soft) 88%, transparent);
    }

    .settings-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-solid {
      justify-self: start;
    }

    @media (max-width: 920px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }

      .snapshot-panel {
        position: static;
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .profile-hero {
        align-items: flex-start;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  settingsService = inject(SettingsService);

  private user = computed(() => this.authService.user());

  userName = computed(() => this.user()?.name || 'User');
  userEmail = computed(() => this.user()?.email || 'No email');
  userId = computed(() => this.user()?.id || 'Unknown');
  avatarUrl = computed(() => this.user()?.avatarUrl || '');
  initials = computed(() => this.toInitials(this.user()?.name));

  isEditing = signal(false);
  isSaving = signal(false);
  uploadError = signal('');
  saveError = signal('');
  saveMessage = signal('');

  profileForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [''],
    confirmPassword: ['']
  });

  private toInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    const combined = `${first}${last}` || first || 'U';
    return combined.toUpperCase();
  }

  toggleEdit(): void {
    const next = !this.isEditing();
    this.isEditing.set(next);
    this.uploadError.set('');
    this.saveError.set('');
    this.saveMessage.set('');
    if (next) {
      this.profileForm.setValue({
        name: this.user()?.name || '',
        email: this.user()?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;
    this.isSaving.set(true);
    this.saveError.set('');
    this.saveMessage.set('');

    const { name, email, currentPassword, newPassword, confirmPassword } = this.profileForm.value;
    const hasPassword = Boolean(currentPassword || newPassword || confirmPassword);

    if (hasPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        this.saveError.set('Fill in all password fields.');
        this.isSaving.set(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        this.saveError.set('New password and confirmation do not match.');
        this.isSaving.set(false);
        return;
      }
      if (newPassword.length < 6) {
        this.saveError.set('New password must be at least 6 characters.');
        this.isSaving.set(false);
        return;
      }
    }

    const profileResult = await this.authService.updateProfileRemote(name || '', email || '');
    if (!profileResult.ok) {
      this.saveError.set(profileResult.message || 'Profile update failed.');
      this.isSaving.set(false);
      return;
    }

    if (hasPassword) {
      const passResult = await this.authService.changePassword(currentPassword || '', newPassword || '');
      if (!passResult.ok) {
        this.saveError.set(passResult.message || 'Password update failed.');
        this.isSaving.set(false);
        return;
      }
    }

    this.saveMessage.set('Profile updated successfully.');
    this.isSaving.set(false);
    this.isEditing.set(false);
  }

  removeAvatar(): void {
    this.authService.updateProfile({ avatarUrl: undefined });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadError.set('');
    try {
      const dataUrl = await this.compressImage(file, 768, 768);
      const sizeBytes = this.dataUrlSize(dataUrl);
      if (sizeBytes > 1024 * 1024) {
        this.uploadError.set('Compressed image is still above 1 MB. Use a smaller image.');
        return;
      }
      this.authService.updateProfile({ avatarUrl: dataUrl });
    } catch {
      this.uploadError.set('Could not process image. Try a different file.');
    } finally {
      input.value = '';
    }
  }

  private dataUrlSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.floor((base64.length * 3) / 4);
  }

  private compressImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('img'));
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          const targetWidth = Math.round(img.width * scale);
          const targetHeight = Math.round(img.height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ctx'));
            return;
          }
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          let quality = 0.85;
          const tryEncode = () => {
            canvas.toBlob(blob => {
              if (!blob) {
                reject(new Error('blob'));
                return;
              }
              if (blob.size <= 1024 * 1024 || quality <= 0.5) {
                const outReader = new FileReader();
                outReader.onload = () => resolve(outReader.result as string);
                outReader.onerror = () => reject(new Error('readout'));
                outReader.readAsDataURL(blob);
              } else {
                quality -= 0.1;
                tryEncode();
              }
            }, 'image/jpeg', quality);
          };

          tryEncode();
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
