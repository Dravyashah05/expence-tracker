import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
        <a class="brand" routerLink="/dashboard">
          <span class="brand-mark">
            <img src="/rupee-logo.png" alt="Rupee logo">
          </span>
          <span>
            <strong>Rupee</strong>
            <small>Personal finance cockpit</small>
          </span>
        </a>

        <nav class="links">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/add-transaction" routerLinkActive="active">Add</a>
          <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
          <a routerLink="/export" routerLinkActive="active">Export</a>
          <a routerLink="/settings" routerLinkActive="active">Settings</a>
        </nav>

        <a class="profile-chip" routerLink="/settings/profile">
          <span class="avatar">
            @if (authService.user()?.avatarUrl) {
              <img [src]="authService.user()?.avatarUrl" alt="Profile">
            } @else {
              {{ initials() }}
            }
          </span>
          <span class="name">{{ authService.user()?.name || 'User' }}</span>
        </a>

        <button class="logout" type="button" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Sign out
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0.65rem;
      z-index: 30;
    }

    .nav-wrap {
      width: min(1160px, calc(100% - 2rem));
      margin: 0 auto;
    }

    .nav-shell {
      background: color-mix(in srgb, var(--surface) 90%, transparent);
      border: 1px solid var(--line);
      box-shadow: var(--shadow-sm);
      border-radius: 18px;
      min-height: 70px;
      padding: 0.55rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      min-width: 232px;
    }

    .brand strong {
      display: block;
      font-family: 'Outfit', sans-serif;
      font-size: 0.96rem;
      color: var(--text);
    }

    .brand small {
      color: var(--text-soft);
      font-size: 0.73rem;
    }

    .brand-mark {
      width: 34px;
      height: 34px;
      border-radius: 11px;
      background: linear-gradient(145deg, var(--primary), var(--accent));
      display: grid;
      place-items: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .brand-mark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      background: #fff;
    }

    .links {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.3rem;
    }

    .links a {
      text-decoration: none;
      padding: 0.52rem 0.78rem;
      border-radius: 10px;
      color: var(--text-soft);
      font-weight: 700;
      font-size: 0.86rem;
    }

    .links a:hover {
      color: var(--text);
      background: var(--surface-soft);
    }

    .links a.active {
      color: var(--primary-strong);
      background: color-mix(in srgb, var(--primary) 12%, var(--surface));
      border: 1px solid color-mix(in srgb, var(--primary) 22%, var(--line));
    }

    .profile-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.84rem;
      max-width: 180px;
    }

    .profile-chip .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-chip .avatar {
      width: 26px;
      height: 26px;
      border-radius: 9px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      overflow: hidden;
      flex-shrink: 0;
    }

    .profile-chip .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .logout {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.54rem 0.88rem;
      background: var(--surface-soft);
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: 0.32rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .logout mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }

    @media (max-width: 980px) {
      :host {
        top: 0.35rem;
      }

      .nav-wrap {
        width: calc(100% - 1rem);
      }

      .nav-shell {
        padding: 0.62rem;
        flex-direction: column;
        align-items: stretch;
      }

      .brand {
        min-width: 0;
      }

      .links {
        justify-content: flex-start;
      }

      .profile-chip {
        align-self: flex-start;
      }

      .logout {
        align-self: flex-end;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  initials(): string {
    const name = this.authService.user()?.name || '';
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    const combined = `${first}${last}` || first || 'U';
    return combined.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
