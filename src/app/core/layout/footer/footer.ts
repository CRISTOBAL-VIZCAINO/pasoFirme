import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE, whatsappUrl } from '../../../data/site.config';
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
  protected readonly whatsapp = whatsappUrl('Hola, quiero más información sobre Paso Firme.');
  protected readonly year = new Date().getFullYear();
}
