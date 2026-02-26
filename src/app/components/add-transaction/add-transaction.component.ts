import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { SettingsService } from '../../services/settings.service';
import { SoundService } from '../../services/sound.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, AppCurrencyPipe, LoaderComponent],
  template: `
    <section class="page-shell">
      <form class="page-content form-wrap" [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <header class="page-header">
          <div>
            <h1 class="page-title">Add Transaction</h1>
            <p class="page-subtitle">Capture income and expenses in a clean single-step form.</p>
          </div>
          <button class="btn-outline" type="button" (click)="goBack()">Back</button>
        </header>

        <section class="surface-card form-card">
          <div class="type-tabs">
            <button type="button" [class.active]="transactionForm.get('type')?.value === 'income'" (click)="selectType('income')">Income</button>
            <button type="button" [class.active]="transactionForm.get('type')?.value === 'expense'" (click)="selectType('expense')">Expense</button>
          </div>

          <label class="amount-box">
            <span>Amount</span>
            <div class="amount-row">
              <i>{{ settingsService.currencySymbol() }}</i>
              <input type="number" step="0.01" formControlName="amount" placeholder="0.00">
            </div>
          </label>

          <div class="quick-amounts">
            <p>Quick Amounts</p>
            <div class="amount-chips">
              @for (amount of quickAmounts(); track amount) {
                <button type="button" class="chip" [class.active]="isQuickAmountSelected(amount)" (click)="setQuickAmount(amount)">
                  {{ amount | appCurrency }}
                </button>
              }
            </div>
          </div>

          <div class="category-field">
            <span>Category</span>
            <div class="category-tools">
              <div class="merge-row">
                <input
                  type="text"
                  [value]="categorySearch()"
                  (input)="onCategorySearch($event)"
                  placeholder="Search category or type new..."
                >
                <button type="button" class="btn-outline add-custom" (click)="addCustomCategory()" [disabled]="!canAddCustomCategory()">
                  Add
                </button>
              </div>
              <small class="hint">Type to search. If not found, click Add to create a custom category.</small>
            </div>

            @if (recentCategories().length > 0) {
              <div class="recent-cats">
                <p>Recent</p>
                <div>
                  @for (cat of recentCategories(); track cat.name) {
                    <button type="button" (click)="selectCategory(cat.name)">
                      <mat-icon>{{ cat.icon }}</mat-icon>
                      {{ cat.name }}
                    </button>
                  }
                </div>
              </div>
            }

            <div class="category-list">
              @if (filteredCategories().length === 0) {
                <p class="empty-list">No category found.</p>
              } @else {
                @for (cat of filteredCategories(); track cat.name) {
                  <button
                    type="button"
                    class="cat-option"
                    [class.active]="transactionForm.get('category')?.value === cat.name"
                    (click)="selectCategory(cat.name)"
                  >
                    <span class="cat-left">
                      <mat-icon>{{ cat.icon }}</mat-icon>
                      <span>{{ cat.name }}</span>
                    </span>
                    <mat-icon class="check">check_circle</mat-icon>
                  </button>
                }
              }
            </div>
          </div>

          <label>
            <span>Date</span>
            <input type="date" formControlName="date" [max]="maxDate">
          </label>

          <label>
            <span>Description</span>
            <input type="text" formControlName="description" placeholder="Optional note">
          </label>

          <div class="payment-method">
            <span>Payment Method</span>
            <div class="method-tabs">
              @for (method of paymentMethods; track method) {
                <button
                  type="button"
                  [class.active]="transactionForm.get('paymentMethod')?.value === method"
                  (click)="selectPaymentMethod(method)"
                >
                  {{ method }}
                </button>
              }
            </div>
            <p class="method-preview">{{ selectedPaymentPreview() }}</p>
          </div>

          @if (isPaymentSourceRequired()) {
            <label class="payment-source">
              <span>{{ paymentSourceLabel() }}</span>
              @if (paymentSourceOptions().length > 0) {
                <select formControlName="paymentSource">
                  <option value="">Select {{ paymentSourceLabel().toLowerCase() }}</option>
                  @for (item of paymentSourceOptions(); track item) {
                    <option [value]="item">{{ item }}</option>
                  }
                </select>
              } @else {
                <input type="text" formControlName="paymentSource" [placeholder]="'Enter ' + paymentSourceLabel().toLowerCase()">
                <p class="empty-source">No saved {{ paymentSourceLabel().toLowerCase() }} found in Settings. You can enter it manually.</p>
              }
            </label>
          }

          @if (alertState(); as alert) {
            <p class="txn-alert" [class.success]="alert.type === 'success'" [class.error]="alert.type === 'error'" role="alert" aria-live="assertive">
              <mat-icon>{{ alert.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
              {{ alert.message }}
            </p>
          }

          <button class="btn-solid save" type="submit" [disabled]="transactionForm.invalid || isSaving()">
            @if (isSaving()) {
              <app-loader size="sm"></app-loader>
              Saving...
            } @else {
              Save Transaction
            }
          </button>
        </section>
      </form>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .form-card {
      padding: 0.95rem;
      display: grid;
      gap: 0.72rem;
    }

    .type-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.38rem;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.24rem;
    }

    .type-tabs button {
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--text-soft);
      font: inherit;
      font-weight: 700;
      padding: 0.56rem;
      cursor: pointer;
    }

    .type-tabs button.active {
      background: linear-gradient(125deg, var(--primary), var(--primary-strong));
      color: #fff;
    }

    label {
      display: grid;
      gap: 0.36rem;
    }

    label span {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    input,
    select {
      border: 1px solid var(--line);
      border-radius: var(--radius-sm);
      background: var(--surface);
      color: var(--text);
      font: inherit;
      padding: 0.7rem 0.8rem;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent);
    }

    .amount-box {
      border: 1px solid var(--line);
      border-radius: var(--radius-md);
      background: var(--surface-soft);
      padding: 0.8rem;
    }

    .amount-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .amount-row i {
      font-style: normal;
      color: #fff;
      font-size: 1rem;
      font-weight: 800;
      line-height: 1;
      width: 38px;
      height: 38px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--primary), var(--primary-strong));
      border: 1px solid color-mix(in srgb, var(--primary) 65%, var(--line));
      box-shadow: 0 8px 16px color-mix(in srgb, var(--primary) 24%, transparent);
      flex-shrink: 0;
    }

    .amount-row input {
      border: 0;
      border-bottom: 2px solid var(--line);
      border-radius: 0;
      background: transparent;
      font-size: 2.2rem;
      font-weight: 800;
      padding: 0.22rem 0 0.1rem;
      min-width: 0;
      width: 100%;
    }

    .amount-row input:focus {
      box-shadow: none;
      border-bottom-color: var(--primary);
    }

    .category-field {
      display: grid;
      gap: 0.36rem;
    }

    .category-field > span {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .quick-amounts p,
    .recent-cats p {
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
      margin: 0;
    }

    .amount-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.35rem;
    }

    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--surface);
      color: var(--text);
      padding: 0.4rem 0.68rem;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .chip.active {
      border-color: color-mix(in srgb, var(--primary) 50%, var(--line));
      background: color-mix(in srgb, var(--primary) 11%, var(--surface));
      color: var(--primary-strong);
    }

    .category-tools {
      display: grid;
      gap: 0.4rem;
    }

    .category-tools input {
      padding: 0.56rem 0.7rem;
    }

    .merge-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.4rem;
    }

    .add-custom {
      border-radius: 10px;
      padding: 0.55rem 0.74rem;
    }

    .hint {
      color: var(--text-soft);
      font-size: 0.74rem;
      font-weight: 600;
    }

    .recent-cats {
      margin-top: 0.2rem;
      display: grid;
      gap: 0.32rem;
    }

    .recent-cats > div {
      display: flex;
      flex-wrap: wrap;
      gap: 0.32rem;
    }

    .recent-cats button {
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--text-soft);
      border-radius: 999px;
      padding: 0.32rem 0.58rem;
      font: inherit;
      font-size: 0.77rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      cursor: pointer;
    }

    .recent-cats button mat-icon {
      width: 13px;
      height: 13px;
      font-size: 13px;
      color: var(--primary-strong);
    }

    .category-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.38rem;
      max-height: 250px;
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 0.45rem;
      background: var(--surface-soft);
    }

    .cat-option {
      border: 1px solid transparent;
      background: var(--surface);
      color: var(--text);
      border-radius: 12px;
      padding: 0.52rem 0.58rem;
      font: inherit;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      text-align: left;
    }

    .cat-left {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .cat-option mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: var(--primary-strong);
    }

    .cat-option .check {
      opacity: 0;
      color: var(--success);
      transition: opacity 0.18s ease;
    }

    .cat-option.active {
      border-color: color-mix(in srgb, var(--primary) 50%, var(--line));
      background: color-mix(in srgb, var(--primary) 11%, var(--surface));
    }

    .cat-option.active .check {
      opacity: 1;
    }

    .empty-list {
      margin: 0;
      color: var(--text-soft);
      font-size: 0.84rem;
      padding: 0.3rem;
      text-align: center;
    }

    .save {
      width: 100%;
      margin-top: 0.22rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
    }

    .payment-method {
      display: grid;
      gap: 0.36rem;
    }

    .payment-method > span {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .method-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.38rem;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.24rem;
    }

    .method-tabs button {
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: var(--text-soft);
      font: inherit;
      font-weight: 700;
      padding: 0.52rem;
      cursor: pointer;
    }

    .method-tabs button.active {
      color: var(--primary-strong);
      background: color-mix(in srgb, var(--primary) 12%, var(--surface));
      border: 1px solid color-mix(in srgb, var(--primary) 36%, var(--line));
    }

    .method-preview {
      margin: 0.1rem 0 0;
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .txn-alert {
      margin: 0;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: var(--surface-soft);
      padding: 0.6rem 0.72rem;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .txn-alert mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      flex-shrink: 0;
    }

    .txn-alert.success {
      border-color: color-mix(in srgb, var(--success) 35%, var(--line));
      background: color-mix(in srgb, var(--success) 9%, var(--surface));
      color: color-mix(in srgb, var(--success) 88%, var(--text));
    }

    .txn-alert.error {
      border-color: color-mix(in srgb, var(--danger) 38%, var(--line));
      background: color-mix(in srgb, var(--danger) 10%, var(--surface));
      color: color-mix(in srgb, var(--danger) 88%, var(--text));
    }

    .payment-source {
      display: grid;
      gap: 0.36rem;
    }

    .payment-source > span {
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .empty-source {
      margin: 0;
      border: 1px dashed var(--line);
      border-radius: 12px;
      background: var(--surface-soft);
      color: var(--text-soft);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.62rem 0.7rem;
    }

    @media (max-width: 700px) {
      .amount-row input {
        font-size: 1.9rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private soundService = inject(SoundService);
  settingsService = inject(SettingsService);

  transactionForm!: FormGroup;
  maxDate = '';
  isSaving = signal(false);
  alertState = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  categorySearch = signal('');
  paymentMethods: Array<'Cash' | 'Card' | 'Bank'> = ['Cash', 'Card', 'Bank'];
  private alertTimeoutId: ReturnType<typeof setTimeout> | null = null;
  cardOptions = computed(() => this.settingsService.cards());
  bankAccountOptions = computed(() => this.settingsService.bankAccounts());

  categories = signal<Array<{ name: string; icon: string; kind: 'income' | 'expense' | 'both' }>>([
    { name: 'Salary', icon: 'payments', kind: 'income' },
    { name: 'Freelance', icon: 'work', kind: 'income' },
    { name: 'Investment', icon: 'trending_up', kind: 'income' },
    { name: 'Gift Received', icon: 'redeem', kind: 'income' },
    { name: 'Gifts', icon: 'card_giftcard', kind: 'expense' },
    { name: 'Food', icon: 'restaurant', kind: 'expense' },
    { name: 'Groceries', icon: 'local_grocery_store', kind: 'expense' },
    { name: 'Transport', icon: 'directions_bus', kind: 'expense' },
    { name: 'Travel', icon: 'flight', kind: 'expense' },
    { name: 'Utilities', icon: 'bolt', kind: 'expense' },
    { name: 'Entertainment', icon: 'movie', kind: 'expense' },
    { name: 'Health', icon: 'health_and_safety', kind: 'expense' },
    { name: 'Shopping', icon: 'shopping_bag', kind: 'expense' },
    { name: 'Housing', icon: 'home', kind: 'expense' },
    { name: 'Rent', icon: 'apartment', kind: 'expense' },
    { name: 'Education', icon: 'school', kind: 'expense' },
    { name: 'Subscriptions', icon: 'subscriptions', kind: 'expense' },
    { name: 'Insurance', icon: 'shield', kind: 'expense' },
    { name: 'Pet Care', icon: 'pets', kind: 'expense' }
  ]);

  filteredCategories = computed(() => {
    const query = this.categorySearch().trim().toLowerCase();
    const type = this.transactionForm?.get('type')?.value as 'income' | 'expense' | undefined;
    return this.categories()
      .filter(cat => !type || cat.kind === type)
      .filter(cat => !query || cat.name.toLowerCase().includes(query));
  });

  recentCategories = computed(() => {
    const type = this.transactionForm?.get('type')?.value as 'income' | 'expense' | undefined;
    const recent = this.transactionService.allTransactions()
      .filter(item => !type || item.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const found = new Set<string>();
    const rows: Array<{ name: string; icon: string }> = [];
    for (const item of recent) {
      if (found.has(item.category)) continue;
      const category = this.categories().find(c => c.name === item.category);
      rows.push({ name: item.category, icon: category?.icon || 'label' });
      found.add(item.category);
      if (rows.length >= 5) break;
    }
    return rows;
  });

  quickAmounts = computed(() => {
    const type = this.transactionForm?.get('type')?.value as 'income' | 'expense' | undefined;
    if (type === 'income') return [500, 1000, 2500, 5000];
    return [10, 25, 50, 100];
  });

  canAddCustomCategory = computed(() => {
    const name = this.categorySearch().trim().toLowerCase();
    if (!name) return false;
    return !this.categories().some(cat => cat.name.toLowerCase() === name);
  });

  isPaymentSourceRequired = computed(() => {
    const method = this.transactionForm?.get('paymentMethod')?.value as 'Cash' | 'Card' | 'Bank' | undefined;
    return method === 'Card' || method === 'Bank';
  });

  paymentSourceLabel = computed(() => {
    const method = this.transactionForm?.get('paymentMethod')?.value as 'Cash' | 'Card' | 'Bank' | undefined;
    return method === 'Bank' ? 'Bank Account' : 'Card';
  });

  paymentSourceOptions = computed(() => {
    const method = this.transactionForm?.get('paymentMethod')?.value as 'Cash' | 'Card' | 'Bank' | undefined;
    if (method === 'Bank') return this.bankAccountOptions();
    if (method === 'Card') return this.cardOptions();
    return [];
  });

  selectedPaymentPreview = computed(() => {
    const method = this.transactionForm?.get('paymentMethod')?.value as 'Cash' | 'Card' | 'Bank' | undefined;
    const source = String(this.transactionForm?.get('paymentSource')?.value || '').trim();
    if (!method || method === 'Cash') return 'Selected: Cash';
    if (!source) return `Selected: ${method}`;
    return `Selected: ${method} - ${source}`;
  });

  ngOnInit(): void {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.maxDate = today;

    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      date: [today, [Validators.required, this.noFutureDateValidator]],
      description: [''],
      paymentMethod: ['Cash', Validators.required],
      paymentSource: [''],
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(() => this.syncCategoryForType());
    this.syncPaymentSourceRequirement();
  }

  ngOnDestroy(): void {
    this.clearAlertTimeout();
  }

  selectType(type: 'income' | 'expense'): void {
    this.transactionForm.patchValue({ type });
    this.syncCategoryForType();
    this.categorySearch.set('');
  }

  selectCategory(category: string): void {
    this.transactionForm.patchValue({ category });
    this.transactionForm.get('category')?.markAsTouched();
  }

  onCategorySearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.categorySearch.set(target.value);
  }

  addCustomCategory(): void {
    if (!this.canAddCustomCategory()) return;
    const name = this.categorySearch().trim();
    const currentType = this.transactionForm.get('type')?.value as 'income' | 'expense';
    this.categories.update(items => [...items, { name, icon: this.getAutoIcon(name), kind: currentType }]);
    this.categorySearch.set('');
    this.selectCategory(name);
  }

  setQuickAmount(amount: number): void {
    this.transactionForm.patchValue({ amount });
    this.transactionForm.get('amount')?.markAsTouched();
  }

  selectPaymentMethod(method: 'Cash' | 'Card' | 'Bank'): void {
    this.transactionForm.patchValue({ paymentMethod: method });
    this.syncPaymentSourceRequirement();
  }

  isQuickAmountSelected(amount: number): boolean {
    return Number(this.transactionForm.get('amount')?.value || 0) === amount;
  }

  private getAutoIcon(name: string): string {
    const value = name.toLowerCase();
    if (value.includes('rent') || value.includes('house') || value.includes('home')) return 'home';
    if (value.includes('food') || value.includes('meal') || value.includes('restaurant')) return 'restaurant';
    if (value.includes('travel') || value.includes('trip')) return 'flight';
    if (value.includes('shop')) return 'shopping_bag';
    if (value.includes('health') || value.includes('medical')) return 'health_and_safety';
    if (value.includes('car') || value.includes('transport') || value.includes('fuel')) return 'directions_car';
    if (value.includes('salary') || value.includes('income') || value.includes('bonus')) return 'payments';
    return 'label';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private syncPaymentSourceRequirement(): void {
    const paymentMethod = this.transactionForm.get('paymentMethod')?.value as 'Cash' | 'Card' | 'Bank';
    const control = this.transactionForm.get('paymentSource');
    if (!control) return;

    if (paymentMethod === 'Card' || paymentMethod === 'Bank') {
      control.setValidators([Validators.required]);
      const options = paymentMethod === 'Card' ? this.cardOptions() : this.bankAccountOptions();
      const current = String(control.value || '');
      if (!current || !options.includes(current)) {
        control.setValue(options[0] || '');
      }
    } else {
      control.clearValidators();
      control.setValue('');
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  async onSubmit(): Promise<void> {
    if (this.transactionForm.invalid) return;

    this.clearAlert();
    this.isSaving.set(true);
    const value = this.transactionForm.value;
    if (this.isFutureDate(String(value.date || ''))) {
      this.setAlert('error', 'Future date is not allowed. Please select today or a past date.');
      return;
    }

    try {
      const success = await this.transactionService.addTransaction({
        type: value.type,
        amount: Number(value.amount),
        category: value.category,
        date: new Date(value.date),
        description: value.description || '',
        paymentMethod: value.paymentMethod,
        paymentSource: value.paymentSource || ''
      });

      if (!success) {
        this.setAlert('error', 'Unable to add this transaction right now. Please try again.');
        return;
      }

      this.playTransactionSound(value.type as 'income' | 'expense');
      this.setAlert('success', this.buildSuccessMessage(value.paymentMethod, value.paymentSource));
      setTimeout(() => this.router.navigate(['/dashboard']), 700);
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildSuccessMessage(paymentMethod: 'Cash' | 'Card' | 'Bank', paymentSource?: string): string {
    const source = String(paymentSource || '').trim();
    if (!source || paymentMethod === 'Cash') {
      return 'Transaction added to your accounts.';
    }
    return `Transaction added to your ${paymentMethod.toLowerCase()} account: ${source}.`;
  }

  private playTransactionSound(type: 'income' | 'expense'): void {
    if (!this.settingsService.transactionSounds()) {
      return;
    }

    if (type === 'income') {
      this.soundService.playIncomeCoin();
      return;
    }

    this.soundService.playExpenseCoin();
  }

  private setAlert(type: 'success' | 'error', message: string): void {
    this.alertState.set({ type, message });
    this.clearAlertTimeout();
    this.alertTimeoutId = setTimeout(() => this.alertState.set(null), 4500);
  }

  private clearAlert(): void {
    this.alertState.set(null);
    this.clearAlertTimeout();
  }

  private clearAlertTimeout(): void {
    if (!this.alertTimeoutId) return;
    clearTimeout(this.alertTimeoutId);
    this.alertTimeoutId = null;
  }

  private noFutureDateValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value || '');
    return this.isFutureDate(value) ? { futureDate: true } : null;
  };

  private isFutureDate(value: string): boolean {
    if (!value) return false;
    const selected = new Date(`${value}T00:00:00`);
    const today = new Date(this.maxDate ? `${this.maxDate}T00:00:00` : new Date().toISOString().slice(0, 10) + 'T00:00:00');
    return selected.getTime() > today.getTime();
  }

  private syncCategoryForType(): void {
    const type = this.transactionForm.get('type')?.value as 'income' | 'expense' | undefined;
    const selectedCategory = String(this.transactionForm.get('category')?.value || '');
    if (!type || !selectedCategory) return;

    const validForType = this.categories().some(
      cat => cat.name === selectedCategory && cat.kind === type
    );

    if (!validForType) {
      this.transactionForm.patchValue({ category: '' });
    }
  }
}
