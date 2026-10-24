import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SITE } from '../../data/site.config';

/** Compone el título de la pestaña y actualiza la meta descripción en cada navegación. */
@Injectable()
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle && pageTitle !== 'Inicio' ? `${pageTitle} · ${SITE.nombre}` : `${SITE.nombre} · ${SITE.lema}`);

    const description = this.deepestData(snapshot.root)['description'] as string | undefined;
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
  }

  private deepestData(route: ActivatedRouteSnapshot): Record<string, unknown> {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current.data;
  }
}
