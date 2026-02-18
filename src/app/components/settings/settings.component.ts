import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">Control app appearance and localization preferences.</p>
          </div>
          <a routerLink="/dashboard" class="btn-outline">Back</a>
        </header>

        <div class="grid-two">
          <section class="surface-card panel profile-panel">
            <div>
              <h2>Profile</h2>
              <p class="helper-text">Manage account details and preferences snapshot.</p>
            </div>
            <div class="profile-meta">
              <div>
                <span class="label">Signed in as</span>
                <strong>{{ authService.user()?.name || 'User' }}</strong>
                <small>{{ authService.user()?.email || 'No email' }}</small>
              </div>
              <a routerLink="/settings/profile" class="btn-solid">Open Profile</a>
            </div>
          </section>

          <section class="surface-card panel">
            <h2>Appearance</h2>

            <label class="row switch-row">
              <span>
                <strong>Dark mode</strong>
                <small>Switch between light and dark palette.</small>
              </span>
              <input type="checkbox" [checked]="settingsService.darkMode()" (change)="toggleDarkMode($event)">
            </label>

            <label>
              <span>Theme color</span>
              <select [value]="settingsService.themeColor()" (change)="onThemeColorChange($event)">
                @for (color of settingsService.themeColors; track color) {
                  <option [value]="color">{{ color }}</option>
                }
              </select>
            </label>

            <div class="swatches">
              <span [style.background]="settingsService.currentTheme().primary"></span>
              <span [style.background]="settingsService.currentTheme().secondary"></span>
              <span [style.background]="settingsService.currentTheme().tertiary"></span>
            </div>
          </section>

          <section class="surface-card panel">
            <h2>Localization</h2>

            <label>
              <span>Currency</span>
              <select [value]="settingsService.currency()" (change)="onCurrencyChange($event)">
                @for (curr of settingsService.currencies; track curr.code) {
                  <option [value]="curr.code">{{ curr.label }}</option>
                }
              </select>
            </label>

            <label>
              <span>Language</span>
              <select [value]="settingsService.language()" (change)="onLanguageChange($event)">
                @for (lang of settingsService.languages; track lang) {
                  <option [value]="lang">{{ lang }}</option>
                }
              </select>
            </label>

            <label class="row switch-row">
              <span>
                <strong>Notifications</strong>
                <small>Allow important transaction alerts.</small>
              </span>
              <input type="checkbox" [checked]="settingsService.notification()" (change)="toggleNotifications($event)">
            </label>

            <label class="row switch-row">
              <span>
                <strong>Auto-save</strong>
                <small>Store updates immediately.</small>
              </span>
              <input type="checkbox" [checked]="settingsService.autoSave()" (change)="toggleAutoSave($event)">
            </label>

            <button class="btn-outline" type="button" (click)="resetSettings()">Reset Defaults</button>
          </section>
        </div>
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
      padding: 0.95rem;
      display: grid;
      gap: 0.75rem;
      align-content: start;
    }

    .profile-panel {
      gap: 0.9rem;
    }

    .profile-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
      flex-wrap: wrap;
    }

    .profile-meta strong {
      display: block;
      font-size: 0.95rem;
      color: var(--text);
    }

    .profile-meta small {
      display: block;
      color: var(--text-soft);
      font-size: 0.8rem;
    }

    h2 {
      font-size: 1.08rem;
    }

    .helper-text {
      color: var(--text-soft);
      font-size: 0.86rem;
      margin: 0.1rem 0 0;
    }

    .label {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
    }

    label {
      display: grid;
      gap: 0.36rem;
    }

    label span {
      color: var(--text-soft);
      font-size: 0.83rem;
      font-weight: 700;
    }

    label span strong {
      display: block;
      color: var(--text);
      font-size: 0.9rem;
    }

    label small {
      color: var(--text-soft);
      font-size: 0.79rem;
      font-weight: 500;
    }

    select {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text);
      padding: 0.7rem;
      font: inherit;
    }

    .switch-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.7rem;
      border-bottom: 1px solid var(--line);
      padding: 0.55rem 0;
    }

    .switch-row input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
    }

    .swatches {
      display: inline-flex;
      gap: 0.44rem;
    }

    .swatches span {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--line);
    }

    .btn-outline {
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
export class SettingsComponent {
  settingsService = inject(SettingsService);
  authService = inject(AuthService);

  toggleDarkMode(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('darkMode', target.checked);
  }

  onCurrencyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.settingsService.updateSetting('currency', target.value);
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.settingsService.updateSetting('language', target.value);
  }

  onThemeColorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.settingsService.updateSetting('themeColor', target.value);
  }

  toggleNotifications(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('notification', target.checked);
  }

  toggleAutoSave(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('autoSave', target.checked);
  }

  resetSettings(): void {
    this.settingsService.updateSetting('darkMode', false);
    this.settingsService.updateSetting('currency', 'USD');
    this.settingsService.updateSetting('language', 'English');
    this.settingsService.updateSetting('notification', true);
    this.settingsService.updateSetting('autoSave', true);
    this.settingsService.updateSetting('themeColor', 'Blue');
  }
}
