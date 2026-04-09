import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="nav-wrap">
      <div class="nav-shell">
        <!-- Brand -->
        <a class="brand" routerLink="/dashboard">
          <span class="brand-mark">
            <img src="/rupee-logo.png" alt="Rupee">
          </span>
          <span class="brand-text">
            <strong>Rupee</strong>
            <small>Finance Tracker</small>
          </span>
        </a>

        <!-- Desktop Nav Links -->
        <nav class="links">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/add-transaction" routerLinkActive="active">
            <mat-icon>add_circle</mat-icon>
            <span>Add</span>
          </a>
          <a routerLink="/analytics" routerLinkActive="active">
            <mat-icon>insights</mat-icon>
            <span>Analytics</span>
          </a>
          <a routerLink="/budget-goals" routerLinkActive="active">
            <mat-icon>savings</mat-icon>
            <span>Budgets</span>
          </a>
          <a routerLink="/transactions" routerLinkActive="active">
            <mat-icon>receipt_long</mat-icon>
            <span>All Transactions</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active">
            <mat-icon>tune</mat-icon>
            <span>Settings</span>
          </a>
        </nav>

        <!-- Right Section -->
        <div class="nav-right">
          <a class="profile-chip" routerLink="/settings/profile">
            <span class="avatar">
              @if (authService.user()?.avatarUrl) {
                <img [src]="authService.user()?.avatarUrl" alt="Profile">
              } @else {
                {{ initials() }}
              }
            </span>
            <span class="profile-name">{{ authService.user()?.name || 'User' }}</span>
          </a>

          <button class="logout-btn" type="button" (click)="logout()" title="Sign out">
            <mat-icon>logout</mat-icon>
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle" type="button" (click)="toggleMenu()" aria-label="Toggle menu">
          <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile Nav -->
      @if (menuOpen()) {
        <div class="mobile-nav" (click)="toggleMenu()">
          <a routerLink="/dashboard" routerLinkActive="mobile-active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>dashboard</mat-icon> Dashboard
          </a>
          <a routerLink="/add-transaction" routerLinkActive="mobile-active">
            <mat-icon>add_circle</mat-icon> Add Transaction
          </a>
          <a routerLink="/analytics" routerLinkActive="mobile-active">
            <mat-icon>insights</mat-icon> Analytics
          </a>
          <a routerLink="/transactions" routerLinkActive="mobile-active">
            <mat-icon>receipt_long</mat-icon> All Transactions
          </a>
          <a routerLink="/settings" routerLinkActive="mobile-active">
            <mat-icon>tune</mat-icon> Settings
          </a>
          <a routerLink="/settings/profile" routerLinkActive="mobile-active">
            <mat-icon>person</mat-icon> Profile
          </a>
          <button class="mobile-logout" type="button" (click)="logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0.75rem;
      z-index: 100;
    }

    .nav-wrap {
      width: min(1200px, calc(100% - 2rem));
      margin: 0 auto;
    }

    .nav-shell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.75rem;
      background: color-mix(in srgb, var(--surface) 85%, transparent);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--glass-border, color-mix(in srgb, var(--line) 60%, #fff 20%));
      border-radius: 20px;
      box-shadow: var(--shadow-md);
      min-height: 64px;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      text-decoration: none;
      min-width: 160px;
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-mark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #fff;
    }

    .brand-text strong {
      display: block;
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .brand-text small {
      display: block;
      font-size: 0.72rem;
      color: var(--text-soft);
      font-weight: 500;
    }

    /* Nav Links */
    .links {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
    }

    .links a {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      text-decoration: none;
      padding: 0.48rem 0.75rem;
      border-radius: 10px;
      color: var(--text-soft);
      font-weight: 600;
      font-size: 0.85rem;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .links a mat-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
    }

    .links a:hover {
      color: var(--text);
      background: color-mix(in srgb, var(--surface) 80%, transparent);
    }

    .links a.active {
      color: var(--primary-strong);
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 25%, var(--line));
      font-weight: 700;
    }

    /* Right section */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .profile-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.7rem 0.3rem 0.3rem;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.84rem;
      transition: all 0.2s;
      max-width: 180px;
    }

    .profile-chip:hover {
      border-color: color-mix(in srgb, var(--primary) 40%, var(--line));
      background: color-mix(in srgb, var(--primary) 7%, var(--surface));
    }

    .profile-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.7rem;
      font-weight: 800;
      overflow: hidden;
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logout-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: color-mix(in srgb, var(--danger) 10%, var(--surface));
      border-color: color-mix(in srgb, var(--danger) 35%, var(--line));
      color: var(--danger);
    }

    .logout-btn mat-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
    }

    /* Mobile menu toggle */
    .menu-toggle {
      display: none;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text);
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: auto;
    }

    /* Mobile Nav */
    .mobile-nav {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 16px;
      margin-top: 0.5rem;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      box-shadow: var(--shadow-md);
    }

    .mobile-nav a,
    .mobile-logout {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.7rem 1rem;
      border-radius: 10px;
      color: var(--text);
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s;
    }

    .mobile-nav a:hover,
    .mobile-logout:hover {
      background: var(--surface-soft);
    }

    .mobile-nav a.mobile-active {
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
      color: var(--primary-strong);
      font-weight: 700;
    }

    .mobile-logout {
      color: var(--danger);
      margin-top: 0.3rem;
      border-top: 1px solid var(--line);
      padding-top: 0.8rem;
    }

    @media (max-width: 900px) {
      :host {
        top: 0.5rem;
      }

      .nav-wrap {
        width: calc(100% - 1.2rem);
      }

      .links,
      .nav-right {
        display: none;
      }

      .menu-toggle {
        display: flex;
      }
    }

    @media (min-width: 901px) {
      .menu-toggle {
        display: none;
      }

      .mobile-nav {
        display: none !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  menuOpen = signal(false);

  initials(): string {
    const name = this.authService.user()?.name || '';
    if (!name) return 'U';
    return name.trim()[0].toUpperCase();
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
