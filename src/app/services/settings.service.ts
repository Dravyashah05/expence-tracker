import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Settings {
  darkMode: boolean;
  currency: string;
  language: string;
  notification: boolean;
  autoSave: boolean;
  themeColor: string;
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
  
  private settingsSignal = signal<Settings>({
    darkMode: false,
    currency: 'USD',
    language: 'English',
    notification: true,
    autoSave: true,
    themeColor: 'Blue'
  });

  settings = computed(() => this.settingsSignal());

  // Computed signals for individual settings
  darkMode = computed(() => this.settingsSignal().darkMode);
  currency = computed(() => this.settingsSignal().currency);
  currencySymbol = computed(() => this.currencies.find(option => option.code === this.currency())?.symbol || this.currency());
  language = computed(() => this.settingsSignal().language);
  notification = computed(() => this.settingsSignal().notification);
  autoSave = computed(() => this.settingsSignal().autoSave);
  themeColor = computed(() => this.settingsSignal().themeColor);
  currentTheme = computed(() => this.materialThemes[this.themeColor()]);

  // Available options
  currencies: CurrencyOption[] = [
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '\u20AC', label: 'EUR (\u20AC)' },
    { code: 'GBP', symbol: '\u00A3', label: 'GBP (\u00A3)' },
    { code: 'INR', symbol: '\u20B9', label: 'INR (\u20B9)' },
    { code: 'JPY', symbol: '\u00A5', label: 'JPY (\u00A5)' },
    { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' }
  ];
  languages = ['English', 'Spanish', 'French', 'German', 'Hindi'];
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

  private loadSettingsFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      try {
        const settings = JSON.parse(stored) as Settings;
        this.settingsSignal.set(settings);
      } catch {
        localStorage.removeItem('appSettings');
      }
    }
  }

  private saveSettingsToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    localStorage.setItem('appSettings', JSON.stringify(this.settingsSignal()));
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
    const match = this.currencies.find(option => option.code === currency);
    const symbol = match?.symbol || currency;
    return `${symbol} ${amount.toFixed(2)}`;
  }
}

