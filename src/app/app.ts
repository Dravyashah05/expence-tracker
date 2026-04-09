import { Component, inject, effect, PLATFORM_ID, signal, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SettingsService } from './services/settings.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  currentUrl = signal<string>(this.router.url);

  isLoginPage = computed(() => {
    return this.currentUrl() === '/login';
  });

  constructor() {
    // Track router changes
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });

    // Apply dark mode class when it changes
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const isDarkMode = this.settingsService.darkMode();
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    });
  }
}
