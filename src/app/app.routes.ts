import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ExportDataComponent } from './components/export-data/export-data.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BudgetGoalsComponent } from './components/budget-goals/budget-goals.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  { path: 'dashboard',        component: DashboardComponent,      canActivate: [authGuard] },
  { path: 'add-transaction',  component: AddTransactionComponent, canActivate: [authGuard] },
  { path: 'analytics',        component: AnalyticsComponent,      canActivate: [authGuard] },
  { path: 'budget-goals',     component: BudgetGoalsComponent,    canActivate: [authGuard] },
  { path: 'export',           component: ExportDataComponent,     canActivate: [authGuard] },
  { path: 'transactions',     component: TransactionListComponent,canActivate: [authGuard] },
  { path: 'settings',         component: SettingsComponent,       canActivate: [authGuard] },
  { path: 'settings/profile', component: ProfileComponent,        canActivate: [authGuard] },

  { path: '**', redirectTo: '/dashboard' }
];
