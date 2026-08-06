import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<ThemeMode>(this.getSavedTheme());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem('alicerce_theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
  }

  private getSavedTheme(): ThemeMode {
    const saved = localStorage.getItem('alicerce_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
