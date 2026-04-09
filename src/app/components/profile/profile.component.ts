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
            <p class="page-subtitle">Manage identity, security, and view your preferences snapshot.</p>
          </div>
          <a routerLink="/settings" class="btn-outline">
            <mat-icon>arrow_back</mat-icon>
            Back to Settings
          </a>
        </header>

        <section class="profile-grid">
          <div class="main-column">
            <!-- Hero Card -->
            <article class="glass-card panel hero-panel">
              <div class="profile-hero">
                <div class="avatar-container">
                  <div class="avatar-ring"></div>
                  <div class="avatar" [class.with-image]="!!avatarUrl()">
                    @if (avatarUrl()) {
                      <img [src]="avatarUrl()" alt="Profile image">
                    } @else {
                      {{ initials() }}
                    }
                  </div>
                  <button class="edit-avatar-btn" type="button" (click)="fileInputHero.click()" aria-label="Edit Profile Image">
                    <mat-icon>photo_camera</mat-icon>
                  </button>
                  <input #fileInputHero type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
                </div>
                <div class="hero-info">
                  <h2>{{ userName() }}</h2>
                  <p>{{ userEmail() }}</p>
                  <div class="identity-chips">
                    <span class="chip-active">Active</span>
                    <span class="chip-currency">{{ settingsService.currency() }} default</span>
                  </div>
                </div>
              </div>
            </article>

            <!-- Stats & Security Card -->
            <article class="glass-card panel">
              <div class="panel-header">
                <mat-icon class="panel-icon">admin_panel_settings</mat-icon>
                <h3>Account Details</h3>
                <button class="btn-ghost icon-only-btn ml-auto" type="button" (click)="toggleEdit()" [title]="isEditing() ? 'Cancel' : 'Edit'">
                  <mat-icon>{{ isEditing() ? 'close' : 'edit' }}</mat-icon>
                </button>
              </div>

              @if (!isEditing()) {
                <div class="stats-grid">
                  <article class="mini-stat">
                    <div class="stat-icon-wrap"><mat-icon>badge</mat-icon></div>
                    <div class="stat-content">
                      <span class="label">User ID</span>
                      <strong class="break-text">{{ userId() }}</strong>
                    </div>
                  </article>
                  <article class="mini-stat">
                    <div class="stat-icon-wrap"><mat-icon>verified_user</mat-icon></div>
                    <div class="stat-content">
                      <span class="label">Status</span>
                      <strong>Secure</strong>
                    </div>
                  </article>
                  <article class="mini-stat">
                    <div class="stat-icon-wrap"><mat-icon>schedule</mat-icon></div>
                    <div class="stat-content">
                      <span class="label">Last Sign-In</span>
                      <strong>Local Session</strong>
                    </div>
                  </article>
                  <article class="mini-stat">
                    <div class="stat-icon-wrap"><mat-icon>shield</mat-icon></div>
                    <div class="stat-content">
                      <span class="label">Protection</span>
                      <strong>Active</strong>
                    </div>
                  </article>
                </div>
              } @else {
                <!-- Edit Form -->
                <form class="edit-form fade-in" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  
                  <div class="form-section">
                    <h4>Personal Information</h4>
                    <div class="input-group">
                      <mat-icon class="input-icon">person</mat-icon>
                      <input type="text" formControlName="name" placeholder="Full Name">
                    </div>
                    <div class="input-group">
                      <mat-icon class="input-icon">mail</mat-icon>
                      <input type="email" formControlName="email" placeholder="Email Address">
                    </div>
                  </div>

                  <div class="form-section password-section">
                    <h4>Update Password <small>(Optional)</small></h4>
                    <div class="input-group">
                      <mat-icon class="input-icon">lock_outline</mat-icon>
                      <input type="password" formControlName="currentPassword" placeholder="Current Password">
                    </div>
                    <div class="input-group">
                      <mat-icon class="input-icon">vpn_key</mat-icon>
                      <input type="password" formControlName="newPassword" placeholder="New Password">
                    </div>
                    <div class="input-group">
                      <mat-icon class="input-icon">check_circle_outline</mat-icon>
                      <input type="password" formControlName="confirmPassword" placeholder="Confirm New Password">
                    </div>
                  </div>

                  @if (saveMessage()) {
                    <div class="alert alert-success">
                      <mat-icon>check_circle</mat-icon>
                      {{ saveMessage() }}
                    </div>
                  }
                  @if (saveError()) {
                    <div class="alert alert-error">
                      <mat-icon>error</mat-icon>
                      {{ saveError() }}
                    </div>
                  }

                  <div class="form-actions">
                    <button class="btn-outline" type="button" (click)="toggleEdit()">Cancel</button>
                    <button class="btn-solid" type="submit" [disabled]="profileForm.invalid || isSaving()">
                      @if (isSaving()) {
                        <app-loader size="sm"></app-loader>
                        Saving...
                      } @else {
                        <mat-icon>save</mat-icon>
                        Save Changes
                      }
                    </button>
                  </div>
                </form>
              }
            </article>

            <!-- Dangerous Zone -->
            <article class="glass-card panel danger-panel">
              <div class="panel-header">
                <mat-icon class="panel-icon danger-icon">warning_amber</mat-icon>
                <h3 class="danger-text">Danger Zone</h3>
              </div>
              <p class="desc">Remove your profile avatar or permanently delete your local data. Use with caution.</p>
              
              <div class="danger-actions">
                <button class="btn-ghost danger-btn" type="button" (click)="removeAvatar()" [disabled]="!avatarUrl()">
                  <mat-icon>no_photography</mat-icon>
                  Remove Avatar
                </button>
                <button class="btn-ghost danger-btn" type="button" (click)="handleLogout()">
                  <mat-icon>logout</mat-icon>
                  Sign Out
                </button>
              </div>
            </article>
          </div>

          <!-- Sidebar Preference Snapshot -->
          <div class="sidebar-column">
            <article class="glass-card panel sticky-snapshot">
              <div class="panel-header">
                <mat-icon class="panel-icon">data_usage</mat-icon>
                <h3>App Snapshot</h3>
              </div>
              <p class="desc mb-3">Live view of your current configuration.</p>

              <div class="snapshot-list">
                <div class="snapshot-row">
                  <div class="snap-left">
                    <mat-icon>palette</mat-icon>
                    <span>Theme Color</span>
                  </div>
                  <strong>{{ settingsService.themeColor() }}</strong>
                </div>
                
                <div class="snapshot-row">
                  <div class="snap-left">
                    <mat-icon>dark_mode</mat-icon>
                    <span>Dark Mode</span>
                  </div>
                  <strong>{{ settingsService.darkMode() ? 'On' : 'Off' }}</strong>
                </div>

                <div class="snapshot-row">
                  <div class="snap-left">
                    <mat-icon>payments</mat-icon>
                    <span>Currency</span>
                  </div>
                  <strong>{{ settingsService.currency() }} ({{ settingsService.currencySymbol() }})</strong>
                </div>

                <div class="snapshot-row">
                  <div class="snap-left">
                    <mat-icon>notifications</mat-icon>
                    <span>Notifications</span>
                  </div>
                  <strong [class.text-success]="settingsService.notification()">
                    {{ settingsService.notification() ? 'Enabled' : 'Disabled' }}
                  </strong>
                </div>
              </div>

              <div class="payment-sources-mini">
                <h4>Payment Methods Setup</h4>
                
                <div class="source-mini-row">
                  <span class="source-lbl"><mat-icon>account_balance</mat-icon> Banks</span>
                  <span class="source-count">{{ settingsService.bankAccounts().length }}</span>
                </div>
                <div class="source-pills-mini">
                  @if (settingsService.bankAccounts().length === 0) { <span class="pill-muted">None</span> }
                  @for (acc of settingsService.bankAccounts(); track acc) { <span class="pill-mini">{{ acc }}</span> }
                </div>

                <div class="source-mini-row mt-2">
                  <span class="source-lbl"><mat-icon>credit_card</mat-icon> Cards</span>
                  <span class="source-count">{{ settingsService.cards().length }}</span>
                </div>
                <div class="source-pills-mini">
                  @if (settingsService.cards().length === 0) { <span class="pill-muted">None</span> }
                  @for (card of settingsService.cards(); track card) { <span class="pill-mini">{{ card }}</span> }
                </div>
              </div>

              <a routerLink="/settings" class="btn-solid full-w mt-4">
                <mat-icon>tune</mat-icon>
                Adjust Settings
              </a>
            </article>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      animation: fadeInForm 0.3s ease-out forwards;
    }

    @keyframes fadeInForm {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 2.2rem;
      background: linear-gradient(135deg, var(--text), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.2rem;
    }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
    }
    
    .btn-outline mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
      align-items: start;
    }

    .glass-card {
      background: color-mix(in srgb, var(--surface) 75%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--line) 60%, #fff 20%);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
      margin-bottom: 1.5rem;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }

    .panel-icon {
      color: var(--primary);
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }
    
    .danger-icon {
      color: var(--danger);
    }

    .panel-header h3 {
      font-size: 1.25rem;
      margin: 0;
      font-weight: 700;
    }

    .danger-text {
      color: var(--danger);
    }

    .ml-auto {
      margin-left: auto;
    }

    .icon-only-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .icon-only-btn:hover {
      background: var(--surface-soft);
      border-color: var(--line);
    }

    .desc {
      color: var(--text-soft);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .mb-3 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.8rem; }
    
    .full-w {
      width: 100%;
      justify-content: center;
    }

    /* Hero Panel */
    .hero-panel {
      padding: 2rem;
      background:
        radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 50%),
        color-mix(in srgb, var(--surface) 75%, transparent);
    }

    .profile-hero {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .avatar-container {
      position: relative;
      width: 100px;
      height: 100px;
    }

    .avatar-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      opacity: 0.5;
      animation: pulseRing 3s infinite alternate ease-in-out;
    }

    @keyframes pulseRing {
      0% { transform: scale(1); opacity: 0.3; }
      100% { transform: scale(1.05); opacity: 0.6; }
    }

    .avatar {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--primary);
      overflow: hidden;
      border: 3px solid var(--surface);
      z-index: 2;
    }

    .avatar.with-image {
      background: transparent;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .edit-avatar-btn {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3px solid var(--surface);
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 3;
      transition: transform 0.2s;
    }

    .edit-avatar-btn:hover {
      transform: scale(1.1);
    }

    .edit-avatar-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .hero-info h2 {
      font-size: 1.8rem;
      margin: 0;
      font-weight: 800;
      color: var(--text);
    }

    .hero-info p {
      color: var(--text-soft);
      font-size: 1.05rem;
      margin: 0.2rem 0 0.8rem;
    }

    .identity-chips {
      display: flex;
      gap: 0.5rem;
    }

    .chip-active {
      background: color-mix(in srgb, var(--success) 15%, transparent);
      color: var(--success);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
    }

    .chip-currency {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary-strong);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .mini-stat {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem;
      background: var(--surface-soft);
      border-radius: var(--radius-md);
      border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
      transition: transform 0.2s;
    }

    .mini-stat:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .label {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }

    .mini-stat strong {
      font-size: 1rem;
      color: var(--text);
    }

    .break-text {
      word-break: break-all;
    }

    /* Edit Form */
    .edit-form {
      padding-top: 0.5rem;
    }

    .form-section {
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-section h4 {
      margin: 0 0 1rem;
      font-size: 1.05rem;
      color: var(--text);
    }

    .input-group {
      position: relative;
      margin-bottom: 1rem;
    }

    .input-group:last-child {
      margin-bottom: 0;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-soft);
      font-size: 1.2rem;
    }

    .input-group input {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 3rem;
      background: var(--surface);
      border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
      border-radius: 10px;
      font-family: inherit;
      color: var(--text);
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent);
    }

    .alert {
      padding: 0.8rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .alert-success {
      background: color-mix(in srgb, var(--success) 12%, transparent);
      color: color-mix(in srgb, var(--success) 80%, var(--text));
      border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
    }
    
    .alert-error {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
      color: color-mix(in srgb, var(--danger) 80%, var(--text));
      border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    /* Danger actions */
    .danger-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .danger-btn {
      color: var(--danger);
      border: 1px solid color-mix(in srgb, var(--danger) 50%, transparent);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .danger-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
    }
    
    .danger-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sidebar Snapshot */
    .sticky-snapshot {
      position: sticky;
      top: 1rem;
    }

    .snapshot-list {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-bottom: 2rem;
    }

    .snapshot-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.8rem;
      border-bottom: 1px dashed color-mix(in srgb, var(--line) 60%, transparent);
    }

    .snapshot-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .snap-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--text-soft);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .snap-left mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .snapshot-row strong {
      font-size: 0.95rem;
      color: var(--text);
    }

    .text-success {
      color: var(--success) !important;
    }

    .payment-sources-mini {
      background: var(--surface-soft);
      border-radius: 12px;
      padding: 1.2rem;
      border: 1px solid var(--line);
    }

    .payment-sources-mini h4 {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .source-mini-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .source-lbl {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--text-soft);
      font-weight: 600;
    }

    .source-lbl mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .source-count {
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      color: var(--primary);
      font-weight: 800;
      font-size: 0.75rem;
      padding: 0.1rem 0.5rem;
      border-radius: 10px;
    }

    .source-pills-mini {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .pill-mini {
      background: var(--surface);
      border: 1px solid var(--line);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      color: var(--text);
    }

    .pill-muted {
      background: transparent;
      border: 1px dashed var(--line);
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      color: var(--text-soft);
      font-style: italic;
    }

    @media (max-width: 980px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      
      .sticky-snapshot {
        position: static;
      }
    }

    @media (max-width: 600px) {
      .profile-hero {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }
      
      .identity-chips {
        justify-content: center;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .form-actions button {
        width: 100%;
        justify-content: center;
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
    return name.trim()[0].toUpperCase();
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

  handleLogout(): void {
    // Basic logout logic to demonstrate app capability 
    this.authService.logout();
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
          if (!ctx) return reject(new Error('no context'));
          
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          // Auto-compress jpeg
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
