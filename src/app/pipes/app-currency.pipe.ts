import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false
})
export class AppCurrencyPipe implements PipeTransform {
  private locale = inject(LOCALE_ID) as string;
  private currencyPipe = new CurrencyPipe(this.locale);
  private settingsService = inject(SettingsService);

  transform(value: number | null | undefined, digitsInfo: string = '1.0-2'): string {
    const currencyCode = this.settingsService.currency();
    return this.currencyPipe.transform(value ?? 0, currencyCode, 'symbol', digitsInfo) ?? '';
  }
}
