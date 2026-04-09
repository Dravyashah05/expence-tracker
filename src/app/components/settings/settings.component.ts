import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">
              Personalize your app experience and manage your payment sources.
            </p>
          </div>
          <div class="header-actions">
            <button class="btn-outline info-btn" type="button" (click)="openInfo()">
              <mat-icon>info</mat-icon>
              App Info
            </button>
            <a routerLink="/dashboard" class="btn-outline">
              <mat-icon>arrow_back</mat-icon>
              Back
            </a>
          </div>
        </header>

        <div class="settings-layout">
          <div class="settings-main">
            <section class="glass-card panel">
              <div class="panel-header">
                <mat-icon class="panel-icon">palette</mat-icon>
                <h2>Appearance</h2>
              </div>

              <div class="setting-item switch-item">
                <div class="setting-info">
                  <strong>Dark Mode</strong>
                  <small>Switch between light and dark themes</small>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="settingsService.darkMode()"
                    (change)="toggleDarkMode($event)"
                  />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <strong>Color Theme</strong>
                  <small>Choose your preferred accent color</small>
                </div>
                <div class="theme-selector">
                  @for (color of settingsService.themeColors; track color) {
                    <button
                      class="theme-btn"
                      [class.active]="settingsService.themeColor() === color"
                      (click)="setThemeColor(color)"
                      [style.--btn-color]="getThemePreviewColor(color)"
                      [attr.aria-label]="'Set theme to ' + color"
                    >
                      <mat-icon *ngIf="settingsService.themeColor() === color">check</mat-icon>
                    </button>
                  }
                </div>
              </div>
            </section>

            <section class="glass-card panel">
              <div class="panel-header">
                <mat-icon class="panel-icon">public</mat-icon>
                <h2>Localization</h2>
              </div>

              <div class="setting-item currency-section">
                <div class="setting-info">
                  <strong>Primary Currency</strong>
                  <small>Used across all your transactions</small>
                </div>

                <div class="currency-selector-wrap">
                  <div class="currency-preview-box">
                    <span class="currency-symbol">{{ settingsService.currencySymbol() }}</span>
                    <span class="currency-label">{{ selectedCurrencyLabel() }}</span>
                  </div>

                  <select
                    class="styled-select"
                    [value]="settingsService.currency()"
                    (change)="onCurrencyChange($event)"
                  >
                    @for (curr of settingsService.currencies; track curr.code) {
                      <option [value]="curr.code">{{ curr.label }}</option>
                    }
                  </select>
                </div>

                <div class="quick-currencies mt-2">
                  <span class="hint-text">Quick select:</span>
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
              </div>

              <div class="setting-item switch-item">
                <div class="setting-info">
                  <strong>Push Notifications</strong>
                  <small>Receive updates about your budget</small>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="settingsService.notification()"
                    (change)="toggleNotifications($event)"
                  />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-item switch-item">
                <div class="setting-info">
                  <strong>Auto-Save</strong>
                  <small>Automatically save changes to the cloud</small>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="settingsService.autoSave()"
                    (change)="toggleAutoSave($event)"
                  />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-item switch-item">
                <div class="setting-info">
                  <strong>Transaction Sounds</strong>
                  <small>Play audio feedback on new entries</small>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="settingsService.transactionSounds()"
                    (change)="toggleTransactionSounds($event)"
                  />
                  <span class="slider"></span>
                </label>
              </div>

              <div class="setting-item switch-item">
                <div class="setting-info">
                  <strong>Export Data</strong>
                  <small>Download your transaction data in multiple formats</small>
                </div>
                <a
                  routerLink="/export"
                  class="btn-outline"
                  style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; text-decoration: none; border-radius: 8px; border: 1px solid var(--line); color: var(--text);"
                >
                  <mat-icon>download</mat-icon>
                  Export
                </a>
              </div>

              <div class="danger-zone">
                <button class="btn-ghost danger-btn" type="button" (click)="resetSettings()">
                  <mat-icon>restore</mat-icon>
                  Reset to Defaults
                </button>
              </div>
            </section>
          </div>

          <div class="settings-sidebar">
            <section class="glass-card panel admin-card">
              <div class="user-info">
                <div class="avatar-circle">
                  @if (authService.user()?.avatarUrl) {
                    <img [src]="authService.user()?.avatarUrl" alt="Profile" />
                  } @else {
                    {{ getInitials(authService.user()?.name) }}
                  }
                </div>
                <div class="user-details">
                  <h3>{{ authService.user()?.name || 'User' }}</h3>
                  <p>{{ authService.user()?.email || 'No email associated' }}</p>
                </div>
              </div>
              <a routerLink="/settings/profile" class="btn-solid full-width mt-3">
                <mat-icon>manage_accounts</mat-icon>
                Manage Profile
              </a>
            </section>

            <section class="glass-card panel">
              <div class="panel-header payment-header">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <mat-icon class="panel-icon">account_balance_wallet</mat-icon>
                  <h2>Payment Sources</h2>
                </div>
                <span class="count-badge">{{ totalSources() }}</span>
              </div>
              <p class="panel-desc">Manage accounts available for transactions.</p>

              <!-- Bank Accounts -->
              <div class="source-group">
                <h3 class="source-type-title">
                  <mat-icon>account_balance</mat-icon>
                  Bank Accounts
                </h3>

                <div class="add-source-box">
                  <input
                    type="text"
                    [value]="newBankAccount"
                    (input)="onBankInput($event)"
                    placeholder="E.g. Chase Checking"
                    (keydown.enter)="addBankAccount($event)"
                    class="source-input"
                  />
                  <button
                    type="button"
                    class="btn-add"
                    (click)="addBankAccount()"
                    [disabled]="!canAddBankAccount(newBankAccount)"
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                @if (bankInputError) {
                  <p class="error-msg">{{ bankInputError }}</p>
                }

                <div class="source-items">
                  @if (settingsService.bankAccounts().length === 0) {
                    <div class="empty-state">No banks added</div>
                  } @else {
                    @for (account of settingsService.bankAccounts(); track account) {
                      <div class="source-item">
                        @if (editingBankAccount === account) {
                          <input
                            #editBank
                            class="edit-input"
                            [value]="editBankInput"
                            (input)="editBankInput = editBank.value"
                            (keydown.enter)="saveEditBankAccount(account)"
                          />
                          <div class="item-actions">
                            <button class="icon-btn success" (click)="saveEditBankAccount(account)">
                              <mat-icon>check</mat-icon>
                            </button>
                            <button class="icon-btn" (click)="cancelEditBankAccount()">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        } @else {
                          <span class="source-name">{{ account }}</span>
                          <div class="item-actions">
                            <button
                              class="icon-btn"
                              (click)="startEditBankAccount(account)"
                              title="Edit"
                            >
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button
                              class="icon-btn danger"
                              (click)="removeBankAccount(account)"
                              title="Delete"
                            >
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  }
                </div>
              </div>

              <hr class="divider" />

              <!-- Credit Cards -->
              <div class="source-group">
                <h3 class="source-type-title">
                  <mat-icon>credit_card</mat-icon>
                  Credit/Debit Cards
                </h3>

                <div class="add-source-box">
                  <input
                    type="text"
                    [value]="newCard"
                    (input)="onCardInput($event)"
                    placeholder="E.g. Visa x4421"
                    (keydown.enter)="addCard($event)"
                    class="source-input"
                  />
                  <button
                    type="button"
                    class="btn-add"
                    (click)="addCard()"
                    [disabled]="!canAddCard(newCard)"
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                @if (cardInputError) {
                  <p class="error-msg">{{ cardInputError }}</p>
                }

                <div class="source-items">
                  @if (settingsService.cards().length === 0) {
                    <div class="empty-state">No cards added</div>
                  } @else {
                    @for (card of settingsService.cards(); track card) {
                      <div class="source-item">
                        @if (editingCard === card) {
                          <input
                            #editCardEl
                            class="edit-input"
                            [value]="editCardInput"
                            (input)="editCardInput = editCardEl.value"
                            (keydown.enter)="saveEditCard(card)"
                          />
                          <div class="item-actions">
                            <button class="icon-btn success" (click)="saveEditCard(card)">
                              <mat-icon>check</mat-icon>
                            </button>
                            <button class="icon-btn" (click)="cancelEditCard()">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        } @else {
                          <span class="source-name">{{ card }}</span>
                          <div class="item-actions">
                            <button class="icon-btn" (click)="startEditCard(card)" title="Edit">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button
                              class="icon-btn danger"
                              (click)="removeCard(card)"
                              title="Delete"
                            >
                              <mat-icon>delete</mat-icon>
                            </button>
                          </div>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            </section>
          </div>
        </div>

        @if (showInfoModal) {
          <div class="modal-backdrop" (click)="closeInfo()">
            <section class="info-modal glass-card" (click)="$event.stopPropagation()">
              <div class="modal-head">
                <h2>About Rupee</h2>
                <button class="icon-btn" (click)="closeInfo()"><mat-icon>close</mat-icon></button>
              </div>
              <div class="modal-body">
                <p>
                  <strong>Rupee Expense Tracker</strong> is a smart personal finance tool created
                  natively for the modern web.
                </p>
                <div class="social-links mt-3">
                  <a [href]="socialLinks.github" target="_blank" class="btn-outline"
                    >View on GitHub</a
                  >
                </div>
              </div>
            </section>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

    .header-actions {
      display: flex;
      gap: 0.8rem;
    }

    .header-actions .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
    }

    .header-actions .btn-outline mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .settings-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 1.5rem;
    }

    .glass-card {
      background: color-mix(in srgb, var(--surface) 75%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid color-mix(in srgb, var(--line) 60%, #fff 20%);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
    }

    .panel {
      margin-bottom: 1.5rem;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
      padding-bottom: 1rem;
    }

    .panel-icon {
      color: var(--primary);
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .panel-header h2 {
      font-size: 1.3rem;
      margin: 0;
      font-weight: 700;
    }

    .setting-item {
      padding: 1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--line) 40%, transparent);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .switch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .setting-info strong {
      display: block;
      color: var(--text);
      font-size: 1rem;
      margin-bottom: 0.2rem;
    }

    .setting-info small {
      color: var(--text-soft);
      font-size: 0.85rem;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--line);
      transition: 0.3s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    input:checked + .slider {
      background-color: var(--primary);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    /* Themes */
    .theme-selector {
      display: flex;
      gap: 0.8rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .theme-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 3px solid transparent;
      background-color: var(--btn-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition:
        transform 0.2s,
        border-color 0.2s;
    }

    .theme-btn:hover {
      transform: scale(1.1);
    }

    .theme-btn.active {
      border-color: var(--text);
      transform: scale(1.1);
    }

    /* Currency */
    .currency-selector-wrap {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      align-items: center;
    }

    .currency-preview-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: color-mix(in srgb, var(--primary) 10%, var(--surface));
      border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--line));
      padding: 0.6rem 1rem;
      border-radius: 12px;
    }

    .currency-symbol {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--primary);
    }

    .currency-label {
      font-weight: 600;
      color: var(--text);
    }

    .styled-select {
      flex: 1;
      padding: 0.8rem;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--text);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
    }

    .styled-select:focus {
      border-color: var(--primary);
      outline: none;
    }

    .mt-2 {
      margin-top: 0.8rem;
    }
    .mt-3 {
      margin-top: 1.2rem;
    }

    .quick-chip {
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 0.3rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      color: var(--text-soft);
    }

    .quick-chip.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .hint-text {
      font-size: 0.8rem;
      color: var(--text-soft);
      margin-right: 0.5rem;
    }

    /* Sidebar / Sources */
    .admin-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 1.5rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .avatar-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 1rem;
      box-shadow: 0 8px 16px color-mix(in srgb, var(--primary) 30%, transparent);
      overflow: hidden;
    }

    .avatar-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-details h3 {
      margin: 0;
      font-size: 1.3rem;
    }

    .user-details p {
      margin: 0.3rem 0 0;
      color: var(--text-soft);
      font-size: 0.9rem;
    }

    .full-width {
      width: 100%;
      justify-content: center;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .payment-header {
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .count-badge {
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      color: var(--primary);
      font-weight: 800;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .panel-desc {
      color: var(--text-soft);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .divider {
      border: 0;
      height: 1px;
      background: color-mix(in srgb, var(--line) 50%, transparent);
      margin: 1.5rem 0;
    }

    .source-type-title {
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .source-type-title mat-icon {
      color: var(--primary);
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .add-source-box {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .source-input {
      flex: 1;
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--text);
      font-size: 0.95rem;
    }

    .source-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .btn-add {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      width: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: filter 0.2s;
    }

    .btn-add:hover {
      filter: brightness(1.1);
    }

    .btn-add:disabled {
      background: var(--line);
      cursor: not-allowed;
    }

    .source-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .source-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0.8rem;
      background: var(--surface-soft);
      border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
      border-radius: 8px;
      transition: border-color 0.2s;
    }

    .source-item:hover {
      border-color: var(--primary);
    }

    .source-name {
      font-weight: 600;
      color: var(--text);
    }

    .edit-input {
      flex: 1;
      border: none;
      border-bottom: 2px solid var(--primary);
      background: transparent;
      padding: 0.2rem;
      color: var(--text);
      font-weight: 600;
      font-size: 0.95rem;
      margin-right: 0.5rem;
    }

    .edit-input:focus {
      outline: none;
    }

    .item-actions {
      display: flex;
      gap: 0.3rem;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-soft);
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .icon-btn:hover {
      background: var(--line);
      color: var(--text);
    }
    .icon-btn.danger:hover {
      background: color-mix(in srgb, var(--danger) 15%, transparent);
      color: var(--danger);
    }
    .icon-btn.success {
      color: var(--success);
    }
    .icon-btn.success:hover {
      background: color-mix(in srgb, var(--success) 15%, transparent);
    }

    .error-msg {
      color: var(--danger);
      font-size: 0.8rem;
      margin-top: -0.5rem;
      margin-bottom: 0.8rem;
    }

    .empty-state {
      padding: 1rem;
      text-align: center;
      color: var(--text-soft);
      font-size: 0.9rem;
      background: color-mix(in srgb, var(--surface-soft) 50%, transparent);
      border-radius: 8px;
      border: 1px dashed var(--line);
    }

    .danger-zone {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px dashed var(--line);
    }

    .danger-btn {
      color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 30%, var(--line));
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .danger-btn:hover {
      background: color-mix(in srgb, var(--danger) 10%, transparent);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-modal {
      width: 90%;
      max-width: 450px;
      padding: 2rem;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .modal-head h2 {
      margin: 0;
    }

    @media (max-width: 900px) {
      .settings-layout {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  settingsService = inject(SettingsService);
  authService = inject(AuthService);

  quickCurrencyCodes = ['USD', 'INR', 'EUR', 'GBP'];

  newBankAccount = '';
  newCard = '';
  bankInputError = '';
  cardInputError = '';

  editingBankAccount: string | null = null;
  editBankInput = '';

  editingCard: string | null = null;
  editCardInput = '';

  showInfoModal = false;
  socialLinks = {
    github: 'https://github.com/',
  };

  getThemePreviewColor(colorName: string): string {
    const map: Record<string, string> = {
      Blue: '#1f97d8',
      Purple: '#6f1dd6',
      Green: '#00b894',
      Red: '#cf3236',
      Orange: '#ff6d00',
      Indigo: '#3f51b5',
    };
    return map[colorName] || '#1f97d8';
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.trim()[0].toUpperCase();
  }

  toggleDarkMode(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('darkMode', target.checked);
  }

  setThemeColor(color: string): void {
    this.settingsService.updateSetting('themeColor', color);
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
    return this.settingsService.currencies.find((c) => c.code === code)?.label || code;
  }

  toggleNotifications(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('notification', target.checked);
  }

  toggleAutoSave(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('autoSave', target.checked);
  }

  toggleTransactionSounds(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.settingsService.updateSetting('transactionSounds', target.checked);
  }

  resetSettings(): void {
    this.settingsService.updateSetting('darkMode', false);
    this.settingsService.updateSetting('currency', 'USD');
    this.settingsService.updateSetting('notification', true);
    this.settingsService.updateSetting('autoSave', true);
    this.settingsService.updateSetting('transactionSounds', true);
    this.settingsService.updateSetting('themeColor', 'Blue');
    // We optionally let users keep payment sources when resetting appearance
    // but default behavior previously reset them
  }

  // Bank Accounts Logic
  onBankInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newBankAccount = target.value;
    this.bankInputError = '';
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

  removeBankAccount(name: string): void {
    this.settingsService.removeBankAccount(name);
  }

  startEditBankAccount(account: string): void {
    this.editingBankAccount = account;
    this.editBankInput = account;
    this.bankInputError = '';
  }

  saveEditBankAccount(account: string): void {
    const value = this.normalizeSourceName(this.editBankInput);
    if (!value || value === account) {
      this.cancelEditBankAccount();
      return;
    }
    const existing = this.settingsService.bankAccounts().filter((a) => a !== account);
    const error = this.validateSource(value, existing);
    if (error) {
      this.bankInputError = error;
      return;
    }
    // Update
    this.settingsService.removeBankAccount(account);
    this.settingsService.addBankAccount(value);
    this.cancelEditBankAccount();
  }

  cancelEditBankAccount(): void {
    this.editingBankAccount = null;
    this.editBankInput = '';
    this.bankInputError = '';
  }

  canAddBankAccount(value: string): boolean {
    const clean = this.normalizeSourceName(value);
    return !this.validateSource(clean, this.settingsService.bankAccounts());
  }

  // Cards Logic
  onCardInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newCard = target.value;
    this.cardInputError = '';
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

  removeCard(name: string): void {
    this.settingsService.removeCard(name);
  }

  startEditCard(card: string): void {
    this.editingCard = card;
    this.editCardInput = card;
    this.cardInputError = '';
  }

  saveEditCard(card: string): void {
    const value = this.normalizeSourceName(this.editCardInput);
    if (!value || value === card) {
      this.cancelEditCard();
      return;
    }
    const existing = this.settingsService.cards().filter((c) => c !== card);
    const error = this.validateSource(value, existing);
    if (error) {
      this.cardInputError = error;
      return;
    }
    this.settingsService.removeCard(card);
    this.settingsService.addCard(value);
    this.cancelEditCard();
  }

  cancelEditCard(): void {
    this.editingCard = null;
    this.editCardInput = '';
    this.cardInputError = '';
  }

  canAddCard(value: string): boolean {
    const clean = this.normalizeSourceName(value);
    return !this.validateSource(clean, this.settingsService.cards());
  }

  totalSources(): number {
    return this.settingsService.bankAccounts().length + this.settingsService.cards().length;
  }

  openInfo(): void {
    this.showInfoModal = true;
  }

  closeInfo(): void {
    this.showInfoModal = false;
  }

  private normalizeSourceName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private validateSource(value: string, existing: string[]): string | null {
    if (!value) return 'Please enter a name.';
    if (value.length < 3) return 'Use at least 3 characters.';
    const duplicate = existing.some((item) => item.toLowerCase() === value.toLowerCase());
    if (duplicate) return 'This source already exists.';
    return null;
  }
}
