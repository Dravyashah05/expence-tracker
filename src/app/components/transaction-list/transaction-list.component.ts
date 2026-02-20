import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { LoaderComponent } from '../loader/loader.component';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    LoaderComponent,
    AppCurrencyPipe,
  ],
  template: `
    <div class="transaction-list-container">
      <!-- Header -->
      <header class="transactions-header">
        <div>
          <h1 class="headline-lg">Transactions</h1>
          <p class="body-md" style="color: var(--md3-on-background-variant); margin-top: 4px;">
            View and manage all your transactions
          </p>
        </div>
        @if (transactionService.isLoading()) {
          <div class="inline-loader">
            <app-loader size="sm"></app-loader>
            <span>Loading</span>
          </div>
        }
        <button mat-flat-button color="primary" routerLink="/add-transaction">
          <mat-icon>add</mat-icon>
          Add Transaction
        </button>
      </header>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <span class="label-md">Total Transactions</span>
              <mat-icon>receipt_long</mat-icon>
            </div>
            <p class="headline-md">{{ totalCount() }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <span class="label-md">Total Income</span>
              <mat-icon class="income-icon">trending_up</mat-icon>
            </div>
            <p class="headline-md income-text">{{ totalIncome() }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <span class="label-md">Total Expenses</span>
              <mat-icon class="expense-icon">trending_down</mat-icon>
            </div>
            <p class="headline-md expense-text">{{ totalExpense() }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Filter by Type</mat-label>
          <mat-select [(ngModel)]="filterType">
            <mat-option value="">All Types</mat-option>
            <mat-option value="income">Income</mat-option>
            <mat-option value="expense">Expense</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Sort By</mat-label>
          <mat-select [(ngModel)]="sortBy">
            <mat-option value="recent">Most Recent</mat-option>
            <mat-option value="oldest">Oldest</mat-option>
            <mat-option value="amount-high">Highest Amount</mat-option>
            <mat-option value="amount-low">Lowest Amount</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Transactions List -->
      <div class="transactions-section">
        @if (filteredTransactions().length > 0) {
          <div class="transactions-group">
            @for (transaction of filteredTransactions(); track transaction.id) {
              <mat-card class="transaction-card" appearance="outlined">
                <mat-card-content class="transaction-card-content">
                    <div class="transaction-content">
                    <div class="transaction-left">
                        <div [class]="'transaction-icon ' + (transaction.type === 'income' ? 'income' : 'expense')">
                        <mat-icon>
                            {{ transaction.type === 'income' ? 'add_circle' : 'remove_circle' }}
                        </mat-icon>
                        </div>
                        <div class="transaction-info">
                        <p class="body-md" style="font-weight: 500; margin: 0;">{{ transaction.category }}</p>
                        <p class="body-sm" style="color: var(--md3-on-surface-variant); margin: 4px 0 0 0;">
                            {{ transaction.date | date: 'medium' }}
                        </p>
                        <p class="body-sm" style="color: var(--md3-on-surface-variant); margin: 4px 0 0 0;">
                            {{ getPaymentLabel(transaction) }}
                        </p>
                        @if (transaction.description) {
                            <p class="body-sm" style="color: var(--md3-on-surface-variant); margin: 4px 0 0 0;">
                            {{ transaction.description }}
                            </p>
                        }
                        </div>
                    </div>
                    <div class="transaction-right">
                        <p [class]="'transaction-amount ' + (transaction.type === 'income' ? 'income' : 'expense')">
                        {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | appCurrency }}
                        </p>
                    </div>
                    </div>
                    <div class="transaction-actions">
                    <button
                        mat-icon-button
                        (click)="editTransaction(transaction)"
                        matTooltip="Edit transaction"
                    >
                        <mat-icon>edit</mat-icon>
                    </button>
                    <button
                        mat-icon-button
                        color="warn"
                        (click)="deleteTransaction(transaction.id)"
                        matTooltip="Delete transaction"
                        [disabled]="deletingId() === transaction.id"
                    >
                        @if (deletingId() === transaction.id) {
                          <app-loader size="sm"></app-loader>
                        } @else {
                          <mat-icon>delete</mat-icon>
                        }
                    </button>
                    </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon class="empty-icon">receipt_long</mat-icon>
            <h3 class="headline-sm">No transactions found</h3>
            <p class="body-md">Start by adding your first transaction</p>
            <button mat-flat-button color="primary" routerLink="/add-transaction">
              <mat-icon>add</mat-icon>
              Add Transaction
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .transaction-list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--md3-background);
      overflow-y: auto;
    }

    /* Header */
    .transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .transactions-header h1 {
      margin: 0;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .stat-card {
        border-radius: 16px;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--md3-on-surface-variant);
      margin-bottom: var(--spacing-sm);
    }

    .stat-header mat-icon {
      color: var(--md3-primary);
    }

    .income-icon {
      color: var(--income-color) !important;
    }

    .expense-icon {
      color: var(--expense-color) !important;
    }
    
    .income-text { color: var(--income-color); }
    .expense-text { color: var(--expense-color); }

    .stat-card p {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }

    /* Filters */
    .filters-section {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }
    
    .filters-section mat-form-field {
        min-width: 150px;
    }

    /* Transactions Section */
    .transactions-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .transactions-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    /* Transaction Card */
    .transaction-card {
      transition: all var(--transition-standard);
      border-radius: 12px;
    }

    .transaction-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .transaction-card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px !important;
    }

    .transaction-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      gap: var(--spacing-lg);
    }

    .transaction-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex: 1;
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .transaction-icon.income {
      background: linear-gradient(135deg, var(--income-color) 0%, #27ae60 100%);
    }

    .transaction-icon.expense {
      background: linear-gradient(135deg, var(--expense-color) 0%, #c0392b 100%);
    }

    .transaction-info {
      flex: 1;
      min-width: 0;
    }

    .transaction-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-sm);
    }

    .transaction-amount {
      font-weight: 600;
      font-size: var(--font-title-md);
      font-variant-numeric: tabular-nums;
      margin: 0;
    }

    .transaction-amount.income {
      color: var(--income-color);
    }

    .transaction-amount.expense {
      color: var(--expense-color);
    }

    .transaction-actions {
      display: flex;
      gap: 0;
      margin-left: var(--spacing-md);
    }

    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--md3-on-background-variant);
      font-weight: 600;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl) var(--spacing-lg);
      border: 1px dashed var(--md3-outline-variant);
      border-radius: var(--radius-lg);
      background-color: color-mix(in srgb, var(--md3-primary) 5%, transparent);
      color: var(--md3-on-surface-variant);
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--md3-primary);
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0;
    }

    .empty-state p {
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .transaction-list-container {
        padding: var(--spacing-md);
      }

      .transactions-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .transactions-header button {
          width: 100%;
          margin-top: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .transaction-card-content {
        flex-direction: column;
        align-items: stretch;
      }

      .transaction-content {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
      
      .transaction-left {
          width: 100%;
      }
      
      .transaction-right {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
      }
      
      .transaction-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
          margin-left: 0;
          border-top: 1px solid var(--md3-outline-variant);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  transactionService = inject(TransactionService);

  transactions = computed(() => this.transactionService.allTransactions());
  filterType = signal<'' | 'income' | 'expense'>('');
  sortBy = signal<'recent' | 'oldest' | 'amount-high' | 'amount-low'>('recent');
  deletingId = signal<string | null>(null);

  totalCount = computed(() => this.transactions().length);

  totalIncome = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2);
  });

  totalExpense = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2);
  });

  filteredTransactions = computed(() => {
    let filtered = this.transactions();

    // Filter by type
    if (this.filterType()) {
      filtered = filtered.filter(t => t.type === this.filterType());
    }

    // Sort
    switch (this.sortBy()) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-high':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-low':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return filtered;
  });

  editTransaction(transaction: Transaction) {
    console.log('Edit transaction:', transaction);
  }

  getPaymentLabel(transaction: Transaction): string {
    const method = transaction.paymentMethod || 'Cash';
    if (!transaction.paymentSource) return method;
    return `${method} - ${transaction.paymentSource}`;
  }

  async deleteTransaction(id: string) {
    this.deletingId.set(id);
    try {
      await this.transactionService.deleteTransaction(id);
    } finally {
      this.deletingId.set(null);
    }
  }
}
