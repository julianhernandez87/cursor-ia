import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: true,
  template: `
    <div class="page help-page">
      <h1 class="page-title">Ayuda</h1>
      <p class="help-intro">Consulte aquí las preguntas frecuentes y canales de contacto.</p>
      <section class="help-section">
        <h2>Sucursal Virtual</h2>
        <p>Acceda con su documento o correo y contraseña. Si olvidó su contraseña, use la opción "Recuperar contraseña" en la pantalla de ingreso.</p>
      </section>
      <section class="help-section">
        <h2>Contacto</h2>
        <p>Atención al cliente: 0800-XXX-XXXX. Horario de lunes a viernes de 8 a 20 h.</p>
      </section>
    </div>
  `,
  styles: [`
    .page { padding: var(--space-6) var(--space-5); max-width: 800px; margin: 0 auto; }
    .page-title { font-size: 1.75rem; margin: 0 0 var(--space-3); color: var(--color-text); }
    .help-intro { color: var(--color-text-muted); margin: 0 0 var(--space-5); }
    .help-section { margin-bottom: var(--space-5); }
    .help-section h2 { font-size: 1.15rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .help-section p { margin: 0; color: var(--color-text-muted); }
  `],
})
export class HelpComponent {}
