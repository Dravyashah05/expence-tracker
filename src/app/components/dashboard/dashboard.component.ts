import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { LoaderComponent } from '../loader/loader.component';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, AppCurrencyPipe, LoaderComponent],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Your latest financial overview and transaction pulse.</p>
          </div>
          @if (transactionService.isLoading()) {
            <div class="inline-loader">
              <app-loader size="sm"></app-loader>
              <span>Loading</span>
            </div>
          }
          <a class="btn-solid" routerLink="/add-transaction">Add Transaction</a>
        </header>

        <section class="hero-card">
          <div class="hero-copy">
            <p class="label">Current Balance</p>
            <h2>{{ balance() | appCurrency }}</h2>
            <small>{{ transactions().length }} total records</small>
          </div>

          <div class="hero-stats">
            <article>
              <span>Income</span>
              <strong class="income">{{ totalIncome() | appCurrency }}</strong>
            </article>
            <article>
              <span>Expenses</span>
              <strong class="expense">{{ totalExpense() | appCurrency }}</strong>
            </article>
            <article>
              <span>Net Position</span>
              <strong [class.income]="balance() >= 0" [class.expense]="balance() < 0">{{ balance() | appCurrency }}</strong>
            </article>
          </div>
        </section>

        <section class="surface-card recent">
          <div class="recent-head">
            <h3>Recent Transactions</h3>
            <small>Showing latest 8</small>
          </div>

          @if (recentTransactions().length === 0) {
            <div class="empty">
              <mat-icon>wallet</mat-icon>
              <p>No transactions yet. Start by adding your first entry.</p>
              <a class="btn-outline" routerLink="/add-transaction">Create first transaction</a>
            </div>
          } @else {
            @for (transaction of recentTransactions() | slice:0:8; track transaction.id) {
              <article class="txn-row">
                <div class="txn-row-main">
                  <div class="txn-left">
                    <span class="pill" [class.income-bg]="transaction.type === 'income'" [class.expense-bg]="transaction.type === 'expense'">
                      <mat-icon>{{ transaction.type === 'income' ? 'south_west' : 'north_east' }}</mat-icon>
                    </span>
                    <div class="txn-meta">
                      <p class="category-line">
                        <mat-icon class="cat-icon">{{ getCategoryIcon(transaction.category) }}</mat-icon>
                        {{ transaction.category }}
                      </p>
                      <small>{{ transaction.date | date:'mediumDate' }} {{ transaction.date | date:'shortTime' }}</small>
                    </div>
                  </div>

                  <div class="txn-right">
                    <strong [class.income]="transaction.type === 'income'" [class.expense]="transaction.type === 'expense'">
                      {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | appCurrency }}
                    </strong>
                    <button
                      class="icon-btn"
                      type="button"
                      (click)="toggleDetails(transaction.id)"
                      [attr.aria-label]="isExpanded(transaction.id) ? 'Hide transaction details' : 'Show transaction details'"
                    >
                      <mat-icon>{{ isExpanded(transaction.id) ? 'expand_less' : 'more_horiz' }}</mat-icon>
                    </button>
                  </div>
                </div>

                @if (isExpanded(transaction.id)) {
                  <div class="txn-details">
                    <small>
                      <mat-icon>account_balance_wallet</mat-icon>
                      {{ getPaymentLabel(transaction) }}
                    </small>
                    @if (transaction.description) {
                      <small>
                        <mat-icon>notes</mat-icon>
                        {{ transaction.description }}
                      </small>
                    }
                  </div>
                }
              </article>
            }
          }
        </section>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .hero-card {
      border-radius: var(--radius-md);
      border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--line));
      background:
        radial-gradient(280px 120px at 96% 10%, rgba(245, 158, 11, 0.22), transparent),
        linear-gradient(145deg, color-mix(in srgb, var(--primary) 22%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 84%, #fff 16%) 100%);
      padding: 1rem;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-soft);
      font-weight: 600;
    }

    .hero-copy .label {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
    }

    .hero-copy h2 {
      margin-top: 0.25rem;
      font-size: clamp(2rem, 4.5vw, 3rem);
      line-height: 1;
    }

    .hero-copy small {
      margin-top: 0.36rem;
      display: block;
      color: var(--text-soft);
      font-weight: 600;
    }

    .hero-stats {
      display: grid;
      gap: 0.55rem;
      align-content: center;
    }

    .hero-stats article {
      border: 1px solid color-mix(in srgb, var(--line) 88%, #fff 12%);
      border-radius: 14px;
      background: color-mix(in srgb, var(--surface) 84%, transparent);
      padding: 0.6rem 0.7rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
    }

    .hero-stats span {
      color: var(--text-soft);
      font-weight: 700;
      font-size: 0.84rem;
    }

    .hero-stats strong {
      font-size: 1rem;
    }

    .recent {
      padding: 0.95rem;
    }

    .recent-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .recent-head h3 {
      font-size: 1.15rem;
    }

    .recent-head small {
      color: var(--text-soft);
      font-weight: 600;
    }

    .txn-row {
      padding: 0.68rem 0;
      border-bottom: 1px solid var(--line);
    }

    .txn-row:last-child {
      border-bottom: 0;
    }

    .txn-row-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
    }

    .txn-left {
      min-width: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }

    .pill {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .pill mat-icon {
      width: 17px;
      height: 17px;
      font-size: 17px;
    }

    .income-bg {
      background: color-mix(in srgb, var(--success) 16%, transparent);
      color: var(--success);
    }

    .expense-bg {
      background: color-mix(in srgb, var(--danger) 14%, transparent);
      color: var(--danger);
    }

    .txn-left p {
      font-weight: 700;
    }

    .txn-meta {
      min-width: 0;
      display: grid;
      gap: 0.14rem;
    }

    .category-line {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin: 0;
    }

    .cat-icon {
      width: 15px;
      height: 15px;
      font-size: 15px;
      color: var(--primary-strong);
    }

    .txn-left small {
      color: var(--text-soft);
      font-size: 0.78rem;
      display: block;
    }

    .income {
      color: var(--success);
    }

    .expense {
      color: var(--danger);
    }

    .empty {
      border: 1px dashed var(--line);
      border-radius: 14px;
      padding: 1rem;
      text-align: center;
      display: grid;
      justify-items: center;
      gap: 0.52rem;
      color: var(--text-soft);
    }

    .empty mat-icon {
      width: 26px;
      height: 26px;
      font-size: 26px;
      color: var(--primary);
    }

    .txn-right {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      flex-shrink: 0;
    }

    .icon-btn {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--text-soft);
      cursor: pointer;
    }

    .icon-btn:hover {
      background: color-mix(in srgb, var(--line) 75%, transparent);
      color: var(--text);
    }

    .icon-btn mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .txn-details {
      margin-top: 0.42rem;
      margin-left: 2.75rem;
      display: grid;
      gap: 0.24rem;
    }

    .txn-details small {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--text-soft);
      font-size: 0.76rem;
      min-width: 0;
    }

    .txn-details mat-icon {
      width: 14px;
      height: 14px;
      font-size: 14px;
      color: var(--primary-strong);
      flex-shrink: 0;
    }

    @media (max-width: 980px) {
      .hero-card {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  transactionService = inject(TransactionService);

  transactions = computed(() => this.transactionService.allTransactions());
  balance = computed(() => this.transactionService.netBalance());
  totalIncome = computed(() => this.transactionService.totalIncome());
  totalExpense = computed(() => this.transactionService.totalExpenses());
  recentTransactions = computed(() =>
    [...this.transactionService.allTransactions()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  expandedDetails = signal<Record<string, boolean>>({});

  private categoryIcons: Record<string, string> = {
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
    'Pet Care': 'pets'
  };

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || 'label';
  }

  getPaymentLabel(transaction: Transaction): string {
    const method = transaction.paymentMethod || 'Cash';
    if (!transaction.paymentSource) return method;
    return `${method} - ${transaction.paymentSource}`;
  }

  isExpanded(id: string): boolean {
    return !!this.expandedDetails()[id];
  }

  toggleDetails(id: string): void {
    this.expandedDetails.update(state => ({
      ...state,
      [id]: !state[id],
    }));
  }
}
