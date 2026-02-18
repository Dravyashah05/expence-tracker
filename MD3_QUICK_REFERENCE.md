# Material Design 3 - Quick Reference Guide

## 🚀 Getting Started

### Run Development Server
```bash
npm start
# or
ng serve
```
Then navigate to `http://localhost:4200/`

### Build for Production
```bash
ng build --configuration production
```

---

## 🎨 CSS Variables - Quick Copy/Paste

### Colors
```css
/* Primary Colors */
--md3-primary: #9747ff
--md3-on-primary: #ffffff
--md3-primary-container: #f0ccff
--md3-on-primary-container: #21005d

/* Background & Surface */
--md3-background: #fffbfe
--md3-surface: #fffbfe
--md3-on-surface: #1c1b1f
--md3-on-background: #1c1b1f

/* Semantic Colors */
--income-color: #2ecc71
--expense-color: #e74c3c
--success-color: #27ae60
--warning-color: #f39c12
```

### Spacing
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
```

### Shadows
```css
--shadow-level-1: 0 2px 4px rgba(0, 0, 0, 0.05)
--shadow-level-2: 0 4px 8px rgba(0, 0, 0, 0.08)
--shadow-level-3: 0 8px 16px rgba(0, 0, 0, 0.1)
--shadow-level-4: 0 12px 24px rgba(0, 0, 0, 0.12)
--shadow-level-5: 0 16px 32px rgba(0, 0, 0, 0.14)
```

### Border Radius
```css
--radius-xs: 4px
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-full: 999px
```

---

## 🎯 Typography Classes

```html
<!-- Headlines -->
<h1 class="headline-lg">Large Heading (32px)</h1>
<h2 class="headline-md">Medium Heading (28px)</h2>
<h3 class="headline-sm">Small Heading (24px)</h3>

<!-- Titles -->
<p class="title-lg">Large Title (22px)</p>
<p class="title-md">Medium Title (16px)</p>

<!-- Body Text -->
<p class="body-lg">Large Body (16px)</p>
<p class="body-md">Medium Body (14px)</p>
<p class="body-sm">Small Body (12px)</p>

<!-- Labels -->
<span class="label-lg">Large Label (12px)</span>
<span class="label-md">Medium Label (11px)</span>
```

---

## 🔧 Common Component Classes

### Cards
```html
<div class="md3-card">
  <!-- Content -->
</div>

<div class="md3-card elevated">
  <!-- Elevated card with more shadow -->
</div>
```

### Buttons
```html
<!-- Filled Button (Primary) -->
<button class="md3-btn md3-btn-filled">Add</button>

<!-- Outlined Button -->
<button class="md3-btn md3-btn-outlined">Cancel</button>

<!-- Text Button -->
<button class="md3-btn md3-btn-text">Learn More</button>

<!-- Error Button -->
<button class="md3-btn md3-btn-error">Delete</button>
```

### Form Elements
```html
<!-- Text Input -->
<div class="md3-text-field">
  <label>Email</label>
  <input type="email" class="md3-input" />
</div>

<!-- Select -->
<select class="md3-select">
  <option>Option 1</option>
</select>

<!-- Error Message -->
<p class="error-message">This field is required</p>
```

### FAB (Floating Action Button)
```html
<a href="/add" class="md3-fab">
  <mat-icon>add</mat-icon>
</a>
```

### Snackbar/Toast
```html
<div class="md3-snackbar">
  <mat-icon>check_circle</mat-icon>
  <span>Success message</span>
</div>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */

/* Mobile: 320px - 480px */
@media (max-width: 480px) {
  /* Mobile styles */
}

/* Tablet: 480px - 768px */
@media (max-width: 768px) {
  /* Tablet styles */
}

/* Desktop: 768px+ */
/* Default desktop styles */
```

---

## 🌙 Dark Mode

### Automatic Detection
```typescript
// Automatically detected from system preference
// Uses CSS variables that change in dark mode
```

### Manual Toggle
```typescript
// In your component
private settingsService = inject(SettingsService);

toggleDarkMode() {
  this.settingsService.toggleDarkMode();
}
```

### CSS Dark Mode
```css
/* Automatically applied when dark mode is active */
@media (prefers-color-scheme: dark) {
  /* CSS will use dark mode variables */
}
```

---

## 🎨 Creating a New Component with MD3

### 1. Generate Component
```bash
ng generate component components/my-component
```

### 2. Add MD3 Styling
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <h1 class="headline-lg">My Component</h1>
      <button class="md3-btn md3-btn-filled">
        <mat-icon>add</mat-icon>
        Action
      </button>
    </div>
  `,
  styles: [`
    .container {
      padding: var(--spacing-lg);
      background-color: var(--md3-surface);
      border-radius: var(--radius-lg);
    }
  `]
})
export class MyComponent {}
```

---

## 🔒 Accessibility Checklist

- [ ] All interactive elements have proper focus states
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Semantic HTML used throughout
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation works
- [ ] Skip links provided
- [ ] Form labels associated with inputs
- [ ] Images have alt text

---

## 📊 Component State Management

### Using Signals
```typescript
import { signal, computed } from '@angular/core';

export class MyComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### In Template
```html
<!-- Signals must be invoked with () -->
<p>Count: {{ count() }}</p>
<p>Doubled: {{ doubled() }}</p>
```

---

## 🎯 Common Patterns

### Form Submission
```typescript
import { FormBuilder, Validators } from '@angular/forms';

form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required]
});

submit() {
  if (this.form.valid) {
    console.log(this.form.value);
  }
}
```

### Error Handling
```html
@if (form.get('email')?.hasError('required')) {
  <p class="error-message">Email is required</p>
}
```

### Loading State
```html
@if (loading()) {
  <div class="md3-spinner"></div>
} @else {
  <!-- Content -->
}
```

---

## 🚀 Deployment Checklist

- [ ] Build completes without errors
- [ ] No console warnings
- [ ] Responsive design tested on all breakpoints
- [ ] Dark mode works correctly
- [ ] Accessibility audit passed
- [ ] Performance metrics acceptable
- [ ] Cross-browser testing done
- [ ] Environment variables configured
- [ ] Analytics tracking in place

---

## 📚 Resources

- [Material Design 3](https://m3.material.io/)
- [Angular Material](https://material.angular.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Docs](https://angular.dev/)

---

## 💬 Support

For issues or questions:
1. Check the documentation in `MD3_REDESIGN.md`
2. Review component inline comments
3. Verify CSS variables are applied
4. Test in development mode first

---

**Version:** 1.0 | **Last Updated:** 2024
**Design System:** Material Design 3
**Framework:** Angular 21
