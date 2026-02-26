import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <span class="loader-wrap" [class.sm]="size === 'sm'" [class.md]="size === 'md'" role="status" aria-live="polite" [attr.aria-label]="ariaLabel">
      <span class="loader" [class.sm]="size === 'sm'" [class.md]="size === 'md'"></span>
      <span class="loader-dot" [class.sm]="size === 'sm'" [class.md]="size === 'md'"></span>
    </span>
  `,
  styles: [`
    .loader-wrap {
      position: relative;
      width: 20px;
      height: 20px;
      display: inline-grid;
      place-items: center;
    }

    .loader {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--primary) 18%, transparent);
      border-top-color: var(--primary-strong);
      border-right-color: var(--primary);
      display: inline-block;
      animation: spin 0.75s linear infinite;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent);
    }

    .loader-dot {
      position: absolute;
      top: -1px;
      left: calc(50% - 2px);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent);
      animation: pulse 1.1s ease-in-out infinite;
    }

    .loader-wrap.sm,
    .loader.sm {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }

    .loader-wrap.md,
    .loader.md {
      width: 22px;
      height: 22px;
      border-width: 2px;
    }

    .loader-dot.sm {
      width: 3px;
      height: 3px;
      left: calc(50% - 1.5px);
    }

    .loader-dot.md {
      width: 5px;
      height: 5px;
      left: calc(50% - 2.5px);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.7);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .loader,
      .loader-dot {
        animation: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() ariaLabel = 'Loading';
}
