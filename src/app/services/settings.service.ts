import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Settings {
  darkMode: boolean;
  currency: string;
  notification: boolean;
  autoSave: boolean;
  themeColor: string;
  bankAccounts: string[];
  cards: string[];
}

export interface ThemeColor {
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
  primaryLight?: string;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private platformId = inject(PLATFORM_ID);
  private readonly settingsStorageKey = 'appSettings';
  private readonly currencyStorageKey = 'appCurrency';
  private readonly defaultSettings: Settings = {
    darkMode: false,
    currency: 'USD',
    notification: true,
    autoSave: true,
    themeColor: 'Blue',
    bankAccounts: [],
    cards: [],
  };
  
  // Material Design Color Themes
  private materialThemes: { [key: string]: ThemeColor } = {
    'Blue': {
      name: 'Blue',
      primary: '#1f97d8',
      secondary: '#03dac6',
      tertiary: '#018786',
      primaryLight: '#b3e5fc'
    },
    'Purple': {
      name: 'Purple',
      primary: '#6f1dd6',
      secondary: '#03dac6',
      tertiary: '#018786',
      primaryLight: '#f3e5f5'
    },
    'Green': {
      name: 'Green',
      primary: '#00b894',
      secondary: '#26c485',
      tertiary: '#00897b',
      primaryLight: '#c8e6c9'
    },
    'Red': {
      name: 'Red',
      primary: '#cf3236',
      secondary: '#ff6e40',
      tertiary: '#d32f2f',
      primaryLight: '#ffebee'
    },
    'Orange': {
      name: 'Orange',
      primary: '#ff6d00',
      secondary: '#ff9100',
      tertiary: '#e65100',
      primaryLight: '#ffe0b2'
    },
    'Indigo': {
      name: 'Indigo',
      primary: '#3f51b5',
      secondary: '#3f51b5',
      tertiary: '#303f9f',
      primaryLight: '#e8eaf6'
    }
  };
  
  private settingsSignal = signal<Settings>(this.defaultSettings);

  settings = computed(() => this.settingsSignal());

  // Computed signals for individual settings
  darkMode = computed(() => this.settingsSignal().darkMode);
  currency = computed(() => this.settingsSignal().currency);
  currencySymbol = computed(() => this.currencies.find(option => option.code === this.currency())?.symbol || this.currency());
  notification = computed(() => this.settingsSignal().notification);
  autoSave = computed(() => this.settingsSignal().autoSave);
  themeColor = computed(() => this.settingsSignal().themeColor);
  bankAccounts = computed(() => this.settingsSignal().bankAccounts);
  cards = computed(() => this.settingsSignal().cards);
  currentTheme = computed(() => this.materialThemes[this.themeColor()]);

  // Available options
  currencies: CurrencyOption[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar (USD $)' },
    { code: 'EUR', symbol: '\u20AC', label: 'Euro (EUR \u20AC)' },
    { code: 'GBP', symbol: '\u00A3', label: 'British Pound (GBP \u00A3)' },
    { code: 'INR', symbol: '\u20B9', label: 'Indian Rupee (INR \u20B9)' },
    { code: 'JPY', symbol: '\u00A5', label: 'Japanese Yen (JPY \u00A5)' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (AUD A$)' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (CAD C$)' },
    { code: 'AED', symbol: '\u062F.\u0625', label: 'UAE Dirham (AED \u062F.\u0625)' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (SGD S$)' },
    { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar (NZD NZ$)' },
    { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
    { code: 'CNY', symbol: '\u00A5', label: 'Chinese Yuan (CNY \u00A5)' }
  ];
  themeColors = Object.keys(this.materialThemes);

  constructor() {
    this.loadSettingsFromStorage();
    this.applyDarkMode();
    this.applyThemeColor();
  }

  updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    const currentSettings = this.settingsSignal();
    this.settingsSignal.set({ ...currentSettings, [key]: value });
    this.saveSettingsToStorage();
    
    // Apply dark mode immediately
    if (key === 'darkMode') {
      this.applyDarkMode();
    }
    
    // Apply theme color immediately
    if (key === 'themeColor') {
      this.applyThemeColor();
    }
  }

  addBankAccount(name: string): void {
    const clean = name.trim();
    if (!clean) return;
    if (this.bankAccounts().some(item => item.toLowerCase() === clean.toLowerCase())) return;
    this.updateSetting('bankAccounts', [...this.bankAccounts(), clean]);
  }

  removeBankAccount(name: string): void {
    this.updateSetting(
      'bankAccounts',
      this.bankAccounts().filter(item => item !== name)
    );
  }

  addCard(name: string): void {
    const clean = name.trim();
    if (!clean) return;
    if (this.cards().some(item => item.toLowerCase() === clean.toLowerCase())) return;
    this.updateSetting('cards', [...this.cards(), clean]);
  }

  removeCard(name: string): void {
    this.updateSetting(
      'cards',
      this.cards().filter(item => item !== name)
    );
  }

  private loadSettingsFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const currencyFallback = this.getStoredCurrencyFallback();
    const stored = localStorage.getItem(this.settingsStorageKey);
    if (stored) {
      try {
        const settings = this.normalizeSettings(JSON.parse(stored), currencyFallback);
        this.settingsSignal.set(settings);
      } catch {
        const normalized = this.normalizeSettings({}, currencyFallback);
        this.settingsSignal.set(normalized);
      }
    } else {
      const normalized = this.normalizeSettings({}, currencyFallback);
      this.settingsSignal.set(normalized);
    }
  }

  private saveSettingsToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const settings = this.settingsSignal();
    localStorage.setItem(this.settingsStorageKey, JSON.stringify(settings));
    localStorage.setItem(this.currencyStorageKey, settings.currency);
  }

  private applyDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isDarkMode = this.settingsSignal().darkMode;
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }

  private applyThemeColor(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const theme = this.currentTheme();
    const root = document.documentElement;
    
    if (theme) {
      root.style.setProperty('--primary', theme.primary);
      root.style.setProperty('--primary-strong', theme.tertiary || theme.primary);
      root.style.setProperty('--accent', theme.secondary);
    }
  }

  getFormattedCurrency(amount: number): string {
    const currency = this.settingsSignal().currency;
    const locale = isPlatformBrowser(this.platformId) ? navigator.language : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private normalizeSettings(raw: unknown, currencyFallback: string | null = null): Settings {
    const value = (raw && typeof raw === 'object') ? raw as Partial<Settings> : {};
    const requestedCurrency = typeof value.currency === 'string' ? value.currency : (currencyFallback || this.defaultSettings.currency);
    const currency = this.isSupportedCurrency(requestedCurrency) ? requestedCurrency : this.defaultSettings.currency;

    return {
      darkMode: Boolean(value.darkMode ?? this.defaultSettings.darkMode),
      currency,
      notification: Boolean(value.notification ?? this.defaultSettings.notification),
      autoSave: Boolean(value.autoSave ?? this.defaultSettings.autoSave),
      themeColor: typeof value.themeColor === 'string' ? value.themeColor : this.defaultSettings.themeColor,
      bankAccounts: this.normalizeList(value.bankAccounts),
      cards: this.normalizeList(value.cards),
    };
  }

  private getStoredCurrencyFallback(): string | null {
    const stored = localStorage.getItem(this.currencyStorageKey);
    if (!stored) return null;
    return this.isSupportedCurrency(stored) ? stored : null;
  }

  private isSupportedCurrency(code: string): boolean {
    return this.currencies.some(option => option.code === code);
  }

  private normalizeList(values: unknown): string[] {
    if (!Array.isArray(values)) return [];
    const unique = new Set<string>();
    for (const item of values) {
      if (typeof item !== 'string') continue;
      const clean = item.trim();
      if (!clean) continue;
      unique.add(clean);
    }
    return [...unique];
  }
}

