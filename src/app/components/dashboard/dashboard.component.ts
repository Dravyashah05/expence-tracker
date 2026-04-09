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

        <!-- Header -->
        <header class="page-header">
          <div>
            <h1 class="page-title">Dashboard</h1>
            <p class="page-subtitle">Your complete financial overview at a glance.</p>
          </div>
          <div class="header-right">
            @if (transactionService.isLoading()) {
              <div class="inline-loader">
                <app-loader size="sm"></app-loader>
                <span>Syncing</span>
              </div>
            }
            <a class="btn-solid" routerLink="/add-transaction">
              <mat-icon>add</mat-icon>
              Add Transaction
            </a>
          </div>
        </header>

        <!-- Hero Balance Card -->
        <div class="hero-card">
          <div class="hero-left">
            <p class="hero-kicker">Current Balance</p>
            <h2 class="hero-amount" [class.positive]="balance() >= 0" [class.negative]="balance() < 0">
              {{ balance() | appCurrency }}
            </h2>
            <p class="hero-sub">
              <mat-icon>receipt_long</mat-icon>
              {{ transactions().length }} total transaction{{ transactions().length !== 1 ? 's' : '' }}
            </p>
          </div>

          <div class="hero-stats">
            <div class="stat-pill income-pill">
              <div class="stat-pill-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div>
                <p class="stat-pill-label">Income</p>
                <strong>{{ totalIncome() | appCurrency }}</strong>
              </div>
            </div>

            <div class="stat-pill expense-pill">
              <div class="stat-pill-icon">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div>
                <p class="stat-pill-label">Expenses</p>
                <strong>{{ totalExpense() | appCurrency }}</strong>
              </div>
            </div>

            <div class="stat-pill net-pill">
              <div class="stat-pill-icon">
                <mat-icon>account_balance</mat-icon>
              </div>
              <div>
                <p class="stat-pill-label">Net Position</p>
                <strong [class.text-s]="balance() >= 0" [class.text-d]="balance() < 0">
                  {{ balance() | appCurrency }}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <a class="action-chip" routerLink="/add-transaction">
            <mat-icon>add_circle</mat-icon>
            Add Transaction
          </a>
          <a class="action-chip" routerLink="/analytics">
            <mat-icon>insights</mat-icon>
            Analytics
          </a>
          <a class="action-chip" routerLink="/transactions">
            <mat-icon>receipt_long</mat-icon>
            All Transactions
          </a>
          <a class="action-chip" routerLink="/settings">
            <mat-icon>tune</mat-icon>
            Settings
          </a>
        </div>

        <!-- Recent Transactions -->
        <section class="recent-section">
          <div class="recent-header">
            <div>
              <h3>Recent Transactions</h3>
              <p class="text-muted">Latest {{ recentTransactions().length > 8 ? '8' : recentTransactions().length }} entries</p>
            </div>
            <a class="view-all-btn" routerLink="/analytics">
              View Analytics
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>

          @if (recentTransactions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <h3>No transactions yet</h3>
              <p>Start tracking your finances by adding your first transaction.</p>
              <a class="btn-solid" routerLink="/add-transaction">
                <mat-icon>add</mat-icon>
                Add First Transaction
              </a>
            </div>
          } @else {
            <div class="txn-list">
              @for (tx of recentTransactions() | slice:0:8; track tx.id) {
                <article class="txn-row" [class.expanded]="isExpanded(tx.id)">
                  <div class="txn-row-main" (click)="toggleDetails(tx.id)" style="cursor:pointer;">
                    <div class="txn-left">
                      <div class="txn-icon" [class.income-icon]="tx.type === 'income'" [class.expense-icon]="tx.type === 'expense'">
                        <mat-icon>{{ getCategoryIcon(tx.category) }}</mat-icon>
                      </div>
                      <div class="txn-meta">
                        <p class="txn-category">{{ tx.category }}</p>
                        <small class="txn-date">{{ tx.date | date:'MMM d, y' }} · {{ tx.date | date:'shortTime' }}</small>
                      </div>
                    </div>

                    <div class="txn-right">
                      <span class="txn-amount" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
                        {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount | appCurrency }}
                      </span>
                      <span class="txn-type-badge" [class.income-badge]="tx.type === 'income'" [class.expense-badge]="tx.type === 'expense'">
                        {{ tx.type }}
                      </span>
                      <button class="expand-btn" type="button" (click)="$event.stopPropagation(); toggleDetails(tx.id)">
                        <mat-icon>{{ isExpanded(tx.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
                      </button>
                    </div>
                  </div>

                  @if (isExpanded(tx.id)) {
                    <div class="txn-detail-row">
                      <span class="detail-chip">
                        <mat-icon>account_balance_wallet</mat-icon>
                        {{ getPaymentLabel(tx) }}
                      </span>
                      @if (tx.description) {
                        <span class="detail-chip">
                          <mat-icon>notes</mat-icon>
                          {{ tx.description }}
                        </span>
                      }
                    </div>
                  }
                </article>
              }
            </div>
          }
        </section>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-right {
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

    /* Hero */
    .hero-card {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--line));
      background:
        radial-gradient(ellipse 400px 200px at 100% 0%, color-mix(in srgb, var(--accent) 15%, transparent), transparent),
        linear-gradient(145deg,
          color-mix(in srgb, var(--primary) 18%, var(--surface)) 0%,
          color-mix(in srgb, var(--surface) 90%, transparent) 100%
        );
      margin-bottom: 1.25rem;
    }

    .hero-kicker {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-soft);
      margin-bottom: 0.5rem;
    }

    .hero-amount {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.2rem, 5vw, 3.4rem);
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1;
      color: var(--text);
      transition: color 0.3s;
    }

    .hero-amount.positive { color: var(--success); }
    .hero-amount.negative { color: var(--danger); }

    .hero-sub {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 1rem;
      color: var(--text-soft);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .hero-sub mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .hero-stats {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      justify-content: center;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.1rem;
      border-radius: var(--radius-md);
      border: 1px solid color-mix(in srgb, var(--line) 80%, transparent);
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      backdrop-filter: blur(8px);
    }

    .stat-pill-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .income-pill .stat-pill-icon {
      background: color-mix(in srgb, var(--success) 12%, transparent);
      color: var(--success);
    }

    .expense-pill .stat-pill-icon {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
      color: var(--danger);
    }

    .net-pill .stat-pill-icon {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }

    .stat-pill-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.1rem;
    }

    .stat-pill strong {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
    }

    .text-s { color: var(--success); }
    .text-d { color: var(--danger); }

    /* Quick Actions */
    .quick-actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }

    .action-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      color: var(--text-soft);
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .action-chip mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .action-chip:hover {
      background: color-mix(in srgb, var(--primary) 8%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 35%, var(--line));
      color: var(--primary-strong);
      transform: translateY(-2px);
    }

    /* Recent Transactions */
    .recent-section {
      background: color-mix(in srgb, var(--surface) 80%, transparent);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .recent-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.8rem;
    }

    .recent-header h3 {
      font-size: 1.25rem;
    }

    .recent-header .text-muted {
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }

    .view-all-btn {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary-strong);
      text-decoration: none;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--line));
      background: color-mix(in srgb, var(--primary) 8%, var(--surface));
      transition: all 0.2s;
    }

    .view-all-btn mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .view-all-btn:hover {
      background: color-mix(in srgb, var(--primary) 14%, var(--surface));
    }

    /* Txn rows */
    .txn-list {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .txn-row {
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .txn-row:hover {
      background: color-mix(in srgb, var(--surface) 60%, transparent);
      border-color: var(--line);
    }

    .txn-row.expanded {
      background: color-mix(in srgb, var(--primary) 4%, var(--surface));
      border-color: color-mix(in srgb, var(--primary) 20%, var(--line));
    }

    .txn-row-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem;
    }

    .txn-left {
      display: flex;
      align-items: center;
      gap: 0.9rem;
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

    .income-icon {
      background: color-mix(in srgb, var(--success) 12%, transparent);
      color: var(--success);
    }

    .expense-icon {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
      color: var(--danger);
    }

    .txn-icon mat-icon {
      font-size: 1.3rem;
      width: 1.3rem;
      height: 1.3rem;
    }

    .txn-meta {
      min-width: 0;
    }

    .txn-category {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .txn-date {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 500;
    }

    .txn-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
    }

    .txn-amount {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .txn-amount.income { color: var(--success); }
    .txn-amount.expense { color: var(--danger); }

    .txn-type-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.5rem;
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

    .expand-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--text-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .expand-btn:hover {
      background: var(--line);
    }

    .expand-btn mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .txn-detail-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0 0.8rem 0.8rem 3.8rem;
    }

    .detail-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.25rem 0.6rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-soft);
    }

    .detail-chip mat-icon {
      font-size: 0.9rem;
      width: 0.9rem;
      height: 0.9rem;
      color: var(--primary);
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3rem 1rem;
      gap: 1rem;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .empty-icon mat-icon {
      font-size: 2.2rem;
      width: 2.2rem;
      height: 2.2rem;
    }

    .empty-state h3 {
      font-size: 1.3rem;
    }

    .empty-state p {
      color: var(--text-soft);
      max-width: 36ch;
    }

    @media (max-width: 900px) {
      .hero-card {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .txn-type-badge { display: none; }
      .quick-actions { overflow-x: auto; flex-wrap: nowrap; }
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
    Salary: 'payments', Freelance: 'work', Food: 'restaurant',
    Groceries: 'local_grocery_store', Transport: 'directions_bus', Travel: 'flight',
    Utilities: 'bolt', Entertainment: 'movie', Health: 'health_and_safety',
    Shopping: 'shopping_bag', Housing: 'home', Rent: 'apartment',
    Education: 'school', Subscriptions: 'subscriptions', Insurance: 'shield',
    Investment: 'trending_up', Gifts: 'card_giftcard', 'Pet Care': 'pets',
    'Gift Received': 'redeem'
  };

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || 'label';
  }

  getPaymentLabel(transaction: Transaction): string {
    const method = transaction.paymentMethod || 'Cash';
    if (!transaction.paymentSource) return method;
    return `${method} — ${transaction.paymentSource}`;
  }

  isExpanded(id: string): boolean {
    return !!this.expandedDetails()[id];
  }

  toggleDetails(id: string): void {
    this.expandedDetails.update(state => ({ ...state, [id]: !state[id] }));
  }
}
