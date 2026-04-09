import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoaderComponent],
  template: `
    <div class="login-page">
      <div class="login-container">
        <!-- Left Pitch Panel -->
        <aside class="pitch-panel">
          <div class="pitch-top">
            <div class="brand-badge">
              <img src="/rupee-logo.png" alt="Rupee Logo" class="logo" />
              Rupee
            </div>
            <h1>Smart money tracking for modern life.</h1>
            <p>
              Get clear visibility into where your money goes. Track expenses, monitor income, and
              build better financial habits.
            </p>
          </div>

          <div class="features">
            <div class="feature-item">
              <div class="feature-icon"><mat-icon>bolt</mat-icon></div>
              <div>
                <strong>Lightning Fast Entry</strong>
                <p>Add transactions in seconds with smart categories and quick amounts.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><mat-icon>insights</mat-icon></div>
              <div>
                <strong>Powerful Analytics</strong>
                <p>Visualize spending patterns and track your savings rate over time.</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><mat-icon>lock</mat-icon></div>
              <div>
                <strong>Private & Secure</strong>
                <p>All data stored locally. Your finances stay on your device.</p>
              </div>
            </div>
          </div>

          <div class="pitch-footer">
            <div class="stat-row">
              <div class="stat"><strong>100%</strong><span>Private</span></div>
              <div class="stat-divider"></div>
              <div class="stat"><strong>Free</strong><span>Always</span></div>
              <div class="stat-divider"></div>
              <div class="stat"><strong>Local</strong><span>Storage</span></div>
            </div>
          </div>
        </aside>

        <!-- Auth Card -->
        <section class="auth-panel">
          <div class="auth-card">
            <!-- Mode Switcher -->
            <div class="mode-switcher">
              <button type="button" [class.active]="!isRegisterMode()" (click)="setMode(false)">
                <mat-icon>login</mat-icon>
                Sign In
              </button>
              <button type="button" [class.active]="isRegisterMode()" (click)="setMode(true)">
                <mat-icon>person_add</mat-icon>
                Register
              </button>
            </div>

            <!-- Sign In Form -->
            @if (!isRegisterMode()) {
              <div class="form-header">
                <h2>Welcome back</h2>
                <p>Sign in to your account to continue.</p>
              </div>
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                <div class="input-group">
                  <mat-icon class="input-icon">mail</mat-icon>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="Email address"
                    autocomplete="email"
                  />
                </div>
                <div class="input-group">
                  <mat-icon class="input-icon">lock</mat-icon>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Password"
                    autocomplete="current-password"
                  />
                  <button type="button" class="vis-toggle" (click)="togglePassword()">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>

                @if (errorMessage()) {
                  <div class="error-banner">
                    <mat-icon>error</mat-icon>
                    {{ errorMessage() }}
                  </div>
                }

                <button
                  class="submit-btn"
                  type="submit"
                  [disabled]="loginForm.invalid || isLoading()"
                >
                  @if (isLoading()) {
                    <app-loader size="sm"></app-loader>
                    Signing in...
                  } @else {
                    Sign In
                    <mat-icon>arrow_forward</mat-icon>
                  }
                </button>
              </form>
            }

            <!-- Register Form -->
            @if (isRegisterMode()) {
              <div class="form-header">
                <h2>Create your account</h2>
                <p>Get started for free — no credit card needed.</p>
              </div>
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                <div class="input-group">
                  <mat-icon class="input-icon">person</mat-icon>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="Full name"
                    autocomplete="name"
                  />
                </div>
                <div class="input-group">
                  <mat-icon class="input-icon">mail</mat-icon>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="Email address"
                    autocomplete="email"
                  />
                </div>
                <div class="input-group">
                  <mat-icon class="input-icon">lock</mat-icon>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Password (min. 6 characters)"
                    autocomplete="new-password"
                  />
                  <button type="button" class="vis-toggle" (click)="togglePassword()">
                    <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>

                @if (errorMessage()) {
                  <div class="error-banner">
                    <mat-icon>error</mat-icon>
                    {{ errorMessage() }}
                  </div>
                }

                <button
                  class="submit-btn"
                  type="submit"
                  [disabled]="registerForm.invalid || isLoading()"
                >
                  @if (isLoading()) {
                    <app-loader size="sm"></app-loader>
                    Creating account...
                  } @else {
                    Create Account
                    <mat-icon>arrow_forward</mat-icon>
                  }
                </button>
              </form>
            }

            <div class="demo-cta">
              <mat-icon>info</mat-icon>
              <span
                >Demo account: <strong>demo&#64;example.com</strong> /
                <strong>demo123</strong></span
              >
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .login-container {
      width: 100%;
      max-width: 1100px;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 1.5rem;
      min-height: 620px;
    }

    /* ---- Pitch Panel ---- */
    .pitch-panel {
      background:
        radial-gradient(
          ellipse 380px 200px at 100% 0%,
          color-mix(in srgb, var(--accent) 20%, transparent),
          transparent
        ),
        radial-gradient(
          ellipse 300px 180px at 0% 100%,
          color-mix(in srgb, var(--primary) 15%, transparent),
          transparent
        ),
        linear-gradient(
          145deg,
          color-mix(in srgb, var(--primary) 18%, var(--surface)) 0%,
          var(--surface) 100%
        );
      border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--line));
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--line));
      border-radius: 999px;
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--primary-strong);
      width: fit-content;
      font-family: 'Outfit', sans-serif;
    }

    .brand-badge mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .brand-badge .logo {
      height: 1.1rem;
      width: auto;
    }

    .pitch-top h1 {
      font-size: clamp(1.7rem, 3.5vw, 2.4rem);
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.1;
      max-width: 20ch;
      margin: 1rem 0 0.8rem;
    }

    .pitch-top p {
      color: var(--text-soft);
      font-size: 1.05rem;
      max-width: 38ch;
      line-height: 1.65;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .feature-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
      border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--line));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-strong);
      flex-shrink: 0;
    }

    .feature-icon mat-icon {
      font-size: 1.3rem;
      width: 1.3rem;
      height: 1.3rem;
    }

    .feature-item strong {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }

    .feature-item p {
      font-size: 0.85rem;
      color: var(--text-soft);
      line-height: 1.5;
      margin: 0;
    }

    .pitch-footer {
      margin-top: auto;
    }

    .stat-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.2rem 1.5rem;
      background: color-mix(in srgb, var(--surface) 70%, transparent);
      border: 1px solid var(--line);
      border-radius: 16px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat strong {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 900;
      color: var(--primary-strong);
      letter-spacing: -0.03em;
    }

    .stat span {
      font-size: 0.75rem;
      color: var(--text-soft);
      font-weight: 600;
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: var(--line);
    }

    /* ---- Auth Panel ---- */
    .auth-panel {
      display: flex;
      align-items: center;
    }

    .auth-card {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-xl);
      padding: 2rem;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .mode-switcher {
      display: flex;
      gap: 0.4rem;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 0.3rem;
    }

    .mode-switcher button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.6rem;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text-soft);
      font: inherit;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-switcher button mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .mode-switcher button.active {
      background: var(--surface);
      color: var(--primary-strong);
      box-shadow: var(--shadow-sm);
    }

    .form-header h2 {
      font-size: 1.7rem;
      font-weight: 800;
    }

    .form-header p {
      color: var(--text-soft);
      font-size: 0.9rem;
      margin-top: 0.3rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-soft);
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      pointer-events: none;
    }

    .input-group input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 3rem;
      border: 1.5px solid var(--line);
      border-radius: 12px;
      background: var(--surface-soft);
      color: var(--text);
      font: inherit;
      font-size: 0.95rem;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
    }

    .input-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
      background: var(--surface);
    }

    .vis-toggle {
      position: absolute;
      right: 0.8rem;
      background: none;
      border: none;
      color: var(--text-soft);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .vis-toggle mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.95rem;
      background: linear-gradient(135deg, var(--primary), var(--primary-strong));
      color: white;
      border: none;
      border-radius: 12px;
      font: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 0.4rem;
      transition: all 0.25s ease;
      box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 30%, transparent);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px color-mix(in srgb, var(--primary) 38%, transparent);
      filter: brightness(1.05);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .submit-btn mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: color-mix(in srgb, var(--danger) 10%, var(--surface));
      border: 1px solid color-mix(in srgb, var(--danger) 30%, var(--line));
      border-radius: 10px;
      color: var(--danger);
      font-size: 0.88rem;
      font-weight: 600;
    }

    .error-banner mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .demo-cta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: auto;
      color: var(--text-soft);
      font-size: 0.82rem;
      border-top: 1px solid var(--line);
      padding-top: 1.2rem;
    }

    .demo-cta mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    .demo-cta strong {
      color: var(--primary-strong);
    }

    @media (max-width: 960px) {
      .login-container {
        grid-template-columns: 1fr;
        max-width: 500px;
      }

      .pitch-panel {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  setMode(isRegister: boolean): void {
    this.isRegisterMode.set(isRegister);
    this.errorMessage.set('');
    this.showPassword.set(false);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    try {
      const success = await this.authService.login(email || '', password || '');
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid email or password. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    const { email, password, name } = this.registerForm.value;
    try {
      const success = await this.authService.register(email || '', password || '', name || '');
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('An account with this email already exists.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
