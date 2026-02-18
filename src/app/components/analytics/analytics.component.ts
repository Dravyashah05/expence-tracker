import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, AppCurrencyPipe, LoaderComponent],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Analytics</h1>
            <p class="page-subtitle">Monthly trends and top spending categories.</p>
          </div>
          @if (transactionService.isLoading()) {
            <div class="inline-loader">
              <app-loader size="sm"></app-loader>
              <span>Loading</span>
            </div>
          }
        </header>

        <section class="metric-grid">
          <article class="surface-card metric-card">
            <p class="label">Total Income</p>
            <p class="metric-value income">{{ totalIncome() | appCurrency }}</p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Total Expenses</p>
            <p class="metric-value expense">{{ totalExpenses() | appCurrency }}</p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Net</p>
            <p class="metric-value" [class.income]="(totalIncome() - totalExpenses()) >= 0" [class.expense]="(totalIncome() - totalExpenses()) < 0">
              {{ totalIncome() - totalExpenses() | appCurrency }}
            </p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Expense Categories</p>
            <p class="metric-value">{{ topExpenses().length }}</p>
          </article>
        </section>

        <section class="surface-card chart-wrap">
          <div class="chart-head">
            <div>
              <h3>Monthly trend simulation</h3>
              <small>Week 1 to Week 4</small>
            </div>
            <span>Income vs Expense</span>
          </div>

          <div class="bars">
            @for (item of weeklyBars(); track item.week) {
              <div class="col">
                <div class="pair">
                  <span class="bar income" [style.height.px]="item.income"></span>
                  <span class="bar expense" [style.height.px]="item.expense"></span>
                </div>
                <small>{{ item.week }}</small>
              </div>
            }
          </div>

          <div class="legend">
            <span><i class="income-dot"></i>Income</span>
            <span><i class="expense-dot"></i>Expenses</span>
          </div>
        </section>

        <section class="surface-card spend-list">
          <h3>Top expense categories</h3>

          @if (topExpenses().length === 0) {
            <p class="empty">No expense transactions available yet.</p>
          } @else {
            @for (item of topExpenses(); track item.category) {
              <article class="spend-row">
                <div class="category-copy">
                  <p>
                    <mat-icon class="cat-icon">{{ getCategoryIcon(item.category) }}</mat-icon>
                    {{ item.category }}
                  </p>
                  <small>{{ item.count }} transactions</small>
                </div>
                <strong>-{{ item.amount | appCurrency }}</strong>
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

    .chart-wrap {
      margin-top: 1rem;
      padding: 0.95rem;
    }

    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-soft);
      font-weight: 600;
    }

    .chart-head {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 0.7rem;
    }

    .chart-head h3 {
      font-size: 1.1rem;
    }

    .chart-head small,
    .chart-head span {
      color: var(--text-soft);
      font-weight: 600;
      font-size: 0.78rem;
    }

    .bars {
      border-top: 1px dashed var(--line);
      padding-top: 0.95rem;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.5rem;
      align-items: end;
      min-height: 165px;
    }

    .col {
      display: grid;
      justify-items: center;
      gap: 0.35rem;
    }

    .pair {
      min-height: 126px;
      display: flex;
      align-items: end;
      gap: 0.24rem;
    }

    .bar {
      width: 14px;
      border-radius: 999px;
      display: block;
    }

    .bar.income {
      background: linear-gradient(180deg, color-mix(in srgb, var(--success) 70%, #fff), var(--success));
    }

    .bar.expense {
      background: linear-gradient(180deg, color-mix(in srgb, var(--danger) 60%, #fff), var(--danger));
    }

    .legend {
      margin-top: 0.7rem;
      display: inline-flex;
      gap: 1rem;
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .legend i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 0.28rem;
    }

    .income-dot {
      background: var(--success);
    }

    .expense-dot {
      background: var(--danger);
    }

    .spend-list {
      margin-top: 1rem;
      padding: 0.95rem;
    }

    .spend-list h3 {
      font-size: 1.07rem;
      margin-bottom: 0.35rem;
    }

    .spend-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
      border-bottom: 1px solid var(--line);
      padding: 0.7rem 0;
    }

    .spend-row:last-child {
      border-bottom: 0;
    }

    .spend-row p {
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .spend-row small {
      color: var(--text-soft);
      font-size: 0.79rem;
    }

    .cat-icon {
      width: 15px;
      height: 15px;
      font-size: 15px;
      color: var(--primary-strong);
    }

    .spend-row strong {
      color: var(--danger);
    }

    .empty {
      color: var(--text-soft);
      margin-top: 0.1rem;
    }

    @media (max-width: 700px) {
      .bars {
        min-height: 142px;
      }

      .chart-head {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent {
  transactionService = inject(TransactionService);
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

  totalIncome = computed(() => this.transactionService.totalIncome());
  totalExpenses = computed(() => this.transactionService.totalExpenses());

  weeklyBars = computed(() => {
    const tx = this.transactionService.allTransactions();
    const rows = [
      { week: 'Week 1', income: 48, expense: 30 },
      { week: 'Week 2', income: 34, expense: 22 },
      { week: 'Week 3', income: 40, expense: 33 },
      { week: 'Week 4', income: 44, expense: 31 },
    ];

    if (tx.length === 0) return rows;

    const incomeScale = Math.max(this.totalIncome(), 1);
    const expScale = Math.max(this.totalExpenses(), 1);

    return rows.map((r, i) => ({
      ...r,
      income: Math.round(30 + ((incomeScale * (0.6 + i * 0.08)) % 70)),
      expense: Math.round(22 + ((expScale * (0.5 + i * 0.07)) % 58)),
    }));
  });

  topExpenses = computed(() => {
    const expenses = this.transactionService.allTransactions().filter(t => t.type === 'expense');
    const map = new Map<string, { amount: number; count: number }>();

    for (const item of expenses) {
      const prev = map.get(item.category) || { amount: 0, count: 0 };
      map.set(item.category, { amount: prev.amount + item.amount, count: prev.count + 1 });
    }

    return Array.from(map.entries())
      .map(([category, value]) => ({ category, amount: value.amount, count: value.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  });

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || 'label';
  }
}
