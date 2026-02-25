import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/card/card.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ToastService } from '../../shared/toast/toast.service';

interface MockDocument {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-sv-documentos',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="documentos-page">
      <h1 class="page-title">Documentos</h1>
      <app-card class="table-card">
        <table class="docs-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (doc of documents; track doc.id) {
              <tr>
                <td class="doc-name">{{ doc.name }}</td>
                <td class="doc-desc">{{ doc.description }}</td>
                <td class="doc-action">
                  <app-button type="button" variant="secondary" (click)="onDownload(doc)">Descargar</app-button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-card>
    </div>
  `,
  styles: [`
    .documentos-page { max-width: 900px; margin: 0 auto; }
    .page-title { font-size: 1.5rem; margin: 0 0 var(--space-5); color: var(--color-text); }
    .table-card { padding: 0; overflow: hidden; }
    .docs-table { width: 100%; border-collapse: collapse; }
    .docs-table th, .docs-table td { padding: var(--space-3) var(--space-4); text-align: left; border-bottom: 1px solid var(--color-border); }
    .docs-table th { background: var(--color-bg); font-weight: 600; font-size: 0.875rem; color: var(--color-text-muted); }
    .docs-table tbody tr:hover { background: var(--color-bg); }
    .doc-name { font-weight: 500; color: var(--color-text); }
    .doc-desc { color: var(--color-text-muted); font-size: 0.9rem; }
    .doc-action { white-space: nowrap; }
  `],
})
export class DocumentosComponent {
  private toast = inject(ToastService);

  documents: MockDocument[] = [
    { id: '1', name: 'Extracto enero', description: 'Extracto de cuenta enero 2025' },
    { id: '2', name: 'Extracto febrero', description: 'Extracto de cuenta febrero 2025' },
    { id: '3', name: 'Certificado bancario', description: 'Certificado de saldos y movimientos' },
    { id: '4', name: 'Movimientos últimos 30 días', description: 'Detalle de movimientos recientes' },
  ];

  onDownload(doc: MockDocument): void {
    this.toast.success('Descarga iniciada: ' + doc.name);
  }
}
