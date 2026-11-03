import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Logo } from '../../shared/ui/logo/logo';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, Logo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="login" id="contenido">
      <form class="card" (ngSubmit)="entrar()" novalidate>
        <app-logo />
        <h1>Panel</h1>
        <p class="hint">Solo para el equipo de Paso Firme.</p>
        <label for="pw">Contraseña</label>
        <input
          id="pw"
          name="password"
          type="password"
          autocomplete="current-password"
          [(ngModel)]="password"
          [attr.aria-invalid]="error() ? 'true' : null"
          aria-describedby="pw-error"
          required
        />
        @if (error()) {
          <p id="pw-error" class="error" role="alert">{{ error() }}</p>
        }
        <button type="submit" class="btn btn--primary" [disabled]="enviando() || !password">
          {{ enviando() ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </main>
  `,
  styles: `
    .login {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: var(--space-5);
      background: var(--sand-100);
    }

    .card {
      display: grid;
      gap: var(--space-3);
      width: min(100%, 380px);
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      background: var(--white);
      border: 1px solid var(--line);
      box-shadow: var(--shadow);
    }

    h1 {
      margin: 0;
      font-size: var(--fs-xl);
    }

    .hint {
      margin: 0;
      color: var(--ink-500);
      font-size: var(--fs-sm);
    }

    label {
      font-weight: 700;
    }

    input {
      min-height: 52px;
      padding: 0 var(--space-3);
      border: 2px solid var(--line-strong);
      border-radius: var(--radius-sm);
      font: inherit;

      &:focus-visible {
        outline: none;
        border-color: var(--teal-600);
        box-shadow: var(--focus-ring);
      }
    }

    .error {
      margin: 0;
      color: var(--coral-700);
      font-weight: 600;
    }
  `,
})
export class AdminLogin implements OnInit, OnDestroy {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);

  protected password = '';
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    if (this.admin.sesionActiva()) {
      void this.router.navigate(['/admin/panel']);
    }
  }

  ngOnDestroy(): void {
    this.meta.removeTag("name='robots'");
  }

  protected async entrar(): Promise<void> {
    this.enviando.set(true);
    this.error.set(null);
    const r = await this.admin.login(this.password);
    this.enviando.set(false);
    this.password = '';
    if (r.ok) {
      await this.router.navigate(['/admin/panel']);
    } else {
      this.error.set(r.error ?? 'No se pudo entrar.');
    }
  }
}
