import {
  Component, ChangeDetectionStrategy, signal, computed, inject, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../services/transaction.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { SettingsService } from '../../services/settings.service';

interface BudgetGoal {
  id: string;
  category: string;
  icon: string;
  monthlyLimit: number;
}

@Component({
  selector: 'app-budget-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, AppCurrencyPipe],
  template: `
    <section class="page-shell">
      <div class="page-content">

        <header class="page-header">
          <div>
            <h1 class="page-title">Budget Goals</h1>
            <p class="page-subtitle">Set monthly spending limits per category and track your progress.</p>
          </div>
          <div class="header-right">
            <span class="month-badge">
              <mat-icon>calendar_month</mat-icon>
              {{ currentMonthLabel() }}
            </span>
            <button class="btn-solid" type="button" (click)="openAddGoal()">
              <mat-icon>add</mat-icon> Add Goal
            </button>
          </div>
        </header>

        <!-- Overview strip -->
        <div class="overview-strip">
          <div class="overview-item">
            <mat-icon>flag</mat-icon>
            <div>
              <strong>{{ goals().length }}</strong>
              <span>Active Goals</span>
            </div>
          </div>
          <div class="overview-divider"></div>
          <div class="overview-item">
            <mat-icon>check_circle</mat-icon>
            <div>
              <strong class="success-text">{{ goalsOnTrack() }}</strong>
              <span>On Track</span>
            </div>
          </div>
          <div class="overview-divider"></div>
          <div class="overview-item">
            <mat-icon>warning</mat-icon>
            <div>
              <strong class="warn-text">{{ goalsOverBudget() }}</strong>
              <span>Over Budget</span>
            </div>
          </div>
          <div class="overview-divider"></div>
          <div class="overview-item">
            <mat-icon>savings</mat-icon>
            <div>
              <strong>{{ totalBudget() | appCurrency }}</strong>
              <span>Total Budget</span>
            </div>
          </div>
        </div>

        <!-- Add / Edit Goal Form -->
        @if (showForm()) {
          <div class="goal-form-card glass-card">
            <div class="form-head">
              <mat-icon>{{ editingGoalId() ? 'edit_note' : 'add_circle' }}</mat-icon>
              <span>{{ editingGoalId() ? 'Edit Goal' : 'New Budget Goal' }}</span>
              <button class="close-form-btn" type="button" (click)="closeForm()"><mat-icon>close</mat-icon></button>
            </div>

            <div class="form-row">
              <div class="fg">
                <label>Category</label>
                <select class="styled-input" [(ngModel)]="formCategory" (change)="onCategoryChange()">
                  <option value="">Select a category</option>
                  @for (cat of expenseCategories; track cat.name) {
                    <option [value]="cat.name">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="fg">
                <label>Monthly Limit ({{ settingsService.currencySymbol() }})</label>
                <div class="limit-input-wrap">
                  <span class="limit-prefix">{{ settingsService.currencySymbol() }}</span>
                  <input class="styled-input limit-input" type="number" [(ngModel)]="formLimit" step="1" min="1" placeholder="e.g. 5000">
                </div>
              </div>
            </div>

            @if (formError()) {
              <p class="form-error"><mat-icon>error</mat-icon> {{ formError() }}</p>
            }

            <div class="form-actions">
              <button class="btn-outline" type="button" (click)="closeForm()">Cancel</button>
              <button class="btn-solid" type="button" (click)="saveGoal()">
                <mat-icon>check</mat-icon>
                {{ editingGoalId() ? 'Save Changes' : 'Add Goal' }}
              </button>
            </div>
          </div>
        }

        <!-- Goals Grid -->
        @if (goals().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>savings</mat-icon></div>
            <h3>No budget goals yet</h3>
            <p>Set monthly spending limits per category to track where your money goes.</p>
            <button class="btn-solid" type="button" (click)="openAddGoal()">
              <mat-icon>add</mat-icon> Create First Goal
            </button>
          </div>
        } @else {
          <div class="goals-grid">
            @for (goal of goalDetails(); track goal.id) {
              <div class="goal-card glass-card" [class.over-budget]="goal.isOver" [class.near-limit]="goal.isNear && !goal.isOver">
                <!-- Card header -->
                <div class="goal-card-head">
                  <div class="goal-icon-wrap" [class.icon-over]="goal.isOver" [class.icon-near]="goal.isNear && !goal.isOver">
                    <mat-icon>{{ goal.icon }}</mat-icon>
                  </div>
                  <div class="goal-title-area">
                    <strong class="goal-category">{{ goal.category }}</strong>
                    <small class="goal-month">{{ currentMonthLabel() }}</small>
                  </div>
                  <div class="goal-card-actions">
                    <button class="gcard-btn" type="button" (click)="editGoal(goal)" title="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button class="gcard-btn danger-btn" type="button" (click)="deleteGoal(goal.id)" title="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Amounts -->
                <div class="goal-amounts">
                  <div class="goal-spent">
                    <span class="amt-label">Spent</span>
                    <strong class="amt-val" [class.over]="goal.isOver">{{ goal.spent | appCurrency }}</strong>
                  </div>
                  <div class="goal-divider"></div>
                  <div class="goal-remaining">
                    <span class="amt-label">{{ goal.isOver ? 'Over by' : 'Remaining' }}</span>
                    <strong class="amt-val" [class.positive]="!goal.isOver" [class.over]="goal.isOver">
                      {{ goal.isOver ? (goal.spent - goal.limit | appCurrency) : (goal.limit - goal.spent | appCurrency) }}
                    </strong>
                  </div>
                  <div class="goal-divider"></div>
                  <div class="goal-limit">
                    <span class="amt-label">Budget</span>
                    <strong class="amt-val">{{ goal.limit | appCurrency }}</strong>
                  </div>
                </div>

                <!-- Progress bar -->
                <div class="progress-wrap">
                  <div class="progress-track">
                    <div class="progress-fill"
                      [class.fill-ok]="!goal.isNear && !goal.isOver"
                      [class.fill-near]="goal.isNear && !goal.isOver"
                      [class.fill-over]="goal.isOver"
                      [style.width.%]="goal.percentage">
                    </div>
                  </div>
                  <div class="progress-labels">
                    <span>{{ goal.percentage | number:'1.0-0' }}% used</span>
                    @if (goal.isOver) {
                      <span class="status-tag danger-tag"><mat-icon>warning</mat-icon> Over Budget</span>
                    } @else if (goal.isNear) {
                      <span class="status-tag warn-tag"><mat-icon>alarm</mat-icon> Near Limit</span>
                    } @else {
                      <span class="status-tag ok-tag"><mat-icon>check_circle</mat-icon> On Track</span>
                    }
                  </div>
                </div>

                <!-- Day of month context -->
                <p class="goal-context">
                  Day {{ todayDay() }} of {{ daysInMonth() }} · {{ daysLeft() }} days remaining this month
                </p>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; animation:fadeIn .35s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.75rem; flex-wrap:wrap; gap:1rem; }
    .header-right { display:flex; align-items:center; gap:.8rem; flex-wrap:wrap; }
    .month-badge { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1rem; border:1px solid var(--line); border-radius:999px; background:var(--surface-soft); font-size:.85rem; font-weight:700; color:var(--text-soft); }
    .month-badge mat-icon { font-size:1rem; width:1rem; height:1rem; }

    /* Overview strip */
    .overview-strip { display:flex; align-items:center; gap:1.5rem; padding:1.2rem 1.5rem; background:color-mix(in srgb,var(--surface) 80%,transparent); border:1px solid var(--line); border-radius:var(--radius-lg); margin-bottom:1.5rem; flex-wrap:wrap; }
    .overview-item { display:flex; align-items:center; gap:.8rem; }
    .overview-item mat-icon { font-size:1.6rem; width:1.6rem; height:1.6rem; color:var(--primary); }
    .overview-item div { display:flex; flex-direction:column; }
    .overview-item strong { font-family:'Outfit',sans-serif; font-size:1.4rem; font-weight:900; letter-spacing:-.02em; }
    .overview-item span { font-size:.75rem; font-weight:600; color:var(--text-soft); text-transform:uppercase; letter-spacing:.05em; }
    .overview-divider { width:1px; height:40px; background:var(--line); }
    .success-text { color:var(--success); }
    .warn-text { color:var(--danger); }

    /* Form card */
    .goal-form-card { padding:1.4rem; margin-bottom:1.5rem; animation:slideDown .25s ease-out; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
    .form-head { display:flex; align-items:center; gap:.5rem; margin-bottom:1.2rem; font-size:1rem; font-weight:700; color:var(--primary-strong); }
    .form-head mat-icon { font-size:1.3rem; width:1.3rem; height:1.3rem; }
    .close-form-btn { margin-left:auto; background:none; border:none; color:var(--text-soft); cursor:pointer; display:flex; align-items:center; border-radius:6px; width:28px; height:28px; justify-content:center; transition:background .2s; }
    .close-form-btn:hover { background:var(--line); }
    .close-form-btn mat-icon { font-size:1.1rem; width:1.1rem; height:1.1rem; }

    .form-row { display:grid; grid-template-columns:1.4fr 1fr; gap:1rem; margin-bottom:1rem; }
    .fg { display:flex; flex-direction:column; gap:.4rem; }
    .fg label { font-size:.82rem; font-weight:700; color:var(--text-soft); }
    .styled-input { padding:.72rem 1rem; border:1px solid var(--line); border-radius:10px; background:var(--surface); color:var(--text); font:inherit; font-size:.9rem; transition:border-color .2s,box-shadow .2s; }
    .styled-input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 13%,transparent); }
    .limit-input-wrap { position:relative; display:flex; align-items:center; }
    .limit-prefix { position:absolute; left:.9rem; font-weight:700; color:var(--primary-strong); pointer-events:none; }
    .limit-input { padding-left:2rem !important; }

    .form-error { display:flex; align-items:center; gap:.4rem; font-size:.82rem; font-weight:600; color:var(--danger); margin-bottom:.8rem; }
    .form-error mat-icon { font-size:1rem; width:1rem; height:1rem; }
    .form-actions { display:flex; gap:.8rem; justify-content:flex-end; }

    /* Goals Grid */
    .goals-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.2rem; }

    .goal-card {
      padding:1.4rem;
      transition:all .25s ease;
      border-left:4px solid var(--primary);
    }
    .goal-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
    .goal-card.over-budget { border-left-color:var(--danger); background:color-mix(in srgb,var(--danger) 4%,var(--surface)); }
    .goal-card.near-limit { border-left-color:var(--accent); background:color-mix(in srgb,var(--accent) 4%,var(--surface)); }

    .goal-card-head { display:flex; align-items:center; gap:.8rem; margin-bottom:1.1rem; }
    .goal-icon-wrap { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb,var(--primary) 12%,transparent); color:var(--primary-strong); flex-shrink:0; transition:all .2s; }
    .goal-icon-wrap mat-icon { font-size:1.3rem; width:1.3rem; height:1.3rem; }
    .icon-over { background:color-mix(in srgb,var(--danger) 12%,transparent); color:var(--danger); }
    .icon-near { background:color-mix(in srgb,var(--accent) 12%,transparent); color:var(--accent); }

    .goal-title-area { flex:1; min-width:0; }
    .goal-category { display:block; font-size:1rem; font-weight:700; }
    .goal-month { font-size:.78rem; color:var(--text-soft); }

    .goal-card-actions { display:flex; gap:.3rem; }
    .gcard-btn { width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:var(--surface-soft); color:var(--text-soft); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
    .gcard-btn mat-icon { font-size:.95rem; width:.95rem; height:.95rem; }
    .gcard-btn:hover { background:color-mix(in srgb,var(--primary) 10%,var(--surface)); color:var(--primary-strong); }
    .danger-btn:hover { background:color-mix(in srgb,var(--danger) 10%,var(--surface)); color:var(--danger); border-color:color-mix(in srgb,var(--danger) 30%,var(--line)); }

    .goal-amounts { display:flex; align-items:center; gap:.8rem; margin-bottom:1rem; }
    .goal-spent,.goal-remaining,.goal-limit { display:flex; flex-direction:column; align-items:center; flex:1; }
    .goal-divider { width:1px; height:32px; background:var(--line); }
    .amt-label { font-size:.72rem; font-weight:600; color:var(--text-soft); text-transform:uppercase; letter-spacing:.04em; margin-bottom:.15rem; }
    .amt-val { font-family:'Outfit',sans-serif; font-size:1rem; font-weight:800; letter-spacing:-.02em; }
    .amt-val.over { color:var(--danger); }
    .amt-val.positive { color:var(--success); }

    .progress-wrap { margin-bottom:.8rem; }
    .progress-track { height:8px; background:var(--line); border-radius:4px; overflow:hidden; margin-bottom:.5rem; }
    .progress-fill { height:100%; border-radius:4px; transition:width .5s ease; max-width:100%; }
    .fill-ok { background:linear-gradient(90deg,var(--success),color-mix(in srgb,var(--success) 80%,#000)); }
    .fill-near { background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 80%,#f00)); }
    .fill-over { background:linear-gradient(90deg,var(--danger),color-mix(in srgb,var(--danger) 80%,#000)); }

    .progress-labels { display:flex; align-items:center; justify-content:space-between; font-size:.78rem; font-weight:600; color:var(--text-soft); }
    .status-tag { display:inline-flex; align-items:center; gap:.25rem; font-size:.72rem; font-weight:700; padding:.15rem .5rem; border-radius:999px; }
    .status-tag mat-icon { font-size:.85rem; width:.85rem; height:.85rem; }
    .ok-tag { background:color-mix(in srgb,var(--success) 10%,transparent); color:var(--success); }
    .warn-tag { background:color-mix(in srgb,var(--accent) 12%,transparent); color:color-mix(in srgb,var(--accent) 90%,#000); }
    .danger-tag { background:color-mix(in srgb,var(--danger) 10%,transparent); color:var(--danger); }

    .goal-context { font-size:.76rem; color:var(--text-soft); font-style:italic; margin-top:.4rem; }

    /* Empty */
    .empty-state { display:flex; flex-direction:column; align-items:center; text-align:center; padding:4rem 1rem; gap:1rem; }
    .empty-icon { width:72px; height:72px; border-radius:22px; background:color-mix(in srgb,var(--primary) 10%,transparent); color:var(--primary); display:flex; align-items:center; justify-content:center; }
    .empty-icon mat-icon { font-size:2.5rem; width:2.5rem; height:2.5rem; }
    .empty-state h3 { font-size:1.4rem; }
    .empty-state p { color:var(--text-soft); max-width:36ch; }

    @media (max-width:900px) {
      .overview-strip { gap:1rem; }
      .form-row { grid-template-columns:1fr; }
      .goals-grid { grid-template-columns:1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetGoalsComponent implements OnInit {
  transactionService = inject(TransactionService);
  settingsService = inject(SettingsService);

  private readonly STORAGE_KEY = 'rupee_budget_goals';

  goals = signal<BudgetGoal[]>([]);
  showForm = signal(false);
  editingGoalId = signal<string | null>(null);
  formError = signal('');
  formCategory = '';
  formLimit: number | null = null;

  readonly expenseCategories = [
    { name: 'Food',          icon: 'restaurant' },
    { name: 'Groceries',     icon: 'local_grocery_store' },
    { name: 'Transport',     icon: 'directions_bus' },
    { name: 'Travel',        icon: 'flight' },
    { name: 'Utilities',     icon: 'bolt' },
    { name: 'Entertainment', icon: 'movie' },
    { name: 'Health',        icon: 'health_and_safety' },
    { name: 'Shopping',      icon: 'shopping_bag' },
    { name: 'Housing',       icon: 'home' },
    { name: 'Rent',          icon: 'apartment' },
    { name: 'Education',     icon: 'school' },
    { name: 'Subscriptions', icon: 'subscriptions' },
    { name: 'Insurance',     icon: 'shield' },
    { name: 'Gifts',         icon: 'card_giftcard' },
    { name: 'Pet Care',      icon: 'pets' },
  ];

  private now = new Date();

  currentMonthLabel = computed(() => {
    return this.now.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  todayDay = computed(() => this.now.getDate());
  daysInMonth = computed(() => new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0).getDate());
  daysLeft = computed(() => this.daysInMonth() - this.todayDay());
  totalBudget = computed(() => this.goals().reduce((s, g) => s + g.monthlyLimit, 0));

  private currentMonthExpenses = computed(() => {
    const start = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
    const end = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0, 23, 59, 59);
    return this.transactionService.allTransactions()
      .filter(t => t.type === 'expense' && new Date(t.date) >= start && new Date(t.date) <= end);
  });

  goalDetails = computed(() => {
    const expenses = this.currentMonthExpenses();
    return this.goals().map(goal => {
      const spent = expenses
        .filter(t => t.category === goal.category)
        .reduce((s, t) => s + t.amount, 0);
      const pct = Math.min((spent / goal.monthlyLimit) * 100, 200);
      return {
        ...goal,
        limit: goal.monthlyLimit,
        spent,
        percentage: Math.min(pct, 100),
        isOver: spent > goal.monthlyLimit,
        isNear: spent > 0 && (spent / goal.monthlyLimit) >= 0.8,
      };
    });
  });

  goalsOnTrack = computed(() => this.goalDetails().filter(g => !g.isOver).length);
  goalsOverBudget = computed(() => this.goalDetails().filter(g => g.isOver).length);

  ngOnInit(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try { this.goals.set(JSON.parse(stored)); } catch { this.goals.set([]); }
    }
  }

  openAddGoal(): void {
    this.formCategory = '';
    this.formLimit = null;
    this.editingGoalId.set(null);
    this.formError.set('');
    this.showForm.set(true);
  }

  editGoal(goal: BudgetGoal): void {
    this.formCategory = goal.category;
    this.formLimit = goal.monthlyLimit;
    this.editingGoalId.set(goal.id);
    this.formError.set('');
    this.showForm.set(true);
  }

  onCategoryChange(): void {
    this.formError.set('');
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingGoalId.set(null);
    this.formError.set('');
  }

  saveGoal(): void {
    if (!this.formCategory) { this.formError.set('Please select a category.'); return; }
    if (!this.formLimit || this.formLimit <= 0) { this.formError.set('Please enter a valid budget limit.'); return; }

    const icon = this.expenseCategories.find(c => c.name === this.formCategory)?.icon || 'label';
    const editId = this.editingGoalId();

    if (editId) {
      this.goals.update(g => g.map(goal =>
        goal.id === editId ? { ...goal, category: this.formCategory, icon, monthlyLimit: Number(this.formLimit) } : goal
      ));
    } else {
      const exists = this.goals().some(g => g.category === this.formCategory);
      if (exists) { this.formError.set('A budget goal for this category already exists.'); return; }
      const newGoal: BudgetGoal = {
        id: Date.now().toString(),
        category: this.formCategory,
        icon,
        monthlyLimit: Number(this.formLimit)
      };
      this.goals.update(g => [...g, newGoal]);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.goals()));
    this.closeForm();
  }

  deleteGoal(id: string): void {
    this.goals.update(g => g.filter(goal => goal.id !== id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.goals()));
  }
}
