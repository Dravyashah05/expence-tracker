import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  signal, inject, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { SettingsService } from '../../services/settings.service';
import { SoundService } from '../../services/sound.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { LoaderComponent } from '../loader/loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, AppCurrencyPipe, LoaderComponent],
  template: `
    <section class="page-shell">
      <form class="page-content" [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <header class="page-header">
          <div>
            <h1 class="page-title">Add Transaction</h1>
            <p class="page-subtitle">Record income or expenses quickly.</p>
          </div>
          <button class="btn-outline back-btn" type="button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon> Back
          </button>
        </header>

        <div class="form-grid">
          <!-- ═══════════ LEFT COLUMN ═══════════ -->
          <div class="left-col">

            <!-- Type Switcher -->
            <div class="type-switcher">
              <button type="button" class="type-btn income-btn"
                [class.active]="currentType === 'income'"
                (click)="selectType('income')">
                <mat-icon>trending_up</mat-icon> Income
              </button>
              <button type="button" class="type-btn expense-btn"
                [class.active]="currentType === 'expense'"
                (click)="selectType('expense')">
                <mat-icon>trending_down</mat-icon> Expense
              </button>
            </div>

            <!-- Amount -->
            <div class="glass-card amount-card">
              <p class="field-label">Total Amount</p>
              <div class="amount-row">
                <span class="currency-badge">{{ settingsService.currencySymbol() }}</span>
                <input class="amount-input" type="number" step="0.01" min="0.01"
                  formControlName="amount" placeholder="0.00">
              </div>
              <div class="quick-amounts">
                @for (amt of quickAmounts; track amt) {
                  <button type="button" class="quick-chip"
                    [class.active]="transactionForm.get('amount')?.value == amt"
                    (click)="setQuickAmount(amt)">
                    {{ amt | appCurrency }}
                  </button>
                }
              </div>
            </div>

            <!-- Date & Description -->
            <div class="glass-card fields-card">
              <div class="field-group">
                <p class="field-label"><mat-icon class="field-icon">calendar_today</mat-icon> Date</p>
                <input class="styled-input" type="date" formControlName="date" [max]="maxDate">
              </div>
              <div class="field-group">
                <p class="field-label">
                  <mat-icon class="field-icon">notes</mat-icon>
                  Description <span class="optional">(Optional)</span>
                </p>
                <input class="styled-input" type="text" formControlName="description" placeholder="What was this for?">
              </div>
            </div>

            <!-- Payment Method -->
            <div class="glass-card fields-card">
              <p class="field-label"><mat-icon class="field-icon">account_balance_wallet</mat-icon> Payment Method</p>
              <div class="method-pills">
                @for (method of paymentMethods; track method) {
                  <button type="button" class="method-pill"
                    [class.active]="transactionForm.get('paymentMethod')?.value === method"
                    (click)="selectPaymentMethod(method)">
                    <mat-icon>{{ getMethodIcon(method) }}</mat-icon> {{ method }}
                  </button>
                }
              </div>

              @if (showPaymentSource) {
                <div class="field-group" style="margin-top:1rem;">
                  <p class="field-label">{{ paymentSourceLabel }}</p>
                  @if (paymentSourceOptions.length > 0) {
                    <select class="styled-input" formControlName="paymentSource">
                      <option value="">Select {{ paymentSourceLabel.toLowerCase() }}</option>
                      @for (opt of paymentSourceOptions; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  } @else {
                    <input class="styled-input" type="text" formControlName="paymentSource"
                      [placeholder]="'Enter ' + paymentSourceLabel.toLowerCase()">
                    <p class="hint-text">
                      <mat-icon style="font-size:14px;width:14px;height:14px;">info</mat-icon>
                      No saved {{ paymentSourceLabel.toLowerCase() }}s — add them in Settings.
                    </p>
                  }
                </div>
              }
            </div>

            <!-- Status alert -->
            @if (alertState(); as alert) {
              <div class="txn-alert" [class.success]="alert.type === 'success'" [class.error]="alert.type === 'error'">
                <mat-icon>{{ alert.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                {{ alert.message }}
              </div>
            }

            <!-- Submit -->
            <button class="save-btn"
              [class.income-save]="currentType === 'income'"
              [class.expense-save]="currentType === 'expense'"
              type="submit"
              [disabled]="!isFormReady()">
              @if (isSaving()) {
                <app-loader size="sm"></app-loader> Saving...
              } @else {
                <mat-icon>add_circle</mat-icon>
                Save Transaction
              }
            </button>
          </div>

          <!-- ═══════════ RIGHT COLUMN — Category ═══════════ -->
          <div class="right-col">
            <div class="glass-card cat-card">
              <div class="cat-card-header">
                <p class="field-label"> 
                  <mat-icon class="field-icon">category</mat-icon>
                  Category
                </p>
                @if (selectedCategory) {
                  <span class="selected-badge">{{ selectedCategory }}</span>
                }
              </div>

              <!-- Search -->
              <div class="cat-search-row">
                <div class="cat-search-wrap">
                  <mat-icon class="search-icon">search</mat-icon>
                  <input type="text" class="cat-search-input"
                    [(ngModel)]="categorySearch"
                    [ngModelOptions]="{standalone: true}"
                    (ngModelChange)="onSearch()"
                    placeholder="Search categories...">
                  @if (categorySearch) {
                    <button class="clear-search" type="button" (click)="categorySearch=''; onSearch()">
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
                <button type="button" class="add-cat-btn"
                  (click)="addCustomCategory()"
                  [disabled]="!canAddCustom"
                  title="Add as custom category">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              <!-- Recent chips -->
              @if (recentCats.length > 0 && !categorySearch) {
                <div class="recent-section">
                  <span class="section-label">Recently used</span>
                  <div class="recent-chips">
                    @for (cat of recentCats; track cat.name) {
                      <button type="button" class="recent-chip"
                        [class.active]="selectedCategory === cat.name"
                        (click)="selectCategory(cat.name)">
                        <mat-icon>{{ cat.icon }}</mat-icon> {{ cat.name }}
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Grid -->
              <div class="cat-grid">
                @if (filteredCats.length === 0) {
                  <div class="cat-empty">
                    <mat-icon>search_off</mat-icon>
                    <p>No match — click <strong>+</strong> to add "{{ categorySearch }}"</p>
                  </div>
                } @else {
                  @for (cat of filteredCats; track cat.name) {
                    <button type="button" class="cat-tile"
                      [class.active]="selectedCategory === cat.name"
                      (click)="selectCategory(cat.name)">
                      <div class="cat-icon-wrap"><mat-icon>{{ cat.icon }}</mat-icon></div>
                      <span class="cat-name">{{ cat.name }}</span>
                      @if (selectedCategory === cat.name) {
                        <div class="cat-check"><mat-icon>check</mat-icon></div>
                      }
                    </button>
                  }
                }
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  `,
  styles: [`
    :host { display: block; animation: fadeIn .35s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.75rem; flex-wrap:wrap; gap:1rem; }
    .back-btn { display:inline-flex; align-items:center; gap:.4rem; }
    .back-btn mat-icon { font-size:1.2rem; width:1.2rem; height:1.2rem; }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; align-items:start; }
    .left-col, .right-col { display:flex; flex-direction:column; gap:1.2rem; }

    .glass-card {
      background: color-mix(in srgb, var(--surface) 78%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid color-mix(in srgb, var(--line) 60%, #fff 20%);
      border-radius: var(--radius-lg);
      padding: 1.4rem;
      box-shadow: 0 6px 28px rgba(0,0,0,.04);
    }

    /* Type Switcher */
    .type-switcher { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
    .type-btn { display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.9rem; border-radius:var(--radius-md); border:2px solid var(--line); background:color-mix(in srgb, var(--surface) 80%, transparent); color:var(--text-soft); font:inherit; font-weight:700; font-size:1rem; cursor:pointer; transition:all .25s ease; }
    .type-btn mat-icon { font-size:1.3rem; width:1.3rem; height:1.3rem; }
    .income-btn.active { background:color-mix(in srgb,var(--success) 12%,var(--surface)); border-color:var(--success); color:var(--success); }
    .expense-btn.active { background:color-mix(in srgb,var(--danger) 12%,var(--surface)); border-color:var(--danger); color:var(--danger); }

    /* Amount */
    .amount-card { background: radial-gradient(circle at 90% 10%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 60%), color-mix(in srgb, var(--surface) 78%, transparent); }
    .amount-row { display:flex; align-items:center; gap:1rem; margin:.8rem 0; padding-bottom:.8rem; border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent); }
    .currency-badge { width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg,var(--primary),var(--primary-strong)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:800; flex-shrink:0; box-shadow:0 6px 14px color-mix(in srgb,var(--primary) 30%,transparent); }
    .amount-input { border:none; background:transparent; font-size:2.4rem; font-weight:800; color:var(--text); width:100%; outline:none; font-family:'Outfit','Plus Jakarta Sans',sans-serif; }
    .amount-input::placeholder { color:color-mix(in srgb,var(--text-soft) 50%,transparent); }
    .quick-amounts { display:flex; flex-wrap:wrap; gap:.5rem; }
    .quick-chip { border:1px solid var(--line); border-radius:999px; background:var(--surface-soft); color:var(--text-soft); font:inherit; font-size:.8rem; font-weight:700; padding:.3rem .8rem; cursor:pointer; transition:all .2s; }
    .quick-chip.active, .quick-chip:hover { background:color-mix(in srgb,var(--primary) 12%,var(--surface)); border-color:color-mix(in srgb,var(--primary) 50%,var(--line)); color:var(--primary-strong); }

    /* Fields */
    .fields-card { display:flex; flex-direction:column; gap:1.1rem; }
    .field-group { display:flex; flex-direction:column; gap:.5rem; }
    .field-label { margin:0; font-size:.85rem; font-weight:700; color:var(--text-soft); display:flex; align-items:center; gap:.4rem; }
    .field-icon { font-size:1rem; width:1rem; height:1rem; color:var(--primary); }
    .optional { font-weight:500; color:color-mix(in srgb,var(--text-soft) 60%,transparent); }
    .styled-input { padding:.75rem 1rem; border:1px solid color-mix(in srgb,var(--line) 80%,transparent); border-radius:10px; background:var(--surface); color:var(--text); font:inherit; font-size:.95rem; transition:border-color .2s,box-shadow .2s; }
    .styled-input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent); }
    .hint-text { margin:.3rem 0 0; font-size:.78rem; color:var(--text-soft); display:flex; align-items:center; gap:.3rem; }

    /* Method pills */
    .method-pills { display:flex; gap:.6rem; }
    .method-pill { flex:1; display:flex; align-items:center; justify-content:center; gap:.4rem; padding:.7rem; border:1.5px solid var(--line); border-radius:10px; background:var(--surface-soft); color:var(--text-soft); font:inherit; font-size:.85rem; font-weight:700; cursor:pointer; transition:all .2s; }
    .method-pill mat-icon { font-size:1.1rem; width:1.1rem; height:1.1rem; }
    .method-pill.active { background:color-mix(in srgb,var(--primary) 12%,var(--surface)); border-color:var(--primary); color:var(--primary-strong); }
    .method-pill:hover:not(.active) { border-color:color-mix(in srgb,var(--primary) 40%,var(--line)); }

    /* Alerts */
    .txn-alert { border-radius:12px; padding:1rem; display:flex; align-items:center; gap:.6rem; font-weight:600; font-size:.9rem; }
    .txn-alert mat-icon { font-size:1.2rem; width:1.2rem; height:1.2rem; }
    .txn-alert.success { background:color-mix(in srgb,var(--success) 10%,var(--surface)); border:1px solid color-mix(in srgb,var(--success) 35%,transparent); color:color-mix(in srgb,var(--success) 90%,var(--text)); }
    .txn-alert.error { background:color-mix(in srgb,var(--danger) 10%,var(--surface)); border:1px solid color-mix(in srgb,var(--danger) 35%,transparent); color:color-mix(in srgb,var(--danger) 90%,var(--text)); }

    /* Save button */
    .save-btn { width:100%; padding:1rem; border:none; border-radius:var(--radius-md); font:inherit; font-size:1.05rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.6rem; transition:all .25s ease; color:#fff; }
    .save-btn mat-icon { font-size:1.3rem; width:1.3rem; height:1.3rem; }
    .income-save { background:linear-gradient(135deg,var(--success),color-mix(in srgb,var(--success) 80%,#000)); box-shadow:0 8px 20px color-mix(in srgb,var(--success) 28%,transparent); }
    .expense-save { background:linear-gradient(135deg,var(--primary),var(--primary-strong)); box-shadow:0 8px 20px color-mix(in srgb,var(--primary) 28%,transparent); }
    .save-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.05); }
    .save-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }

    /* Category right col */
    .cat-card { height:100%; display:flex; flex-direction:column; gap:1rem; }
    .cat-card-header { display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; }
    .cat-card-header .field-label { font-size:.95rem; }
    .selected-badge { background:color-mix(in srgb,var(--primary) 15%,transparent); color:var(--primary-strong); border:1px solid color-mix(in srgb,var(--primary) 30%,transparent); padding:.15rem .6rem; border-radius:999px; font-size:.8rem; font-weight:700; }
    .cat-search-row { display:flex; gap:.6rem; }
    .cat-search-wrap { flex:1; position:relative; display:flex; align-items:center; }
    .search-icon { position:absolute; left:.75rem; color:var(--text-soft); font-size:1.1rem; width:1.1rem; height:1.1rem; }
    .cat-search-input { width:100%; padding:.75rem 2.5rem .75rem 2.4rem; border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--text); font:inherit; font-size:.95rem; transition:border-color .2s,box-shadow .2s; }
    .cat-search-input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent); }
    .clear-search { position:absolute; right:.6rem; background:none; border:none; cursor:pointer; color:var(--text-soft); display:flex; align-items:center; }
    .clear-search mat-icon { font-size:1rem; width:1rem; height:1rem; }
    .add-cat-btn { width:44px; height:44px; border-radius:10px; border:1.5px dashed color-mix(in srgb,var(--primary) 50%,var(--line)); background:color-mix(in srgb,var(--primary) 8%,var(--surface)); color:var(--primary); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all .2s; }
    .add-cat-btn:hover:not(:disabled) { background:color-mix(in srgb,var(--primary) 15%,var(--surface)); }
    .add-cat-btn:disabled { opacity:.3; cursor:not-allowed; }
    .recent-section { display:flex; flex-direction:column; gap:.5rem; }
    .section-label { font-size:.75rem; font-weight:700; color:var(--text-soft); text-transform:uppercase; letter-spacing:.06em; }
    .recent-chips { display:flex; flex-wrap:wrap; gap:.4rem; }
    .recent-chip { display:inline-flex; align-items:center; gap:.3rem; border:1px solid var(--line); border-radius:999px; background:var(--surface-soft); color:var(--text); font:inherit; font-size:.8rem; font-weight:700; padding:.3rem .8rem .3rem .5rem; cursor:pointer; transition:all .2s; }
    .recent-chip mat-icon { font-size:.9rem; width:.9rem; height:.9rem; color:var(--primary-strong); }
    .recent-chip.active, .recent-chip:hover { background:color-mix(in srgb,var(--primary) 12%,var(--surface)); border-color:color-mix(in srgb,var(--primary) 50%,var(--line)); color:var(--primary-strong); }
    .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(88px,1fr)); gap:.6rem; max-height:380px; overflow-y:auto; padding-right:2px; }
    .cat-grid::-webkit-scrollbar { width:4px; }
    .cat-grid::-webkit-scrollbar-thumb { background:var(--line); border-radius:2px; }
    .cat-tile { position:relative; display:flex; flex-direction:column; align-items:center; gap:.5rem; padding:.9rem .5rem; border:1.5px solid var(--line); border-radius:14px; background:var(--surface); cursor:pointer; transition:all .2s ease; text-align:center; }
    .cat-tile:hover { transform:translateY(-2px); border-color:color-mix(in srgb,var(--primary) 50%,var(--line)); box-shadow:0 6px 16px rgba(0,0,0,.06); }
    .cat-tile.active { border-color:var(--primary); background:color-mix(in srgb,var(--primary) 10%,var(--surface)); }
    .cat-icon-wrap { width:40px; height:40px; border-radius:12px; background:color-mix(in srgb,var(--primary) 12%,var(--surface-soft)); display:flex; align-items:center; justify-content:center; color:var(--primary-strong); }
    .cat-icon-wrap mat-icon { font-size:1.25rem; width:1.25rem; height:1.25rem; }
    .cat-name { font-size:.72rem; font-weight:700; color:var(--text); line-height:1.2; }
    .cat-check { position:absolute; top:-6px; right:-6px; width:20px; height:20px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; }
    .cat-check mat-icon { font-size:.85rem; width:.85rem; height:.85rem; }
    .cat-empty { grid-column:1/-1; padding:3rem 1rem; text-align:center; color:var(--text-soft); }
    .cat-empty mat-icon { font-size:2.5rem; width:2.5rem; height:2.5rem; margin-bottom:.5rem; }

    @media (max-width:900px) { .form-grid { grid-template-columns:1fr; } .right-col { order:-1; } .cat-grid { max-height:260px; } }
    @media (max-width:500px) { .method-pills { flex-wrap:wrap; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private soundService = inject(SoundService); 
  
  private cdr = inject(ChangeDetectorRef);
  settingsService = inject(SettingsService);

  transactionForm!: FormGroup;
  maxDate = '';

  // Plain properties (not signals) for template-driven parts — simpler & avoids computed-reactive-form mismatches
  currentType: 'income' | 'expense' = 'expense';
  selectedCategory = '';
  categorySearch = '';
  showPaymentSource = false;
  paymentSourceLabel = '';
  paymentSourceOptions: string[] = [];

  filteredCats: Array<{ name: string; icon: string; kind: 'income' | 'expense' | 'both' }> = [];
  recentCats: Array<{ name: string; icon: string }> = [];
  canAddCustom = false;

  isSaving = signal(false);
  alertState = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  allCategories = signal<Array<{ name: string; icon: string; kind: 'income' | 'expense' | 'both' }>>([
    { name: 'Salary',        icon: 'payments',            kind: 'income' },
    { name: 'Freelance',     icon: 'work',                kind: 'income' },
    { name: 'Investment',    icon: 'trending_up',         kind: 'income' },
    { name: 'Gift Received', icon: 'redeem',              kind: 'income' },
    { name: 'Food',          icon: 'restaurant',          kind: 'expense' },
    { name: 'Groceries',     icon: 'local_grocery_store', kind: 'expense' },
    { name: 'Transport',     icon: 'directions_bus',       kind: 'expense' },
    { name: 'Travel',        icon: 'flight',              kind: 'expense' },
    { name: 'Utilities',     icon: 'bolt',                kind: 'expense' },
    { name: 'Entertainment', icon: 'movie',               kind: 'expense' },
    { name: 'Health',        icon: 'health_and_safety',   kind: 'expense' },
    { name: 'Shopping',      icon: 'shopping_bag',        kind: 'expense' },
    { name: 'Housing',       icon: 'home',                kind: 'expense' },
    { name: 'Rent',          icon: 'apartment',           kind: 'expense' },
    { name: 'Education',     icon: 'school',              kind: 'expense' },
    { name: 'Subscriptions', icon: 'subscriptions',       kind: 'expense' },
    { name: 'Insurance',     icon: 'shield',              kind: 'expense' },
    { name: 'Gifts',         icon: 'card_giftcard',       kind: 'expense' },
    { name: 'Pet Care',      icon: 'pets',                kind: 'expense' },
  ]);

  readonly paymentMethods: Array<'Cash' | 'Card' | 'Bank'> = ['Cash', 'Card', 'Bank'];
  quickAmounts: number[] = [10, 25, 50, 100];

  private subs = new Subscription();
  private alertTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const now = new Date();
    this.maxDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    this.transactionForm = this.fb.group({
      type:          ['expense', Validators.required],
      amount:        ['', [Validators.required, Validators.min(0.01)]],
      category:      ['', Validators.required],
      date:          [this.maxDate, [Validators.required, this.futureValidator]],
      description:   [''],
      paymentMethod: ['Cash', Validators.required],
      paymentSource: [''],
    });

    this.updateCategoryLists();
    this.updateQuickAmounts();

    this.subs.add(this.transactionForm.get('type')!.valueChanges.subscribe(t => {
      this.currentType = t;
      this.selectedCategory = '';
      this.transactionForm.patchValue({ category: '' });
      this.updateCategoryLists();
      this.updateQuickAmounts();
      this.cdr.markForCheck();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.alertTimer) clearTimeout(this.alertTimer);
  }

  /** Recompute category grid + recent chips */
  private updateCategoryLists(): void {
    const q = this.categorySearch.trim().toLowerCase();
    const cats = this.allCategories();
    this.filteredCats = cats
      .filter(c => c.kind === this.currentType)
      .filter(c => !q || c.name.toLowerCase().includes(q));

    this.canAddCustom = !!q && !cats.some(c => c.name.toLowerCase() === q);

    const txns = this.transactionService.allTransactions()
      .filter(t => t.type === this.currentType)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const seen = new Set<string>();
    this.recentCats = [];
    for (const t of txns) {
      if (seen.has(t.category)) continue;
      const icon = cats.find(c => c.name === t.category)?.icon || 'label';
      this.recentCats.push({ name: t.category, icon });
      seen.add(t.category);
      if (this.recentCats.length >= 5) break;
    }
  }

  onSearch(): void {
    this.updateCategoryLists();
    this.cdr.markForCheck();
  }

  selectType(type: 'income' | 'expense'): void {
    this.transactionForm.patchValue({ type });
  }

  selectCategory(name: string): void {
    this.selectedCategory = name;
    this.transactionForm.patchValue({ category: name });
    this.transactionForm.get('category')!.markAsTouched();
    this.cdr.markForCheck();
  }

  addCustomCategory(): void {
    const name = this.categorySearch.trim();
    if (!name) return;
    this.allCategories.update(list => [...list, { name, icon: this.autoIcon(name), kind: this.currentType }]);
    this.categorySearch = '';
    this.updateCategoryLists();
    this.selectCategory(name);
  }

  setQuickAmount(amt: number): void {
    this.transactionForm.patchValue({ amount: amt });
    this.cdr.markForCheck();
  }

  selectPaymentMethod(method: 'Cash' | 'Card' | 'Bank'): void {
    this.transactionForm.patchValue({ paymentMethod: method });
    this.syncPaymentSource(method);
    this.cdr.markForCheck();
  }

  private syncPaymentSource(method: 'Cash' | 'Card' | 'Bank'): void {
    const ctrl = this.transactionForm.get('paymentSource')!;
    if (method === 'Card' || method === 'Bank') {
      this.showPaymentSource = true;
      this.paymentSourceLabel = method === 'Bank' ? 'Bank Account' : 'Card';
      this.paymentSourceOptions = method === 'Card'
        ? this.settingsService.cards()
        : this.settingsService.bankAccounts();
      // Only require if options exist (avoid blocking when no accounts set up)
      if (this.paymentSourceOptions.length > 0) {
        ctrl.setValidators([Validators.required]);
        if (!ctrl.value) ctrl.setValue(this.paymentSourceOptions[0]);
      } else {
        ctrl.clearValidators();
      }
    } else {
      this.showPaymentSource = false;
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private updateQuickAmounts(): void {
    this.quickAmounts = this.currentType === 'income' ? [500, 1000, 2500, 5000] : [10, 25, 50, 100];
  }

  /** True when the form is ready to submit */
  isFormReady(): boolean {
    if (this.isSaving()) return false;
    if (this.transactionForm.invalid) return false;
    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormReady()) {
      // Mark all as touched to show validation errors
      this.transactionForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    this.clearAlert();
    this.isSaving.set(true);
    const v = this.transactionForm.value as {
      type: 'income' | 'expense';
      amount: string | number;
      category: string;
      date: string;
      description: string;
      paymentMethod: 'Cash' | 'Card' | 'Bank';
      paymentSource: string;
    };

    try {
      const payload: Omit<Transaction, 'id'> = {
        type: v.type,
        amount: Number(v.amount),
        category: v.category,
        date: new Date(v.date),
        description: v.description || '',
        paymentMethod: v.paymentMethod,
        paymentSource: v.paymentSource || '',
      };

      const ok = await this.transactionService.addTransaction(payload);
      if (!ok) {
        this.showAlert('error', 'Failed to save transaction. Please try again.');
        return;
      }

      this.playSound(v.type as 'income' | 'expense');
      const msg = `${v.type === 'income' ? 'Income' : 'Expense'} of ${this.settingsService.currencySymbol()}${Number(v.amount).toFixed(2)} recorded!`;
      this.showAlert('success', msg);
      setTimeout(() => this.router.navigate(['/dashboard']), 900);
    } finally {
      this.isSaving.set(false);
    }
  }

  getMethodIcon(m: string): string {
    return m === 'Cash' ? 'payments' : m === 'Card' ? 'credit_card' : 'account_balance';
  }

  goBack(): void { this.router.navigate(['/dashboard']); }

  private showAlert(type: 'success' | 'error', message: string): void {
    this.alertState.set({ type, message });
    if (this.alertTimer) clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => this.alertState.set(null), 5000);
  }
  private clearAlert(): void {
    this.alertState.set(null);
    if (this.alertTimer) { clearTimeout(this.alertTimer); this.alertTimer = null; }
  }

  private playSound(type: 'income' | 'expense'): void {
    if (!this.settingsService.transactionSounds()) return;
    type === 'income' ? this.soundService.playIncomeCoin() : this.soundService.playExpenseCoin();
  }

  private readonly futureValidator = (ctrl: AbstractControl): ValidationErrors | null => {
    const val = String(ctrl.value || '');
    if (!val) return null;
    const selected = new Date(`${val}T00:00:00`).getTime();
    const today = new Date(`${this.maxDate}T00:00:00`).getTime();
    return selected > today ? { futureDate: true } : null;
  };

  private autoIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('rent') || n.includes('home') || n.includes('house')) return 'home';
    if (n.includes('food') || n.includes('eat') || n.includes('restaurant')) return 'restaurant';
    if (n.includes('travel') || n.includes('trip')) return 'flight';
    if (n.includes('shop')) return 'shopping_bag';
    if (n.includes('health') || n.includes('medical')) return 'health_and_safety';
    if (n.includes('car') || n.includes('fuel') || n.includes('transport')) return 'directions_car';
    if (n.includes('salary') || n.includes('income') || n.includes('bonus')) return 'payments';
    return 'label';
  }
}
