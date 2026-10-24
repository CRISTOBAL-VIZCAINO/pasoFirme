import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE } from '../../data/site.config';
import { PageHero } from '../../shared/ui/page-hero/page-hero';

@Component({
  selector: 'app-privacidad',
  imports: [PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      eyebrow="Legal"
      title="Tratamiento de datos personales"
      lead="Cómo cuidamos la información de los comerciantes y de las entidades que confían en nosotros."
      [breadcrumbs]="[{ label: 'Tratamiento de datos' }]"
    />

    <section class="section">
      <div class="container container--narrow legal">
        <div class="note note--sun">
          <p>
            <strong>Documento de referencia del prototipo.</strong> Antes de operar, esta política debe ser revisada y adoptada formalmente por
            el responsable del tratamiento.
          </p>
        </div>

        <h2>1. Marco legal</h2>
        <p>
          {{ site.nombre }} trata los datos personales de acuerdo con la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el
          Decreto 1074 de 2015) y demás normas colombianas sobre protección de datos personales.
        </p>

        <h2>2. Datos que recogemos</h2>
        <ul>
          <li>Datos de contacto: nombre, número de celular y preferencia de contacto.</li>
          <li>Datos del negocio: municipio, zona, tipo de negocio, actividad y antigüedad.</li>
          <li>Durante el acompañamiento: registros de ventas, compras y gastos que tú decidas compartir.</li>
        </ul>
        <p>No solicitamos datos sensibles. Las herramientas y calculadoras del sitio funcionan en tu navegador y no envían lo que escribes.</p>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Contactarte y agendar la visita en tu puesto.</li>
          <li>Acompañar tu negocio y generar tus resúmenes de caja.</li>
          <li>Elaborar estadísticas anónimas de impacto del programa.</li>
          <li>Solo con tu autorización expresa y por separado: presentar tu perfil financiero a una entidad de microcrédito.</li>
        </ul>

        <h2>4. Lo que nunca hacemos</h2>
        <p>
          No vendemos tus datos, no los compartimos con autoridades tributarias ni con la Alcaldía, y no los entregamos a entidades financieras
          sin tu autorización expresa.
        </p>

        <h2>5. Tus derechos</h2>
        <p>
          Puedes conocer, actualizar, rectificar y suprimir tus datos, revocar la autorización y presentar quejas ante la Superintendencia de
          Industria y Comercio. Para ejercerlos, escríbenos a <a [href]="'mailto:' + site.correo">{{ site.correo }}</a>.
        </p>

        <h2>6. Uso de inteligencia artificial</h2>
        <p>
          Las notas de voz y fotos que envíes se procesan con herramientas de IA solo para convertirlas en registros contables. Todo resultado que
          afecte una decisión de crédito es revisado por una persona.
        </p>
      </div>
    </section>
  `,
  styles: `
    .legal {
      h2 {
        font-size: var(--fs-lg);
        margin-top: var(--space-6);
      }

      .note {
        margin-bottom: var(--space-5);
      }
    }
  `,
})
export class Privacidad {
  protected readonly site = SITE;
}
