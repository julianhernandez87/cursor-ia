import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/card/card.component';
import { MOCK_SAVINGS_ACCOUNTS } from './dashboard.mock';
import { MOCK_CREDIT_CARDS } from './dashboard.mock';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="dashboard">
      <section class="dashboard-section resumen">
        <div class="section-head">
          <h1 class="dashboard-title">Resumen</h1>
          <label class="toggle-saldos">
            <input type="checkbox" [checked]="hideBalances()" (change)="hideBalances.set(!hideBalances())" />
            <span>Ocultar saldos</span>
          </label>
        </div>
        <div class="summary-cards">
          <div class="summary-card summary-card-uniform">
            <span class="summary-label">Saldo actual</span>
            <span class="summary-value" [class.hidden]="hideBalances()">{{ totalSavings | currency: 'USD':'symbol':'1.2-2' }}</span>
            <span class="summary-value hidden-placeholder" [class.visible]="hideBalances()">••••••</span>
            <span class="summary-product">Kubo Rentable</span>
          </div>
          <div class="summary-card summary-card-uniform">
            <span class="summary-label">Total en cuentas</span>
            <span class="summary-value" [class.hidden]="hideBalances()">{{ totalSavings | currency: 'USD':'symbol':'1.2-2' }}</span>
            <span class="summary-value hidden-placeholder" [class.visible]="hideBalances()">••••••</span>
            <span class="summary-product">Todos los productos</span>
          </div>
          <div class="summary-card summary-card-uniform">
            <span class="summary-label">Consumo tarjetas</span>
            <span class="summary-value" [class.hidden]="hideBalances()">{{ totalConsumption | currency: 'USD':'symbol':'1.2-2' }}</span>
            <span class="summary-value hidden-placeholder" [class.visible]="hideBalances()">••••••</span>
            <span class="summary-product">Tarjetas de crédito</span>
          </div>
        </div>
      </section>

      <section class="dashboard-section acciones">
        <h2 class="section-title">Acciones Favoritas</h2>
        <p class="section-subtitle">Aquí puedes encontrar o agregar las transacciones más usadas con tus productos.</p>
        <div class="acciones-grid">
          <app-card class="accion-card">
            <span class="accion-icon">+</span>
            <span class="accion-label">Agrega las transacciones más usadas.</span>
          </app-card>
          <app-card class="accion-card">
            <span class="accion-icon">📄</span>
            <span class="accion-label">Pago de servicios</span>
          </app-card>
          <app-card class="accion-card">
            <span class="accion-icon">📋</span>
            <span class="accion-label">Pago de obligaciones</span>
          </app-card>
          <app-card class="accion-card">
            <span class="accion-icon">⇄</span>
            <span class="accion-label">Transferencias</span>
          </app-card>
        </div>
      </section>

      <section class="dashboard-section">
        <h2 class="section-title">Cuentas de ahorro</h2>
        <div class="cards-grid">
          @for (acc of savingsAccounts; track acc.id) {
            <app-card class="account-card">
              <h3 class="account-name">{{ acc.name }}</h3>
              <p class="account-number">{{ acc.accountNumber }}</p>
              <p class="account-balance" [class.hidden]="hideBalances()">{{ acc.balance | currency: acc.currency : 'symbol' : '1.2-2' }}</p>
              <p class="account-balance hidden-placeholder" [class.visible]="hideBalances()">••••••</p>
            </app-card>
          }
        </div>
      </section>

      <section class="dashboard-section">
        <h2 class="section-title">Tarjetas de crédito</h2>
        <div class="cards-grid">
          @for (card of creditCards; track card.id) {
            <app-card class="credit-card">
              <h3 class="card-brand">{{ card.brand }} ****{{ card.lastFourDigits }}</h3>
              <p class="card-consumption" [class.hidden]="hideBalances()">Consumo: {{ card.consumption | currency: card.currency : 'symbol' : '1.2-2' }} / {{ card.limit | currency: card.currency : 'symbol' : '1.2-2' }}</p>
              <p class="card-consumption hidden-placeholder" [class.visible]="hideBalances()">•••••• / ••••••</p>
              <div class="card-bar">
                <span class="card-bar-fill" [style.width.%]="(card.consumption / card.limit) * 100"></span>
              </div>
            </app-card>
          }
        </div>
      </section>

      <section class="dashboard-section banner-section">
        <app-card class="promo-banner">
          <div class="promo-banner-content">
            <h3 class="promo-title">Crédito de vehículos Occiauto</h3>
            <p class="promo-copy">Te prestamos hasta el 100% del valor para tu vehículo*</p>
            <button type="button" class="promo-cta">Solicítalo Aquí</button>
          </div>
          <div class="promo-banner-visual"></div>
        </app-card>
      </section>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .dashboard-title { font-size: 1.5rem; margin: 0; color: var(--color-text); }
    .section-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4); }
    .toggle-saldos { display: inline-flex; align-items: center; gap: var(--space-2); font-size: 0.875rem; color: var(--color-text-muted); cursor: pointer; }
    .dashboard-section { margin-bottom: var(--space-6); }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); align-items: stretch; }
    @media (max-width: 900px) { .summary-cards { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 500px) { .summary-cards { grid-template-columns: 1fr; } }
    .summary-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-height: 120px;
      padding: var(--space-5);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
    }
    .summary-card-uniform {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-sidebar-bg) 100%);
      color: #fff;
    }
    .summary-card-uniform .summary-label {
      font-size: 0.9rem;
      font-weight: 400;
      color: #fff;
      opacity: 0.95;
    }
    .summary-card-uniform .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
    }
    .summary-card-uniform .summary-product {
      font-size: 0.85rem;
      color: #fff;
      opacity: 0.9;
    }
    .summary-label { font-size: 0.9rem; color: var(--color-text-muted); }
    .summary-value { font-size: 1.5rem; font-weight: 700; color: var(--color-text); }
    .summary-value.hidden, .hidden-placeholder { display: none !important; }
    .hidden-placeholder.visible { display: inline !important; }
    .summary-product { font-size: 0.85rem; opacity: 0.9; }
    .section-title { font-size: 1.15rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .section-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 var(--space-4); }
    .acciones-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      align-items: stretch;
    }
    @media (max-width: 900px) { .acciones-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .acciones-grid { grid-template-columns: 1fr; } }
    .accion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: var(--space-3);
      text-align: center;
      cursor: pointer;
      transition: box-shadow var(--transition);
      min-height: 100px;
      padding: var(--space-4);
    }
    .accion-card:hover { box-shadow: var(--shadow-md); }
    .accion-icon { font-size: 1.75rem; color: var(--color-primary); flex-shrink: 0; }
    .accion-label {
      font-size: 0.85rem;
      color: var(--color-text);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-4);
      align-items: stretch;
    }
    .account-card, .credit-card { min-height: 0; }
    .account-card .account-name, .credit-card .card-brand { font-size: 1rem; margin: 0 0 var(--space-2); color: var(--color-text); }
    .account-number, .card-consumption { margin: 0 0 var(--space-2); color: var(--color-text-muted); font-size: 0.9rem; }
    .account-balance { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--color-text); }
    .card-bar { height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; margin-top: var(--space-2); }
    .card-bar-fill { display: block; height: 100%; background: var(--color-primary); border-radius: 3px; transition: width var(--transition); }
    .promo-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 160px;
      padding: 0;
      overflow: hidden;
    }
    .promo-banner-content { padding: var(--space-5); display: flex; flex-direction: column; justify-content: center; gap: var(--space-3); }
    .promo-title { margin: 0; font-size: 1.25rem; color: var(--color-primary); }
    .promo-copy { margin: 0; font-size: 0.9rem; color: var(--color-text-muted); }
    .promo-cta {
      align-self: flex-start;
      padding: var(--space-2) var(--space-4);
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .promo-cta:hover { background: var(--color-primary-hover); }
    .promo-banner-visual { background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-border) 100%); }
    @media (max-width: 640px) {
      .promo-banner { grid-template-columns: 1fr; }
      .promo-banner-visual { min-height: 100px; }
    }
  `],
})
export class DashboardComponent {
  savingsAccounts = MOCK_SAVINGS_ACCOUNTS;
  creditCards = MOCK_CREDIT_CARDS;
  hideBalances = signal(false);

  get totalSavings(): number {
    return this.savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  }
  get totalConsumption(): number {
    return this.creditCards.reduce((sum, c) => sum + c.consumption, 0);
  }
}
