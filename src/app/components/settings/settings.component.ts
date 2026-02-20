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

            <section class="currency-panel">
              <div class="currency-head">
                <div>
                  <p class="currency-kicker">Primary Currency</p>
                  <p class="currency-title">{{ selectedCurrencyLabel() }}</p>
                </div>
                <span class="currency-badge">{{ settingsService.currencySymbol() }}</span>
              </div>

              <label class="currency-select-row">
                <span>Choose Currency</span>
                <div class="currency-select-wrap">
                  <select class="currency-select" [value]="settingsService.currency()" (change)="onCurrencyChange($event)">
                    @for (curr of settingsService.currencies; track curr.code) {
                      <option [value]="curr.code">{{ curr.label }}</option>
                    }
                  </select>
                </div>
              </label>

              <p class="currency-preview">Preview: {{ formattedCurrencyPreview() }}</p>

              <div class="quick-currencies">
                @for (code of quickCurrencyCodes; track code) {
                  <button
                    type="button"
                    class="quick-chip"
                    [class.active]="settingsService.currency() === code"
                    (click)="setCurrency(code)"
                  >
                    {{ code }}
                  </button>
                }
              </div>
            </section>

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

          <section class="surface-card panel">
            <div class="sources-head">
              <div>
                <h2>Payment Sources</h2>
                <p class="helper-text">Add multiple bank accounts and cards to use while creating transactions.</p>
              </div>
              <span class="count-chip">{{ totalSources() }} total</span>
            </div>

            <div class="source-card">
              <div class="source-title-row">
                <strong>Bank Accounts</strong>
                <small>{{ settingsService.bankAccounts().length }} saved</small>
              </div>
              <div class="merge-row">
                <input
                  type="text"
                  [value]="newBankAccount"
                  (input)="onBankInput($event)"
                  placeholder="e.g. Chase Checking"
                  (keydown.enter)="addBankAccount($event)"
                >
                <button type="button" class="btn-outline add-btn" (click)="addBankAccount()" [disabled]="!canAddBankAccount(newBankAccount)">Add</button>
              </div>
              <small class="input-hint">Tip: press Enter to add quickly.</small>
              @if (bankInputError) {
                <p class="error-text">{{ bankInputError }}</p>
              }

              @if (settingsService.bankAccounts().length === 0) {
                <div class="empty-source">No bank accounts added yet.</div>
              } @else {
                <div class="tag-list">
                  @for (account of settingsService.bankAccounts(); track account) {
                    <div class="tag">
                      <span class="tag-text">{{ account }}</span>
                      <button type="button" class="tag-remove" (click)="removeBankAccount(account)" aria-label="Remove bank account">x</button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="source-card">
              <div class="source-title-row">
                <strong>Cards</strong>
                <small>{{ settingsService.cards().length }} saved</small>
              </div>
              <div class="merge-row">
                <input
                  type="text"
                  [value]="newCard"
                  (input)="onCardInput($event)"
                  placeholder="e.g. HDFC Visa 4421"
                  (keydown.enter)="addCard($event)"
                >
                <button type="button" class="btn-outline add-btn" (click)="addCard()" [disabled]="!canAddCard(newCard)">Add</button>
              </div>
              <small class="input-hint">Tip: add card name and last 4 digits for easy selection.</small>
              @if (cardInputError) {
                <p class="error-text">{{ cardInputError }}</p>
              }

              @if (settingsService.cards().length === 0) {
                <div class="empty-source">No cards added yet.</div>
              } @else {
                <div class="tag-list">
                  @for (card of settingsService.cards(); track card) {
                    <div class="tag">
                      <span class="tag-text">{{ card }}</span>
                      <button type="button" class="tag-remove" (click)="removeCard(card)" aria-label="Remove card">x</button>
                    </div>
                  }
                </div>
              }
            </div>
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

    input {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text);
      padding: 0.7rem;
      font: inherit;
    }

    .currency-panel {
      border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--line));
      border-radius: 16px;
      background:
        radial-gradient(220px 100px at 90% 10%, color-mix(in srgb, var(--primary) 13%, transparent), transparent),
        color-mix(in srgb, var(--surface) 90%, transparent);
      padding: 0.78rem;
      display: grid;
      gap: 0.62rem;
    }

    .currency-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
    }

    .currency-kicker {
      margin: 0;
      color: var(--text-soft);
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .currency-title {
      margin: 0.1rem 0 0;
      color: var(--text);
      font-size: 1rem;
      font-weight: 800;
    }

    .currency-badge {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary-strong));
      border: 1px solid color-mix(in srgb, var(--primary) 60%, var(--line));
      font-size: 0.95rem;
      font-weight: 800;
      box-shadow: 0 8px 14px color-mix(in srgb, var(--primary) 22%, transparent);
    }

    .currency-select-row {
      display: grid;
      gap: 0.34rem;
    }

    .currency-select-wrap {
      position: relative;
    }

    .currency-select {
      border: 1px solid color-mix(in srgb, var(--line) 75%, #fff 25%);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text);
      padding: 0.65rem 0.72rem;
      font: inherit;
      font-weight: 700;
      width: 100%;
    }

    .currency-preview {
      margin: 0;
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .quick-currencies {
      display: flex;
      flex-wrap: wrap;
      gap: 0.34rem;
    }

    .quick-chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text-soft);
      font: inherit;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.28rem 0.62rem;
      cursor: pointer;
    }

    .quick-chip.active {
      color: var(--primary-strong);
      border-color: color-mix(in srgb, var(--primary) 55%, var(--line));
      background: color-mix(in srgb, var(--primary) 11%, var(--surface));
    }

    .sources-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.7rem;
      flex-wrap: wrap;
    }

    .count-chip {
      border: 1px solid color-mix(in srgb, var(--primary) 45%, var(--line));
      background: color-mix(in srgb, var(--primary) 14%, var(--surface));
      color: var(--primary-strong);
      border-radius: 999px;
      padding: 0.26rem 0.58rem;
      font-size: 0.76rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .source-card {
      display: grid;
      gap: 0.45rem;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: color-mix(in srgb, var(--surface) 92%, transparent);
      padding: 0.7rem;
    }

    .source-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
    }

    .source-title-row strong {
      color: var(--text);
      font-size: 0.9rem;
    }

    .source-title-row small {
      color: var(--text-soft);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .merge-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.45rem;
    }

    .add-btn {
      padding: 0.55rem 0.74rem;
      border-radius: 10px;
    }

    .input-hint {
      color: var(--text-soft);
      font-size: 0.74rem;
      font-weight: 600;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      min-height: 1.8rem;
      align-items: center;
      margin-top: 0.14rem;
    }

    .tag {
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--primary) 11%, var(--surface));
      color: var(--text);
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 0.28rem;
      padding: 0.2rem 0.3rem 0.2rem 0.58rem;
    }

    .tag-text {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.2;
    }

    .tag-remove {
      border: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: color-mix(in srgb, var(--surface) 55%, var(--line));
      color: var(--text-soft);
      font-size: 0.72rem;
      font-weight: 800;
      line-height: 1;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .tag-remove:hover {
      background: color-mix(in srgb, var(--danger) 24%, var(--surface));
      color: var(--danger);
    }

    .empty-source {
      border: 1px dashed var(--line);
      border-radius: 12px;
      background: var(--surface-soft);
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.62rem 0.68rem;
    }

    .error-text {
      margin: 0;
      color: var(--danger);
      font-size: 0.76rem;
      font-weight: 700;
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
  quickCurrencyCodes = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD'];
  newBankAccount = '';
  newCard = '';
  bankInputError = '';
  cardInputError = '';

  toggleDarkMode(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('darkMode', target.checked);
  }

  onCurrencyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.settingsService.updateSetting('currency', target.value);
  }

  setCurrency(code: string): void {
    this.settingsService.updateSetting('currency', code);
  }

  selectedCurrencyLabel(): string {
    const code = this.settingsService.currency();
    return this.settingsService.currencies.find(c => c.code === code)?.label || code;
  }

  formattedCurrencyPreview(): string {
    return this.settingsService.getFormattedCurrency(12345.67);
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
    this.settingsService.updateSetting('notification', true);
    this.settingsService.updateSetting('autoSave', true);
    this.settingsService.updateSetting('themeColor', 'Blue');
    this.settingsService.updateSetting('bankAccounts', []);
    this.settingsService.updateSetting('cards', []);
  }

  onBankInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newBankAccount = target.value;
    this.bankInputError = '';
  }

  onCardInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newCard = target.value;
    this.cardInputError = '';
  }

  addBankAccount(event?: Event): void {
    event?.preventDefault();
    const value = this.normalizeSourceName(this.newBankAccount);
    const error = this.validateSource(value, this.settingsService.bankAccounts());
    if (error) {
      this.bankInputError = error;
      return;
    }
    this.settingsService.addBankAccount(value);
    this.newBankAccount = '';
    this.bankInputError = '';
  }

  addCard(event?: Event): void {
    event?.preventDefault();
    const value = this.normalizeSourceName(this.newCard);
    const error = this.validateSource(value, this.settingsService.cards());
    if (error) {
      this.cardInputError = error;
      return;
    }
    this.settingsService.addCard(value);
    this.newCard = '';
    this.cardInputError = '';
  }

  removeBankAccount(name: string): void {
    this.settingsService.removeBankAccount(name);
  }

  removeCard(name: string): void {
    this.settingsService.removeCard(name);
  }

  canAddBankAccount(value: string): boolean {
    const clean = this.normalizeSourceName(value);
    return !this.validateSource(clean, this.settingsService.bankAccounts());
  }

  canAddCard(value: string): boolean {
    const clean = this.normalizeSourceName(value);
    return !this.validateSource(clean, this.settingsService.cards());
  }

  totalSources(): number {
    return this.settingsService.bankAccounts().length + this.settingsService.cards().length;
  }

  private normalizeSourceName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private validateSource(value: string, existing: string[]): string | null {
    if (!value) return 'Please enter a name.';
    if (value.length < 3) return 'Use at least 3 characters.';
    const duplicate = existing.some(item => item.toLowerCase() === value.toLowerCase());
    if (duplicate) return 'This source already exists.';
    return null;
  }
}
