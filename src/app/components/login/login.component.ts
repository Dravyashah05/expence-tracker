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
    <section class="page-shell login-shell">
      <div class="login-grid">
        <aside class="pitch">
          <p class="eyebrow">Expense Tracker</p>
          <h1>Modern money habits start with clear daily visibility.</h1>
          <p class="text-muted">Review income, spot spending patterns, and keep your cashflow under control in one clean workspace.</p>

          <div class="feature-list">
            <article>
              <mat-icon>bolt</mat-icon>
              <span>Fast entry flow</span>
            </article>
            <article>
              <mat-icon>insights</mat-icon>
              <span>Simple analytics</span>
            </article>
            <article>
              <mat-icon>verified_user</mat-icon>
              <span>Private local storage</span>
            </article>
          </div>
        </aside>

        <section class="auth-card surface-card">
          <div class="switch">
            <button type="button" [class.active]="!isRegisterMode()" (click)="setMode(false)">Sign In</button>
            <button type="button" [class.active]="isRegisterMode()" (click)="setMode(true)">Register</button>
          </div>

          @if (!isRegisterMode()) {
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="form-grid">
              <label>
                <span>Email</span>
                <input type="email" formControlName="email" placeholder="you@example.com">
              </label>
              <label>
                <span>Password</span>
                <input type="password" formControlName="password" placeholder="Minimum 6 characters">
              </label>
              @if (errorMessage()) {
                <p class="error">{{ errorMessage() }}</p>
              }
              <button class="btn-solid" type="submit" [disabled]="loginForm.invalid || isLoading()">
                @if (isLoading()) {
                  <app-loader size="sm"></app-loader>
                  Signing in...
                } @else {
                  Continue
                }
              </button>
            </form>
          }

          @if (isRegisterMode()) {
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="form-grid">
              <label>
                <span>Full Name</span>
                <input type="text" formControlName="name" placeholder="Your name">
              </label>
              <label>
                <span>Email</span>
                <input type="email" formControlName="email" placeholder="you@example.com">
              </label>
              <label>
                <span>Password</span>
                <input type="password" formControlName="password" placeholder="Minimum 6 characters">
              </label>
              @if (errorMessage()) {
                <p class="error">{{ errorMessage() }}</p>
              }
              <button class="btn-solid" type="submit" [disabled]="registerForm.invalid || isLoading()">
                @if (isLoading()) {
                  <app-loader size="sm"></app-loader>
                  Creating account...
                } @else {
                  Create Account
                }
              </button>
            </form>
          }

          <p class="demo">Demo: demo@example.com / demo123</p>
        </section>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-shell {
      min-height: calc(100vh - 2.3rem);
      display: grid;
      align-content: center;
    }

    .login-grid {
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 1rem;
      padding: 1rem;
    }

    .pitch {
      border-radius: var(--radius-md);
      padding: 1.35rem;
      background:
        radial-gradient(380px 180px at 90% 0%, rgba(245, 158, 11, 0.24), transparent),
        linear-gradient(145deg, color-mix(in srgb, var(--primary) 20%, var(--surface)) 0%, var(--surface-soft) 100%);
      border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--line));
      display: grid;
      align-content: start;
      gap: 0.72rem;
    }

    .eyebrow {
      width: fit-content;
      font-size: 0.74rem;
      font-weight: 700;
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      background: color-mix(in srgb, var(--primary) 20%, transparent);
      color: var(--primary-strong);
    }

    h1 {
      font-size: clamp(1.55rem, 3.5vw, 2.35rem);
      line-height: 1.1;
      max-width: 16ch;
    }

    .feature-list {
      margin-top: 0.6rem;
      display: grid;
      gap: 0.55rem;
    }

    .feature-list article {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      padding: 0.44rem 0.7rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--primary) 18%, var(--line));
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      font-weight: 600;
    }

    .feature-list mat-icon {
      width: 17px;
      height: 17px;
      font-size: 17px;
      color: var(--primary-strong);
    }

    .auth-card {
      padding: 1rem;
      display: grid;
      gap: 0.75rem;
    }

    .switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.23rem;
    }

    .switch button {
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--text-soft);
      font: inherit;
      font-weight: 700;
      padding: 0.5rem;
      cursor: pointer;
    }

    .switch button.active {
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .form-grid {
      display: grid;
      gap: 0.62rem;
    }

    label {
      display: grid;
      gap: 0.32rem;
    }

    label span {
      color: var(--text-soft);
      font-weight: 700;
      font-size: 0.81rem;
    }

    input {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text);
      font: inherit;
      padding: 0.7rem 0.82rem;
    }

    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
    }

    .btn-solid {
      width: 100%;
      margin-top: 0.18rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .error {
      margin: 0;
      color: var(--danger);
      font-size: 0.84rem;
      font-weight: 600;
    }

    .demo {
      text-align: center;
      font-size: 0.79rem;
      color: var(--text-soft);
      border-top: 1px solid var(--line);
      padding-top: 0.65rem;
    }

    @media (max-width: 980px) {
      .login-shell {
        min-height: calc(100vh - 1.2rem);
      }

      .login-grid {
        grid-template-columns: 1fr;
        padding: 0.8rem;
      }

      h1 {
        max-width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegisterMode = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  setMode(isRegister: boolean): void {
    this.isRegisterMode.set(isRegister);
    this.errorMessage.set('');
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
        this.errorMessage.set('Invalid email or password');
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
        this.errorMessage.set('Email already exists');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
