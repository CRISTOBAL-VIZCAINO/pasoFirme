import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TrackingService } from '../../tracking.service';
import { SITE } from '../../../data/site.config';
import { WHATSAPP_VISIBLE, whatsappUrl } from '../../contacto';
import { Icon } from '../../../shared/ui/icon/icon';
import { Logo } from '../../../shared/ui/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon, Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly site = SITE;
  protected readonly telefono = WHATSAPP_VISIBLE;
  protected readonly whatsapp = whatsappUrl('Hola, quiero más información sobre Paso Firme.');
  private readonly tracking = inject(TrackingService);

  protected alWhatsapp(): void {
    this.tracking.registrar('whatsapp_click', { origen: 'footer' });
  }

  protected readonly year = new Date().getFullYear();
}
