import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactions = signal<Transaction[]>([]);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private apiBase = 'http://localhost:3001/api';
  private currentUserId = signal<string | null>(null);
  private loadCount = signal(0);
  private mutationCount = signal(0);

  // Computed signals
  allTransactions = computed(() => this.transactions());
  expenses = computed(() => this.transactions().filter(t => t.type === 'expense'));
  income = computed(() => this.transactions().filter(t => t.type === 'income'));
  totalExpenses = computed(() => this.expenses().reduce((sum, t) => sum + t.amount, 0));
  totalIncome = computed(() => this.income().reduce((sum, t) => sum + t.amount, 0));
  netBalance = computed(() => this.totalIncome() - this.totalExpenses());
  isLoading = computed(() => this.loadCount() > 0);
  isMutating = computed(() => this.mutationCount() > 0);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      this.setCurrentUser(userId);
    }
  }

  setCurrentUser(userId: string | null): void {
    this.currentUserId.set(userId);

    if (!userId) {
      this.transactions.set([]);
      return;
    }

    void this.loadTransactions(userId);
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<boolean> {
    const userId = this.currentUserId();
    if (!userId) {
      return false;
    }

    this.mutationCount.update(count => count + 1);
    try {
      const response = await firstValueFrom(
        this.http.post<{ transaction: Transaction }>(`${this.apiBase}/transactions/${userId}`, transaction)
      );

      this.transactions.update(trans => [response.transaction, ...trans]);
      return true;
    } catch {
      return false;
    } finally {
      this.mutationCount.update(count => Math.max(0, count - 1));
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const userId = this.currentUserId();
    if (!userId) {
      return false;
    }

    this.mutationCount.update(count => count + 1);
    try {
      await firstValueFrom(this.http.delete(`${this.apiBase}/transactions/${userId}/${id}`));
      this.transactions.update(trans => trans.filter(t => t.id !== id));
      return true;
    } catch {
      return false;
    } finally {
      this.mutationCount.update(count => Math.max(0, count - 1));
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    const userId = this.currentUserId();
    if (!userId) {
      return false;
    }

    this.mutationCount.update(count => count + 1);
    try {
      const response = await firstValueFrom(
        this.http.put<{ transaction: Transaction }>(`${this.apiBase}/transactions/${userId}/${id}`, updates)
      );

      this.transactions.update(trans =>
        trans.map(t => (t.id === id ? response.transaction : t))
      );
      return true;
    } catch {
      return false;
    } finally {
      this.mutationCount.update(count => Math.max(0, count - 1));
    }
  }

  getTransactionsByCategory(category: string): Transaction[] {
    return this.transactions().filter(t => t.category === category);
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions().filter(t => {
      const transDate = new Date(t.date);
      return transDate >= startDate && transDate <= endDate;
    });
  }

  getCategoryBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    this.transactions().forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    return breakdown;
  }

  clearTransactions(): void {
    this.transactions.set([]);
  }

  private async loadTransactions(userId: string): Promise<void> {
    this.loadCount.update(count => count + 1);
    try {
      const response = await firstValueFrom(
        this.http.get<{ transactions: Transaction[] }>(`${this.apiBase}/transactions/${userId}`)
      );
      this.transactions.set(response.transactions || []);
    } catch {
      this.transactions.set([]);
    } finally {
      this.loadCount.update(count => Math.max(0, count - 1));
    }
  }
}
