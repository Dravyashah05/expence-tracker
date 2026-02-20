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
            <p class="page-subtitle">Review your account details and preference snapshot.</p>
          </div>
          <a routerLink="/settings" class="btn-outline">Back to Settings</a>
        </header>

        <section class="grid-two">
          <article class="surface-card panel">
            <div class="profile-header">
              <div class="avatar">
                @if (avatarUrl()) {
                  <img [src]="avatarUrl()" alt="Profile image">
                } @else {
                  {{ initials() }}
                }
              </div>
              <div>
                <h2>{{ userName() }}</h2>
                <p class="muted">{{ userEmail() }}</p>
              </div>
            </div>

            <div class="detail-list">
              <div>
                <span class="label"><mat-icon>badge</mat-icon>User ID</span>
                <strong>{{ userId() }}</strong>
              </div>
              <div>
                <span class="label"><mat-icon>verified</mat-icon>Status</span>
                <strong>Active</strong>
              </div>
              <div>
                <span class="label"><mat-icon>schedule</mat-icon>Last Sign-In</span>
                <strong>Stored locally</strong>
              </div>
            </div>

            <div class="profile-actions">
              <button class="btn-outline" type="button" (click)="toggleEdit()">
                {{ isEditing() ? 'Cancel' : 'Edit Profile' }}
              </button>
              <button class="btn-solid" type="button" (click)="saveProfile()" [disabled]="profileForm.invalid || isSaving()">
                @if (isSaving()) {
                  <app-loader size="sm"></app-loader>
                  Saving...
                } @else {
                  Save Changes
                }
              </button>
            </div>

            @if (isEditing()) {
              <form class="edit-form" [formGroup]="profileForm">
                <label>
                  <span><mat-icon>person</mat-icon>Full Name</span>
                  <input type="text" formControlName="name" placeholder="Your name">
                </label>
                <label>
                  <span><mat-icon>mail</mat-icon>Email</span>
                  <input type="email" formControlName="email" placeholder="you@example.com">
                </label>

                <div class="upload-card">
                  <div>
                    <strong><mat-icon>photo_camera</mat-icon>Profile Image</strong>
                    <small>JPEG/PNG, max 1 MB after compression.</small>
                  </div>
                  <div class="upload-actions">
                    <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
                    <button class="btn-outline" type="button" (click)="fileInput.click()">Upload</button>
                    <button class="btn-ghost" type="button" (click)="removeAvatar()" [disabled]="!avatarUrl()">Remove</button>
                  </div>
                  @if (uploadError()) {
                    <p class="error">{{ uploadError() }}</p>
                  }
                </div>

                <div class="security-card">
                  <div>
                    <strong><mat-icon>lock</mat-icon>Change Password</strong>
                    <small>Minimum 6 characters.</small>
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
                </div>

                @if (saveMessage()) {
                  <p class="success">{{ saveMessage() }}</p>
                }
                @if (saveError()) {
                  <p class="error">{{ saveError() }}</p>
                }
              </form>
            }
          </article>

          <article class="surface-card panel">
            <h2>Preference Snapshot</h2>
            <div class="detail-list">
              <div>
                <span class="label">Theme</span>
                <strong>{{ settingsService.themeColor() }}</strong>
              </div>
              <div>
                <span class="label">Mode</span>
                <strong>{{ settingsService.darkMode() ? 'Dark' : 'Light' }}</strong>
              </div>
              <div>
                <span class="label">Currency</span>
                <strong>{{ settingsService.currency() }}</strong>
              </div>
              <div>
                <span class="label">Notifications</span>
                <strong>{{ settingsService.notification() ? 'Enabled' : 'Off' }}</strong>
              </div>
              <div>
                <span class="label">Auto-save</span>
                <strong>{{ settingsService.autoSave() ? 'On' : 'Off' }}</strong>
              </div>
              <div>
                <span class="label">Bank Accounts</span>
                <strong>{{ settingsService.bankAccounts().length }}</strong>
              </div>
              <div>
                <span class="label">Cards</span>
                <strong>{{ settingsService.cards().length }}</strong>
              </div>
            </div>

            <a routerLink="/settings" class="btn-solid">Adjust Settings</a>
          </article>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .grid-two {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.95rem;
    }

    .panel {
      padding: 1rem;
      display: grid;
      gap: 0.9rem;
      align-content: start;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .avatar {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: grid;
      place-items: center;
      font-weight: 700;
      color: white;
      letter-spacing: 0.05em;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    h2 {
      font-size: 1.1rem;
      margin: 0;
    }

    .muted {
      color: var(--text-soft);
      font-size: 0.85rem;
      margin: 0.25rem 0 0;
    }

    .detail-list {
      display: grid;
      gap: 0.75rem;
    }

    .detail-list div {
      display: grid;
      gap: 0.2rem;
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

    .profile-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    .profile-actions .btn-solid {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .edit-form {
      margin-top: 0.4rem;
      display: grid;
      gap: 0.7rem;
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

    .upload-card {
      border: 1px dashed var(--line);
      border-radius: 14px;
      padding: 0.75rem;
      display: grid;
      gap: 0.6rem;
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
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 0.75rem;
      display: grid;
      gap: 0.6rem;
      background: color-mix(in srgb, var(--surface) 85%, transparent);
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

    .btn-solid {
      justify-self: start;
    }

    @media (max-width: 920px) {
      .grid-two {
        grid-template-columns: 1fr;
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
