import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/transaction';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private transactionService = inject(TransactionService);
  private currentUser = signal<User | null>(null);
  private isLoggedIn = signal(false);
  private isInitialized = signal(false);
  private apiBase = 'http://localhost:3001/api';
  private initPromise: Promise<boolean> | null = null;

  // Computed signals
  user = computed(() => this.currentUser());
  isAuthenticated = computed(() => this.isLoggedIn());
  isInit = computed(() => this.isInitialized());

  constructor() {
    void this.ensureInitialized();
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ user: Omit<User, 'password'> }>(`${this.apiBase}/auth/login`, {
          email,
          password,
        }),
      );

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
      };

      this.currentUser.set(user);
      this.isLoggedIn.set(true);
      this.persistUser(user);
      this.transactionService.setCurrentUser(user.id);
      return true;
    } catch {
      return false;
    }
  }

  async register(email: string, password: string, name: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ user: Omit<User, 'password'> }>(`${this.apiBase}/auth/register`, {
          email,
          password,
          name,
        }),
      );

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
      };

      this.currentUser.set(user);
      this.isLoggedIn.set(true);
      this.persistUser(user);
      this.transactionService.setCurrentUser(user.id);
      return true;
    } catch {
      return false;
    }
  }

  async updateProfileRemote(
    name: string,
    email: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const user = this.currentUser();
    if (!user) {
      return { ok: false, message: 'No active user.' };
    }

    try {
      const response = await firstValueFrom(
        this.http.put<{ user: Omit<User, 'password'> }>(`${this.apiBase}/users/${user.id}`, {
          name,
          email,
        }),
      );

      const updated: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        avatarUrl: user.avatarUrl,
      };

      this.currentUser.set(updated);
      this.persistUser(updated);
      return { ok: true };
    } catch (error: any) {
      const message = error?.error?.message || 'Profile update failed.';
      return { ok: false, message };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const user = this.currentUser();
    if (!user) {
      return { ok: false, message: 'No active user.' };
    }

    try {
      await firstValueFrom(
        this.http.put(`${this.apiBase}/users/${user.id}/password`, {
          currentPassword,
          newPassword,
        }),
      );
      return { ok: true };
    } catch (error: any) {
      const message = error?.error?.message || 'Password update failed.';
      return { ok: false, message };
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.transactionService.setCurrentUser(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserId');
    }
  }

  updateProfile(updates: Partial<User>): void {
    const current = this.currentUser();
    if (!current) return;
    const next = { ...current, ...updates };
    this.currentUser.set(next);
    this.persistUser(next);
  }

  async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized()) {
      return this.isLoggedIn();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        this.isInitialized.set(true);
        resolve(this.isLoggedIn());
        return;
      }

      const storedUser = localStorage.getItem('currentUser');
      const storedUserId = localStorage.getItem('currentUserId');

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
          localStorage.setItem('currentUserId', user.id);
          this.transactionService.setCurrentUser(user.id);
        } catch {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentUserId');
        }
      } else if (storedUserId) {
        // Fallback to keep session alive with minimal identity
        this.currentUser.set({ id: storedUserId, name: 'User', email: 'unknown@local' });
        this.isLoggedIn.set(true);
        this.transactionService.setCurrentUser(storedUserId);
      }

      this.isInitialized.set(true);
      resolve(this.isLoggedIn());
    });

    return this.initPromise;
  }

  private persistUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('currentUserId', user.id);
  }
}
