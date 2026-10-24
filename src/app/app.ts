import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
export class App {}
