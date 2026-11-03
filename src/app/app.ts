import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { TrackingService } from './core/tracking.service';
import { Footer } from './core/layout/footer/footer';
import { Header } from './core/layout/header/header';
import { WhatsappFab } from './core/layout/whatsapp-fab/whatsapp-fab';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, WhatsappFab],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  /** En el panel interno no se muestran el menú, el pie ni el botón de WhatsApp del sitio público. */
  protected readonly esPanel = signal(location.pathname.startsWith('/admin'));

  constructor() {
    inject(TrackingService).iniciar();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      this.esPanel.set(e.urlAfterRedirects.startsWith('/admin'));
    });
  }
}
