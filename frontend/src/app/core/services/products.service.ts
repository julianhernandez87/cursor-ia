import { Injectable } from '@angular/core';

export interface Product {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', title: 'Cuenta de Ahorros', description: 'Ahorre con tasas competitivas y acceso 24/7 desde nuestra Sucursal Virtual.' },
  { id: '2', title: 'Tarjetas de Crédito', description: 'Beneficios, millas y cuotas sin interés en comercios seleccionados.' },
  { id: '3', title: 'Préstamos Personales', description: 'Financiación flexible con plazos y tasas adaptados a usted.' },
  { id: '4', title: 'Seguros', description: 'Proteja su familia y bienes con nuestras pólizas.' },
];

@Injectable({ providedIn: 'root' })
export class ProductsService {
  getProducts(): Product[] {
    return MOCK_PRODUCTS;
  }
}
