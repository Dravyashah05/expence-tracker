import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-export-data',
  imports: [CommonModule, RouterLink, MatIconModule, AppCurrencyPipe, LoaderComponent],
  template: `
    <section class="page-shell">
      <div class="page-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">Export Data</h1>
            <p class="page-subtitle">Download your transaction data in multiple formats.</p>
          </div>
          @if (transactionService.isLoading()) {
            <div class="inline-loader">
              <app-loader size="sm"></app-loader>
              <span>Loading</span>
            </div>
          }
          <a routerLink="/dashboard" class="btn-outline">Back</a>
        </header>

        <section class="metric-grid">
          <article class="surface-card metric-card">
            <p class="label">Transactions</p>
            <p class="metric-value">{{ transactionCount() }}</p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Income</p>
            <p class="metric-value income">{{ totalIncome() | appCurrency }}</p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Expenses</p>
            <p class="metric-value expense">{{ totalExpenses() | appCurrency }}</p>
          </article>
          <article class="surface-card metric-card">
            <p class="label">Net</p>
            <p
              class="metric-value"
              [class.income]="netBalance() >= 0"
              [class.expense]="netBalance() < 0"
            >
              {{ netBalance() | appCurrency }}
            </p>
          </article>
        </section>

        <section class="actions-grid">
          <article class="surface-card action-card">
            <h3><mat-icon>table_view</mat-icon>CSV Export</h3>
            <p>Great for spreadsheets and quick filters.</p>
            <button class="btn-solid" (click)="exportCSV()" [disabled]="!hasTransactions()">
              Download CSV
            </button>
          </article>

          <article class="surface-card action-card">
            <h3><mat-icon>data_object</mat-icon>JSON Export</h3>
            <p>Good for backups and structured integrations.</p>
            <button class="btn-solid" (click)="exportJSON()" [disabled]="!hasTransactions()">
              Download JSON
            </button>
          </article>

          <article class="surface-card action-card">
            <h3><mat-icon>description</mat-icon>Report Text</h3>
            <p>Simple human-readable report with summary and lines.</p>
            <button class="btn-solid" (click)="exportPDF()" [disabled]="!hasTransactions()">
              Generate Report
            </button>
          </article>
        </section>

        @if (exportStatus()) {
          <p class="status" [class.error]="exportStatus().includes('Error')">
            {{ exportStatus() }}
          </p>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .actions-grid {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .inline-loader {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-soft);
      font-weight: 600;
    }

    .action-card {
      padding: 0.95rem;
      display: grid;
      gap: 0.62rem;
      align-content: start;
    }

    .action-card h3 {
      display: flex;
      align-items: center;
      gap: 0.42rem;
      font-size: 1rem;
    }

    .action-card h3 mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
      color: var(--primary);
    }

    .action-card p {
      color: var(--text-soft);
      font-size: 0.89rem;
      min-height: 2.6em;
    }

    .action-card button {
      justify-self: start;
    }

    .status {
      margin-top: 0.9rem;
      padding: 0.7rem 0.82rem;
      border-radius: 12px;
      background: color-mix(in srgb, var(--success) 12%, var(--surface));
      color: var(--success);
      border: 1px solid color-mix(in srgb, var(--success) 28%, var(--line));
      font-weight: 600;
    }

    .status.error {
      background: color-mix(in srgb, var(--danger) 12%, var(--surface));
      color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 32%, var(--line));
    }

    @media (max-width: 980px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .action-card button {
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDataComponent {
  transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  exportStatus = signal('');
  transactionCount = computed(() => this.transactionService.allTransactions().length);
  totalIncome = computed(() => this.transactionService.totalIncome());
  totalExpenses = computed(() => this.transactionService.totalExpenses());
  netBalance = computed(() => this.transactionService.netBalance());
  hasTransactions = computed(() => this.transactionCount() > 0);

  exportCSV(): void {
    const transactions = this.transactionService.allTransactions();
    const headers = [
      'ID',
      'Type',
      'Category',
      'Amount',
      'Payment Method',
      'Payment Source',
      'Description',
      'Date',
    ];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.category,
      t.amount,
      t.paymentMethod || 'Cash',
      t.paymentSource || '',
      t.description,
      new Date(t.date).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    this.downloadFile(csvContent, 'transactions.csv', 'text/csv');
    this.exportStatus.set('CSV exported successfully.');
    setTimeout(() => this.exportStatus.set(''), 3000);
  }

  exportJSON(): void {
    const data = {
      user: this.authService.user(),
      exportDate: new Date().toISOString(),
      transactions: this.transactionService.allTransactions(),
      summary: {
        totalIncome: this.totalIncome(),
        totalExpenses: this.totalExpenses(),
        netBalance: this.netBalance(),
        transactionCount: this.transactionCount(),
      },
    };

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, 'expense-tracker-data.json', 'application/json');
    this.exportStatus.set('JSON exported successfully.');
    setTimeout(() => this.exportStatus.set(''), 3000);
  }

  exportPDF(): void {
    const transactions = this.transactionService.allTransactions();
    const user = this.authService.user();

    let report = `EXPENSE TRACKER REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `User: ${user?.name || 'N/A'}\n\n`;
    report += `SUMMARY\n`;
    report += `Income: ${this.totalIncome()}\n`;
    report += `Expenses: ${this.totalExpenses()}\n`;
    report += `Net Balance: ${this.netBalance()}\n`;
    report += `Transactions: ${this.transactionCount()}\n\n`;
    report += `TRANSACTIONS\n`;

    transactions.forEach((t) => {
      report += `${new Date(t.date).toLocaleDateString()} | ${t.type.toUpperCase()} | ${t.category} | ${t.amount} | ${t.paymentMethod || 'Cash'} ${t.paymentSource || ''} | ${t.description || '-'}\n`;
    });

    this.downloadFile(report, 'expense-report.txt', 'text/plain');
    this.exportStatus.set('Report generated successfully.');
    setTimeout(() => this.exportStatus.set(''), 3000);
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
