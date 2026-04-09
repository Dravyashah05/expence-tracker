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
            <h1 class="page-title">Analytics Insight</h1>
            <p class="page-subtitle">Detailed breakdown of your financial flow.</p>
          </div>
          @if (transactionService.isLoading()) {
            <div class="inline-loader">
              <app-loader size="sm"></app-loader>
              <span>Syncing</span>
            </div>
          }
        </header>

        <section class="metric-grid">
          <article class="glass-card metric-card">
            <div class="metric-icon income-bg"><mat-icon>north_east</mat-icon></div>
            <div class="metric-info">
              <p class="label">Total Income</p>
              <p class="metric-value income">{{ totalIncome() | appCurrency }}</p>
            </div>
          </article>
          <article class="glass-card metric-card">
            <div class="metric-icon expense-bg"><mat-icon>south_west</mat-icon></div>
            <div class="metric-info">
              <p class="label">Total Expenses</p>
              <p class="metric-value expense">{{ totalExpenses() | appCurrency }}</p>
            </div>
          </article>
          <article class="glass-card metric-card">
            <div class="metric-icon net-bg">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="metric-info">
              <p class="label">Net Balance</p>
              <p class="metric-value" [class.income]="(totalIncome() - totalExpenses()) >= 0" [class.expense]="(totalIncome() - totalExpenses()) < 0">
                {{ totalIncome() - totalExpenses() | appCurrency }}
              </p>
            </div>
          </article>
          <article class="glass-card metric-card">
            <div class="metric-icon savings-bg"><mat-icon>savings</mat-icon></div>
            <div class="metric-info">
              <p class="label">Savings Rate</p>
              <p class="metric-value">{{ savingsRate() | number:'1.0-1' }}%</p>
            </div>
          </article>
          <article class="glass-card metric-card">
            <div class="metric-icon tx-bg"><mat-icon>receipt_long</mat-icon></div>
            <div class="metric-info">
              <p class="label">Transactions</p>
              <p class="metric-value">{{ transactionCount() }}</p>
            </div>
          </article>
          <article class="glass-card metric-card">
            <div class="metric-icon warn-bg"><mat-icon>warning</mat-icon></div>
            <div class="metric-info">
              <p class="label">Largest Expense</p>
              <p class="metric-value expense">{{ largestExpense() | appCurrency }}</p>
            </div>
          </article>
        </section>

        <section class="glass-card chart-wrap">
          <div class="chart-head">
            <div>
              <h3>Balance Overview</h3>
              <small>Income vs Expense projection</small>
            </div>
            <span class="chart-pill">Monthly Trend</span>
          </div>

          <!-- Income vs Expense visual ratio -->
          <div class="ratio-bar">
            <div class="ratio-income" [style.width.%]="incomeRatio()"></div>
            <div class="ratio-expense" [style.width.%]="expenseRatio()"></div>
          </div>
          <div class="ratio-labels">
            <span>{{ incomeRatio() | number:'1.0-0' }}% Income</span>
            <span>{{ expenseRatio() | number:'1.0-0' }}% Expense</span>
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

        <div class="lists-grid">
          <section class="glass-card spend-list">
            <div class="list-head">
              <h3>Top Spending Categories</h3>
              <mat-icon class="head-icon expense">trending_down</mat-icon>
            </div>

            @if (topExpenses().length === 0) {
              <p class="empty">No expense transactions available yet.</p>
            } @else {
              @for (item of topExpenses(); track item.category) {
                <article class="spend-row list-item-hover">
                  <div class="category-copy">
                    <div class="icon-wrap expense-wrap">
                      <mat-icon class="cat-icon">{{ getCategoryIcon(item.category) }}</mat-icon>
                    </div>
                    <div>
                      <p>{{ item.category }}</p>
                      <small>{{ item.count }} transactions</small>
                    </div>
                  </div>
                  <strong>-{{ item.amount | appCurrency }}</strong>
                </article>
              }
            }
          </section>

          <section class="glass-card spend-list">
            <div class="list-head">
               <h3>Top Income Sources</h3>
               <mat-icon class="head-icon income">trending_up</mat-icon>
            </div>

            @if (topIncomes().length === 0) {
              <p class="empty">No income transactions available yet.</p>
            } @else {
              @for (item of topIncomes(); track item.category) {
                <article class="spend-row list-item-hover">
                  <div class="category-copy">
                    <div class="icon-wrap income-wrap">
                      <mat-icon class="cat-icon">{{ getCategoryIcon(item.category) }}</mat-icon>
                    </div>
                    <div>
                      <p>{{ item.category }}</p>
                      <small>{{ item.count }} transactions</small>
                    </div>
                  </div>
                  <strong class="income-text">+{{ item.amount | appCurrency }}</strong>
                </article>
              }
            }
          </section>
        </div>
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

    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-soft);
      font-weight: 600;
      background: color-mix(in srgb, var(--surface) 60%, transparent);
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .page-title {
      background: linear-gradient(120deg, var(--text), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
      font-size: clamp(1.5rem, 3vw, 2.2rem);
    }

    .page-subtitle {
      color: var(--text-soft);
      margin-top: 0.2rem;
    }

    .glass-card {
      background: color-mix(in srgb, var(--surface) 75%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid color-mix(in srgb, var(--line) 50%, #ffffff 20%);
      border-radius: var(--radius-md);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .glass-card:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      padding: 1.2rem;
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .metric-card:hover {
      transform: translateY(-3px);
    }

    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .metric-icon mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .income-bg { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
    .expense-bg { background: color-mix(in srgb, var(--danger) 15%, transparent); color: var(--danger); }
    .net-bg { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
    .savings-bg { background: color-mix(in srgb, #3b82f6 15%, transparent); color: #3b82f6; }
    .tx-bg { background: color-mix(in srgb, #8b5cf6 15%, transparent); color: #8b5cf6; }
    .warn-bg { background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-card .label {
      color: var(--text-soft);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }

    .metric-value {
      font-size: 1.35rem;
      font-weight: 800;
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
    }

    .metric-value.income { color: var(--success); }
    .metric-value.expense { color: var(--danger); }

    .chart-wrap {
      padding: 1.8rem;
      margin-bottom: 1.5rem;
      background:
        radial-gradient(100% 70% at 100% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 60%),
        color-mix(in srgb, var(--surface) 75%, transparent);
    }

    .ratio-bar {
      display: flex;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 1.2rem;
      background: var(--line);
    }

    .ratio-income { background: var(--success); transition: width 0.8s ease-out; }
    .ratio-expense { background: var(--danger); transition: width 0.8s ease-out; }

    .ratio-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-soft);
      margin-bottom: 1.5rem;
    }

    .chart-head {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
    }

    .chart-head h3 {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .chart-head small {
      color: var(--text-soft);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .chart-pill {
      border: 1px solid color-mix(in srgb, var(--line) 70%, var(--primary));
      border-radius: 999px;
      padding: 0.4rem 0.8rem;
      background: color-mix(in srgb, var(--surface) 85%, var(--primary) 10%);
      font-weight: 600;
      font-size: 0.8rem;
    }

    .bars {
      border-top: 1px dashed color-mix(in srgb, var(--line) 75%, transparent);
      padding-top: 1.5rem;
      display: grid;
      grid-template-columns: 44px repeat(4, minmax(0, 1fr));
      gap: 1rem;
      align-items: end;
      min-height: 220px;
      background-image: linear-gradient(
        to top,
        color-mix(in srgb, var(--line) 30%, transparent) 1px,
        transparent 1px
      );
      background-size: 100% 25%;
    }

    .y-scale {
      height: 100%;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding-right: 0.5rem;
      padding-bottom: 2rem;
    }

    .y-scale span {
      color: var(--text-soft);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      height: 100%;
      justify-content: flex-end;
    }

    .pair {
      width: min(90px, 100%);
      height: 180px;
      display: flex;
      align-items: end;
      justify-content: center;
      gap: 0.5rem;
      padding-bottom: 2rem;
    }

    .bar {
      width: 32px;
      border-radius: 6px 6px 4px 4px;
      display: inline-flex;
      align-items: flex-start;
      justify-content: center;
      position: relative;
      min-height: 8px;
      transition: height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .bar.income {
      background: linear-gradient(180deg, color-mix(in srgb, var(--success) 80%, #fff), var(--success));
      box-shadow: 0 4px 12px color-mix(in srgb, var(--success) 30%, transparent);
    }

    .bar.expense {
      background: linear-gradient(180deg, color-mix(in srgb, var(--danger) 80%, #fff), var(--danger));
      box-shadow: 0 4px 12px color-mix(in srgb, var(--danger) 30%, transparent);
    }

    .bar em {
      position: absolute;
      top: -1.7rem;
      font-style: normal;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-soft);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .pair:hover .bar em {
      opacity: 1;
    }

    .col small {
      font-weight: 700;
      color: var(--text-soft);
      margin-top: -1.5rem;
    }

    .legend {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 700;
    }

    .legend span {
      display: flex;
      align-items: center;
    }

    .legend i {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 0.4rem;
    }

    .income-dot { background: var(--success); }
    .expense-dot { background: var(--danger); }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .spend-list {
      padding: 1.5rem;
    }

    .list-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem;
    }

    .list-head h3 {
      font-size: 1.2rem;
    }

    .head-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    
    .head-icon.expense { color: var(--danger); }
    .head-icon.income { color: var(--success); }

    .spend-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem;
      border-radius: var(--radius-sm);
      margin-bottom: 0.4rem;
      transition: background 0.2s ease;
    }

    .list-item-hover:hover {
      background: color-mix(in srgb, var(--surface) 60%, transparent);
    }

    .spend-row:last-child {
      margin-bottom: 0;
    }

    .category-copy {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .expense-wrap {
      background: color-mix(in srgb, var(--danger) 10%, transparent);
      color: var(--danger);
    }

    .income-wrap {
      background: color-mix(in srgb, var(--success) 10%, transparent);
      color: var(--success);
    }

    .cat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .category-copy p {
      font-weight: 700;
      margin-bottom: 0.1rem;
      font-size: 0.95rem;
    }

    .category-copy small {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .spend-row strong {
      color: var(--danger);
      font-size: 1.1rem;
      font-weight: 800;
    }

    .spend-row .income-text {
      color: var(--success);
    }

    .empty {
      color: var(--text-soft);
      text-align: center;
      padding: 2.5rem 0;
      font-weight: 500;
      font-size: 0.9rem;
    }

    @media (max-width: 900px) {
      .metric-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 700px) {
      .metric-grid {
        grid-template-columns: 1fr;
      }

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
        top: -1.2rem;
      }

      .col small {
        font-size: 0.75rem;
      }

      .y-scale {
        min-height: 160px;
      }

      .chart-head {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .lists-grid {
        grid-template-columns: 1fr;
      }
      
      .page-header {
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

  incomeRatio = computed(() => {
    const inc = this.totalIncome();
    const exp = this.totalExpenses();
    const total = inc + exp;
    if (total === 0) return 50;
    return (inc / total) * 100;
  });

  expenseRatio = computed(() => {
    const inc = this.totalIncome();
    const exp = this.totalExpenses();
    const total = inc + exp;
    if (total === 0) return 50;
    return (exp / total) * 100;
  });

  largestExpense = computed(() => {
    const expenses = this.transactionService.allTransactions().filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map(t => t.amount));
  });

  savingsRate = computed(() => {
    const inc = this.totalIncome();
    const exp = this.totalExpenses();
    if (inc === 0) return 0;
    const rate = ((inc - exp) / inc) * 100;
    return rate > 0 ? rate : 0;
  });

  transactionCount = computed(() => this.transactionService.allTransactions().length);

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

  topIncomes = computed(() => {
    const incomes = this.transactionService.allTransactions().filter(t => t.type === 'income');
    const map = new Map<string, { amount: number; count: number }>();

    for (const item of incomes) {
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
