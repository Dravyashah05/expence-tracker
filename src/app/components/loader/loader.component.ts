import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <span class="loader" [class.sm]="size === 'sm'" [class.md]="size === 'md'"></span>
  `,
  styles: [`
    .loader {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--primary) 30%, transparent);
      border-top-color: var(--primary);
      display: inline-block;
      animation: spin 0.8s linear infinite;
    }

    .loader.sm {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }

    .loader.md {
      width: 22px;
      height: 22px;
      border-width: 2px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' = 'sm';
}
