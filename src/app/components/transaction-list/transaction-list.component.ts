import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { LoaderComponent } from '../loader/loader.component';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    LoaderComponent,
    AppCurrencyPipe,
  ],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <!-- Header -->
        <header class="page-header">
          <div>
            <h1 class="page-title">Transactions</h1>
            <p class="page-subtitle">View, search, edit and manage all your records.</p>
          </div>
          <div class="header-actions">
            @if (transactionService.isLoading()) {
              <span class="inline-loader"><app-loader size="sm"></app-loader> Syncing</span>
            }
            <a class="btn-solid" routerLink="/add-transaction">
              <mat-icon>add</mat-icon> Add Transaction
            </a>
          </div>
        </header>

        <!-- Summary Metric Cards -->
        <div class="metric-grid">
          <article class="surface-card metric-card">
            <div class="metric-icon-wrap neutral-icon"><mat-icon>receipt_long</mat-icon></div>
            <div>
              <p class="label">Total Records</p>
              <p class="metric-value">{{ allTransactions().length }}</p>
            </div>
          </article>
          <article class="surface-card metric-card">
            <div class="metric-icon-wrap income-icon"><mat-icon>trending_up</mat-icon></div>
            <div>
              <p class="label">Total Income</p>
              <p class="metric-value income">
                {{ transactionService.totalIncome() | appCurrency }}
              </p>
            </div>
          </article>
          <article class="surface-card metric-card">
            <div class="metric-icon-wrap expense-icon"><mat-icon>trending_down</mat-icon></div>
            <div>
              <p class="label">Total Expenses</p>
              <p class="metric-value expense">
                {{ transactionService.totalExpenses() | appCurrency }}
              </p>
            </div>
          </article>
          <article class="surface-card metric-card">
            <div
              class="metric-icon-wrap"
              [class.income-icon]="transactionService.netBalance() >= 0"
              [class.expense-icon]="transactionService.netBalance() < 0"
            >
              <mat-icon>account_balance</mat-icon>
            </div>
            <div>
              <p class="label">Net Balance</p>
              <p
                class="metric-value"
                [class.income]="transactionService.netBalance() >= 0"
                [class.expense]="transactionService.netBalance() < 0"
              >
                {{ transactionService.netBalance() | appCurrency }}
              </p>
            </div>
          </article>
        </div>

        <!-- Filter / Search Bar -->
        <div class="filter-bar glass-card">
          <div class="search-wrap">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              class="search-input"
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search by category, description, amount..."
            />
            @if (searchQuery()) {
              <button class="clear-btn" type="button" (click)="searchQuery.set('')">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>

          <div class="filter-chips">
            <button class="fchip" [class.active]="filterType() === ''" (click)="filterType.set('')">
              All
            </button>
            <button
              class="fchip income-chip"
              [class.active]="filterType() === 'income'"
              (click)="filterType.set('income')"
            >
              <mat-icon>trending_up</mat-icon> Income
            </button>
            <button
              class="fchip expense-chip"
              [class.active]="filterType() === 'expense'"
              (click)="filterType.set('expense')"
            >
              <mat-icon>trending_down</mat-icon> Expense
            </button>
          </div>

          <div class="sort-wrap">
            <mat-icon class="sort-icon">sort</mat-icon>
            <select class="sort-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>

        <!-- Results count -->
        <div class="results-meta">
          <span
            >{{ filteredTransactions().length }} result{{
              filteredTransactions().length !== 1 ? 's' : ''
            }}</span
          >
          @if (searchQuery() || filterType()) {
            <button class="clear-filters" type="button" (click)="clearFilters()">
              <mat-icon>filter_alt_off</mat-icon> Clear Filters
            </button>
          }
        </div>

        <!-- Transaction List -->
        @if (filteredTransactions().length === 0) {
          <div class="empty-state">
            <div class="empty-icon-wrap"><mat-icon>receipt_long</mat-icon></div>
            <h3>No transactions found</h3>
            <p>
              {{
                searchQuery() || filterType()
                  ? 'Try adjusting your search or filters.'
                  : 'Start by adding your first transaction.'
              }}
            </p>
            @if (!searchQuery() && !filterType()) {
              <a class="btn-solid" routerLink="/add-transaction"
                ><mat-icon>add</mat-icon> Add Transaction</a
              >
            }
          </div>
        } @else {
          <div class="txn-list">
            @for (tx of filteredTransactions(); track tx.id) {
              <article class="txn-card" [class.editing]="editingId() === tx.id">
                <!-- Main Row -->
                <div class="txn-main">
                  <div class="txn-left">
                    <div
                      class="txn-icon"
                      [class.income-icon]="tx.type === 'income'"
                      [class.expense-icon]="tx.type === 'expense'"
                    >
                      <mat-icon>{{ getCategoryIcon(tx.category) }}</mat-icon>
                    </div>
                    <div class="txn-info">
                      <div class="txn-top-row">
                        <span class="txn-category">{{ tx.category }}</span>
                        <span
                          class="type-badge"
                          [class.income-badge]="tx.type === 'income'"
                          [class.expense-badge]="tx.type === 'expense'"
                          >{{ tx.type }}</span
                        >
                      </div>
                      <div class="txn-sub-row">
                        <small class="txn-date">{{ tx.date | date: 'MMM d, y' }}</small>
                        @if (tx.paymentMethod) {
                          <span class="payment-dot">·</span>
                          <small class="txn-payment"
                            >{{ tx.paymentMethod
                            }}{{ tx.paymentSource ? ' — ' + tx.paymentSource : '' }}</small
                          >
                        }
                        @if (tx.description) {
                          <span class="payment-dot">·</span>
                          <small class="txn-desc">{{ tx.description }}</small>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="txn-right">
                    <span
                      class="txn-amount"
                      [class.income]="tx.type === 'income'"
                      [class.expense]="tx.type === 'expense'"
                    >
                      {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | appCurrency }}
                    </span>
                    <div class="txn-actions">
                      <button
                        class="action-btn edit-btn"
                        type="button"
                        (click)="startEdit(tx)"
                        title="Edit"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button
                        class="action-btn delete-btn"
                        type="button"
                        (click)="deleteTransaction(tx.id)"
                        [disabled]="deletingId() === tx.id"
                        title="Delete"
                      >
                        @if (deletingId() === tx.id) {
                          <app-loader size="sm"></app-loader>
                        } @else {
                          <mat-icon>delete</mat-icon>
                        }
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Inline Edit Panel -->
                @if (editingId() === tx.id) {
                  <div class="edit-panel" (click)="$event.stopPropagation()">
                    <div class="edit-panel-header">
                      <mat-icon>edit_note</mat-icon>
                      <span>Edit Transaction</span>
                      <button class="close-edit" type="button" (click)="cancelEdit()">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>

                    <div class="edit-fields">
                      <div class="ef-group">
                        <label>Amount</label>
                        <div class="edit-amount-wrap">
                          <span class="edit-currency">{{ settingsService.currencySymbol() }}</span>
                          <input
                            type="number"
                            class="edit-input"
                            [(ngModel)]="editAmount"
                            step="0.01"
                            min="0.01"
                          />
                        </div>
                      </div>
                      <div class="ef-group">
                        <label>Category</label>
                        <input type="text" class="edit-input" [(ngModel)]="editCategory" />
                      </div>
                      <div class="ef-group">
                        <label>Date</label>
                        <input
                          type="date"
                          class="edit-input"
                          [(ngModel)]="editDate"
                          [max]="todayStr"
                        />
                      </div>
                      <div class="ef-group">
                        <label>Description</label>
                        <input
                          type="text"
                          class="edit-input"
                          [(ngModel)]="editDescription"
                          placeholder="Optional note"
                        />
                      </div>
                    </div>

                    @if (editError()) {
                      <p class="edit-error"><mat-icon>error</mat-icon> {{ editError() }}</p>
                    }

                    <div class="edit-actions">
                      <button class="btn-outline" type="button" (click)="cancelEdit()">
                        Cancel
                      </button>
                      <button
                        class="btn-solid"
                        type="button"
                        (click)="saveEdit(tx.id)"
                        [disabled]="isSavingEdit()"
                      >
                        @if (isSavingEdit()) {
                          <app-loader size="sm"></app-loader> Saving...
                        } @else {
                          <mat-icon>check</mat-icon> Save Changes
                        }
                      </button>
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeIn 0.35s ease-out;
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
        margin-bottom: 1.75rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      .inline-loader {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--text-soft);
        font-size: 0.85rem;
        font-weight: 600;
      }

      /* Metric Cards */
      .metric-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .metric-card {
        padding: 1.1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: transform 0.2s;
      }
      .metric-card:hover {
        transform: translateY(-2px);
      }
      .metric-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .metric-icon-wrap mat-icon {
        font-size: 1.4rem;
        width: 1.4rem;
        height: 1.4rem;
      }
      .neutral-icon {
        background: color-mix(in srgb, var(--primary) 10%, var(--surface));
        color: var(--primary);
      }
      .income-icon {
        background: color-mix(in srgb, var(--success) 12%, var(--surface));
        color: var(--success);
      }
      .expense-icon {
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: var(--danger);
      }
      .label {
        color: var(--text-soft);
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 0.2rem;
      }
      .metric-value {
        font-family: 'Outfit', sans-serif;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .metric-value.income {
        color: var(--success);
      }
      .metric-value.expense {
        color: var(--danger);
      }

      /* Filter Bar */
      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        padding: 1rem 1.2rem;
        margin-bottom: 1rem;
      }

      .search-wrap {
        flex: 1;
        min-width: 200px;
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 0.8rem;
        color: var(--text-soft);
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
      .search-input {
        width: 100%;
        padding: 0.65rem 2.2rem 0.65rem 2.4rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--surface);
        color: var(--text);
        font: inherit;
        font-size: 0.9rem;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }
      .search-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 13%, transparent);
      }
      .clear-btn {
        position: absolute;
        right: 0.8rem;
        background: none;
        border: none;
        color: var(--text-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      .clear-btn mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }

      .filter-chips {
        display: flex;
        gap: 0.4rem;
      }
      .fchip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.45rem 0.9rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--surface-soft);
        color: var(--text-soft);
        font: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .fchip mat-icon {
        font-size: 0.95rem;
        width: 0.95rem;
        height: 0.95rem;
      }
      .fchip.active,
      .fchip:hover {
        border-color: color-mix(in srgb, var(--primary) 40%, var(--line));
        background: color-mix(in srgb, var(--primary) 8%, var(--surface));
        color: var(--primary-strong);
      }
      .income-chip.active {
        border-color: color-mix(in srgb, var(--success) 40%, var(--line));
        background: color-mix(in srgb, var(--success) 10%, var(--surface));
        color: var(--success);
      }
      .expense-chip.active {
        border-color: color-mix(in srgb, var(--danger) 40%, var(--line));
        background: color-mix(in srgb, var(--danger) 10%, var(--surface));
        color: var(--danger);
      }

      .sort-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .sort-icon {
        position: absolute;
        left: 0.8rem;
        color: var(--text-soft);
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        pointer-events: none;
      }
      .sort-select {
        padding: 0.65rem 1rem 0.65rem 2.2rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--surface);
        color: var(--text);
        font: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        transition: border-color 0.2s;
      }
      .sort-select:focus {
        outline: none;
        border-color: var(--primary);
      }

      /* Results meta */
      .results-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.85rem;
        color: var(--text-soft);
        font-weight: 600;
      }
      .clear-filters {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: none;
        border: none;
        color: var(--primary-strong);
        font: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
      }
      .clear-filters mat-icon {
        font-size: 0.95rem;
        width: 0.95rem;
        height: 0.95rem;
      }

      /* Transaction List */
      .txn-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .txn-card {
        background: color-mix(in srgb, var(--surface) 80%, transparent);
        border: 1px solid var(--line);
        border-radius: var(--radius-md);
        overflow: hidden;
        transition: all 0.2s ease;
      }
      .txn-card:hover {
        border-color: color-mix(in srgb, var(--primary) 25%, var(--line));
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      }
      .txn-card.editing {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
      }

      .txn-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.95rem 1.1rem;
      }

      .txn-left {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        flex: 1;
        min-width: 0;
      }

      .txn-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .txn-icon mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }
      .txn-icon.income-icon {
        background: color-mix(in srgb, var(--success) 12%, transparent);
        color: var(--success);
      }
      .txn-icon.expense-icon {
        background: color-mix(in srgb, var(--danger) 12%, transparent);
        color: var(--danger);
      }

      .txn-info {
        flex: 1;
        min-width: 0;
      }
      .txn-top-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.2rem;
      }
      .txn-category {
        font-weight: 700;
        font-size: 0.95rem;
      }
      .type-badge {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
      }
      .income-badge {
        background: color-mix(in srgb, var(--success) 12%, transparent);
        color: var(--success);
      }
      .expense-badge {
        background: color-mix(in srgb, var(--danger) 12%, transparent);
        color: var(--danger);
      }

      .txn-sub-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.2rem;
      }
      .txn-date,
      .txn-payment,
      .txn-desc {
        font-size: 0.78rem;
        color: var(--text-soft);
      }
      .payment-dot {
        color: var(--text-soft);
        font-size: 0.65rem;
      }

      .txn-right {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        flex-shrink: 0;
      }
      .txn-amount {
        font-family: 'Outfit', sans-serif;
        font-size: 1.1rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .txn-amount.income {
        color: var(--success);
      }
      .txn-amount.expense {
        color: var(--danger);
      }

      .txn-actions {
        display: flex;
        gap: 0.3rem;
      }
      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--line);
        background: var(--surface-soft);
        color: var(--text-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .action-btn mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
      .edit-btn:hover {
        background: color-mix(in srgb, var(--primary) 10%, var(--surface));
        border-color: color-mix(in srgb, var(--primary) 35%, var(--line));
        color: var(--primary-strong);
      }
      .delete-btn:hover {
        background: color-mix(in srgb, var(--danger) 10%, var(--surface));
        border-color: color-mix(in srgb, var(--danger) 35%, var(--line));
        color: var(--danger);
      }
      .action-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Edit panel */
      .edit-panel {
        background: color-mix(in srgb, var(--primary) 4%, var(--surface));
        border-top: 1px solid color-mix(in srgb, var(--primary) 20%, var(--line));
        padding: 1.2rem;
        animation: slideDown 0.2s ease-out;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .edit-panel-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.1rem;
        font-size: 1rem;
        font-weight: 700;
        color: var(--primary-strong);
      }
      .edit-panel-header mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
      .close-edit {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--text-soft);
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: 6px;
        width: 28px;
        height: 28px;
        justify-content: center;
        transition: background 0.2s;
      }
      .close-edit:hover {
        background: var(--line);
      }
      .close-edit mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }

      .edit-fields {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.8rem;
        margin-bottom: 1rem;
      }
      .ef-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .ef-group label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-soft);
      }

      .edit-amount-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .edit-currency {
        position: absolute;
        left: 0.75rem;
        font-weight: 700;
        color: var(--primary-strong);
        pointer-events: none;
      }
      .edit-input {
        width: 100%;
        padding: 0.65rem 0.8rem;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font: inherit;
        font-size: 0.9rem;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }
      .edit-input[type='number'] {
        padding-left: 1.8rem;
      }
      .edit-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 13%, transparent);
      }

      .edit-error {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--danger);
        margin-bottom: 0.8rem;
      }
      .edit-error mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }

      .edit-actions {
        display: flex;
        gap: 0.8rem;
        justify-content: flex-end;
      }

      /* Empty state */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4rem 1rem;
        gap: 1rem;
      }
      .empty-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--primary) 10%, transparent);
        color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .empty-icon-wrap mat-icon {
        font-size: 2.2rem;
        width: 2.2rem;
        height: 2.2rem;
      }
      .empty-state h3 {
        font-size: 1.3rem;
      }
      .empty-state p {
        color: var(--text-soft);
        max-width: 32ch;
      }

      @media (max-width: 900px) {
        .metric-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .filter-bar {
          gap: 0.7rem;
        }
        .edit-fields {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .metric-grid {
          grid-template-columns: 1fr 1fr;
        }
        .txn-main {
          flex-wrap: wrap;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  transactionService = inject(TransactionService);
  settingsService = inject(SettingsService);

  allTransactions = computed(() => this.transactionService.allTransactions());
  deletingId = signal<string | null>(null);
  editingId = signal<string | null>(null);
  isSavingEdit = signal(false);
  editError = signal('');

  searchQuery = signal('');
  filterType = signal<'' | 'income' | 'expense'>('');
  sortBy = signal<'recent' | 'oldest' | 'amount-high' | 'amount-low'>('recent');

  editAmount = 0;
  editCategory = '';
  editDate = '';
  editDescription = '';
  todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();

  private readonly categoryIcons: Record<string, string> = {
    Salary: 'payments',
    Freelance: 'work',
    Food: 'restaurant',
    Groceries: 'local_grocery_store',
    Transport: 'directions_bus',
    Travel: 'flight',
    Utilities: 'bolt',
    Entertainment: 'movie',
    Health: 'health_and_safety',
    Shopping: 'shopping_bag',
    Housing: 'home',
    Rent: 'apartment',
    Education: 'school',
    Subscriptions: 'subscriptions',
    Insurance: 'shield',
    Investment: 'trending_up',
    Gifts: 'card_giftcard',
    'Gift Received': 'redeem',
    'Pet Care': 'pets',
  };

  getCategoryIcon(cat: string): string {
    return this.categoryIcons[cat] || 'label';
  }

  filteredTransactions = computed(() => {
    let list = this.allTransactions();
    const q = this.searchQuery().toLowerCase().trim();
    const ft = this.filterType();

    if (q) {
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          String(t.amount).includes(q) ||
          (t.paymentMethod || '').toLowerCase().includes(q) ||
          (t.paymentSource || '').toLowerCase().includes(q),
      );
    }

    if (ft) list = list.filter((t) => t.type === ft);

    const sorted = [...list];
    const sort = this.sortBy();
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => +new Date(a.date) - +new Date(b.date));
        break;
      case 'amount-high':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-low':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      default:
        sorted.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return sorted;
  });

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterType.set('');
  }

  startEdit(tx: Transaction): void {
    this.editingId.set(tx.id);
    this.editAmount = tx.amount;
    this.editCategory = tx.category;
    this.editDate = new Date(tx.date).toISOString().slice(0, 10);
    this.editDescription = tx.description || '';
    this.editError.set('');
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editError.set('');
  }

  async saveEdit(id: string): Promise<void> {
    const amount = Number(this.editAmount);
    if (!amount || amount <= 0) {
      this.editError.set('Amount must be greater than 0.');
      return;
    }
    if (!this.editCategory.trim()) {
      this.editError.set('Category cannot be empty.');
      return;
    }
    if (!this.editDate) {
      this.editError.set('Date is required.');
      return;
    }

    this.isSavingEdit.set(true);
    this.editError.set('');
    try {
      const ok = await this.transactionService.updateTransaction(id, {
        amount,
        category: this.editCategory.trim(),
        date: new Date(`${this.editDate}T00:00:00`),
        description: this.editDescription.trim(),
      });
      if (ok) {
        this.editingId.set(null);
      } else {
        this.editError.set('Failed to save changes. Please try again.');
      }
    } finally {
      this.isSavingEdit.set(false);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    this.deletingId.set(id);
    try {
      await this.transactionService.deleteTransaction(id);
    } finally {
      this.deletingId.set(null);
    }
  }
}
