import { Pipe, PipeTransform, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false
})
export class AppCurrencyPipe implements PipeTransform {
  private platformId = inject(PLATFORM_ID);
  private settingsService = inject(SettingsService);

  transform(value: number | null | undefined, digitsInfo: string = '1.0-2'): string {
    const currencyCode = this.settingsService.currency();
    const numericValue = Number(value ?? 0);
    const locale = isPlatformBrowser(this.platformId) ? navigator.language : 'en-US';
    const maxFractionDigits = this.extractMaxFractionDigits(digitsInfo);

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: maxFractionDigits
    }).format(numericValue);
  }

  private extractMaxFractionDigits(digitsInfo: string): number {
    const parts = digitsInfo.split('-');
    const parsed = Number(parts[1]);
    return Number.isFinite(parsed) ? parsed : 2;
  }
}
