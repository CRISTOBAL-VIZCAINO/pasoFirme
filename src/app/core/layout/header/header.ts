import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { NAV } from '../../../data/site.config';
import { Icon } from '../../../shared/ui/icon/icon';
import { Logo } from '../../../shared/ui/logo/logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'close()',
  },
})
export class Header {
  protected readonly nav = NAV;
  protected readonly open = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.close());
  }

  protected toggle(): void {
    this.open.update((v) => !v);
    document.body.style.overflow = this.open() ? 'hidden' : '';
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
      document.body.style.overflow = '';
    }
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
