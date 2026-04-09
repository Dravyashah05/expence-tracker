import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-balance-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="balance-summary-container">
      <!-- Main Balance Card -->
      <mat-card class="balance-card elevated">
        <mat-card-content class="balance-content">
          <div class="balance-header">
            <div>
              <p class="label-lg">Total Balance</p>
              <h2 class="display-md currency">{{ totalBalance() }}</h2>
              <p class="body-sm text-on-surface-variant" style="margin-top: 12px;">
                {{ lastUpdated() }}
              </p>
            </div>
            <div class="balance-icon">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Summary Stats Grid -->
      <div class="summary-grid">
        <!-- Income Card -->
        <mat-card class="summary-card income-card">
          <mat-card-content>
            <div class="card-content">
              <div class="icon-wrapper income">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-text">
                <p class="label-md">Total Income</p>
                <h3 class="headline-md currency">{{ totalIncome() }}</h3>
                <p class="body-sm">{{ incomeTransactionCount() }} transactions</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Expense Card -->
        <mat-card class="summary-card expense-card">
          <mat-card-content>
            <div class="card-content">
              <div class="icon-wrapper expense">
                <mat-icon>trending_down</mat-icon>
              </div>
              <div class="stat-text">
                <p class="label-md">Total Expenses</p>
                <h3 class="headline-md currency">{{ totalExpense() }}</h3>
                <p class="body-sm">{{ expenseTransactionCount() }} transactions</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Savings Rate Card -->
        <mat-card class="summary-card savings-card">
          <mat-card-content>
            <div class="card-content">
              <div class="icon-wrapper savings">
                <mat-icon>savings</mat-icon>
              </div>
              <div class="stat-text">
                <p class="label-md">Savings Rate</p>
                <h3 class="headline-md">{{ savingsRate() }}</h3>
                <p class="body-sm">Of total income</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Average Transaction Card -->
        <mat-card class="summary-card average-card">
          <mat-card-content>
            <div class="card-content">
              <div class="icon-wrapper">
                <mat-icon>show_chart</mat-icon>
              </div>
              <div class="stat-text">
                <p class="label-md">Average Transaction</p>
                <h3 class="headline-md currency">{{ averageTransaction() }}</h3>
                <p class="body-sm">Across all transactions</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .balance-summary-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        width: 100%;
      }

      /* Balance Card */
      .balance-card {
        background: linear-gradient(135deg, var(--md3-primary) 0%, var(--md3-tertiary) 100%);
        color: var(--md3-on-primary);
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Elevated */
      }

      .balance-content {
        padding: 24px !important;
      }

      .text-on-surface-variant {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .balance-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .balance-header h2 {
        margin: 8px 0 0 0;
        color: var(--md3-on-primary);
        font-variant-numeric: tabular-nums;
      }

      .balance-header p {
        margin: 0;
      }

      .balance-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 999px;
        color: var(--md3-on-primary);
      }

      .balance-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      /* Summary Grid */
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: var(--spacing-lg);
      }

      .summary-card {
        display: flex;
        align-items: stretch;
        overflow: hidden;
        position: relative;
        border-radius: 16px;
      }

      /* Side border accent */
      .summary-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: var(--md3-primary);
        z-index: 1;
      }

      .income-card::before {
        background: var(--income-color);
      }

      .expense-card::before {
        background: var(--expense-color);
      }

      .savings-card::before {
        background: #10b981; /* Success color */
      }

      .card-content {
        display: flex;
        gap: var(--spacing-lg);
        flex: 1;
        align-items: flex-start;
        padding-left: var(--spacing-sm); /* Add space for border */
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--md3-primary) 15%, transparent);
        color: var(--md3-primary);
        flex-shrink: 0;
      }

      .icon-wrapper.income {
        background: color-mix(in srgb, var(--income-color) 15%, transparent);
        color: var(--income-color);
      }

      .icon-wrapper.expense {
        background: color-mix(in srgb, var(--expense-color) 15%, transparent);
        color: var(--expense-color);
      }

      .icon-wrapper.savings {
        background: color-mix(in srgb, #10b981 15%, transparent);
        color: #10b981;
      }

      .icon-wrapper mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-text p {
        margin: 0;
      }

      .stat-text h3 {
        margin: 4px 0 0 0;
        font-variant-numeric: tabular-nums;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .summary-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .balance-header {
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .balance-icon {
          width: 64px;
          height: 64px;
        }

        .balance-icon mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
        }
      }

      @media (max-width: 480px) {
        .summary-grid {
          grid-template-columns: 1fr;
        }

        .balance-header h2 {
          font-size: 32px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceSummaryComponent {
  // Input properties
  totalBalance = input<string>('$0.00');
  totalIncome = input<string>('$0.00');
  totalExpense = input<string>('$0.00');
  incomeTransactionCount = input<number>(0);
  expenseTransactionCount = input<number>(0);
  lastUpdatedDate = input<Date>(new Date());

  // Computed properties
  lastUpdated = computed(() => {
    const date = this.lastUpdatedDate();
    return `Last updated: ${date.toLocaleDateString()}`;
  });

  savingsRate = computed(() => {
    const income = parseFloat(this.totalIncome().replace('$', ''));
    const expense = parseFloat(this.totalExpense().replace('$', ''));
    const total = income - expense;
    const rate = income > 0 ? ((total / income) * 100).toFixed(1) : '0.0';
    return `${rate}%`;
  });

  averageTransaction = computed(() => {
    const totalCount = this.incomeTransactionCount() + this.expenseTransactionCount();
    if (totalCount === 0) return '$0.00';

    const income = parseFloat(this.totalIncome().replace('$', ''));
    const expense = parseFloat(this.totalExpense().replace('$', ''));
    const total = income + expense;
    const average = total / totalCount;
    return `$${average.toFixed(2)}`;
  });
}
