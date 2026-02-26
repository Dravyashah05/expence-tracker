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
            <span class="chart-pill">Income vs Expense</span>
          </div>

          <div class="bars">
            <div class="y-scale">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
            </div>
            @for (item of weeklyBars(); track item.week) {
              <div class="col">
                <div class="pair" [attr.aria-label]="item.week + ' trend'">
                  <span class="bar income" [style.height.%]="item.income">
                    <em>{{ item.income }}%</em>
                  </span>
                  <span class="bar expense" [style.height.%]="item.expense">
                    <em>{{ item.expense }}%</em>
                  </span>
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
      padding: 1.2rem;
      background:
        radial-gradient(100% 70% at 100% 0%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 60%),
        linear-gradient(180deg, color-mix(in srgb, var(--card) 86%, #0c1a2a), var(--card));
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
      font-size: 0.8rem;
    }

    .chart-pill {
      border: 1px solid color-mix(in srgb, var(--line) 70%, var(--primary));
      border-radius: 999px;
      padding: 0.35rem 0.7rem;
      background: color-mix(in srgb, var(--card) 85%, var(--primary));
    }

    .bars {
      border-top: 1px solid color-mix(in srgb, var(--line) 75%, transparent);
      margin-top: 0.2rem;
      padding-top: 1rem;
      display: grid;
      grid-template-columns: 44px repeat(4, minmax(0, 1fr));
      gap: 0.65rem;
      align-items: end;
      min-height: 210px;
      background-image: linear-gradient(
        to top,
        color-mix(in srgb, var(--line) 22%, transparent) 1px,
        transparent 1px
      );
      background-size: 100% 25%;
    }

    .y-scale {
      height: 162px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding-right: 0.2rem;
    }

    .y-scale span {
      color: var(--text-soft);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
    }

    .pair {
      width: min(80px, 100%);
      height: 162px;
      display: flex;
      align-items: end;
      justify-content: center;
      gap: 0.45rem;
    }

    .bar {
      width: 26px;
      border-radius: 10px 10px 8px 8px;
      display: inline-flex;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      box-shadow: 0 10px 24px color-mix(in srgb, #000 32%, transparent);
      min-height: 8px;
    }

    .bar.income {
      background: linear-gradient(180deg, color-mix(in srgb, var(--success) 70%, #fff), var(--success));
    }

    .bar.expense {
      background: linear-gradient(180deg, color-mix(in srgb, var(--danger) 60%, #fff), var(--danger));
    }

    .bar em {
      position: absolute;
      top: -1.2rem;
      font-style: normal;
      font-size: 0.65rem;
      font-weight: 700;
      color: color-mix(in srgb, var(--text-soft) 90%, #fff);
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
    }

    .col small {
      font-weight: 700;
    }

    .legend {
      margin-top: 0.95rem;
      display: inline-flex;
      gap: 1rem;
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
      border-top: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
      padding-top: 0.8rem;
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
      padding: 1.1rem;
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
      border-bottom: 1px solid color-mix(in srgb, var(--line) 75%, transparent);
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
        grid-template-columns: 32px repeat(4, minmax(0, 1fr));
        min-height: 180px;
        gap: 0.4rem;
      }

      .pair {
        width: 100%;
        gap: 0.25rem;
      }

      .bar {
        width: min(22px, 42%);
      }

      .bar em {
        font-size: 0.6rem;
        top: -1rem;
      }

      .y-scale {
        height: 140px;
      }

      .chart-head {
        flex-direction: column;
        align-items: flex-start;
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
      income: Math.round(30 + ((incomeScale * (0.6 + i * 0.08)) % 65)),
      expense: Math.round(20 + ((expScale * (0.5 + i * 0.07)) % 52)),
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
