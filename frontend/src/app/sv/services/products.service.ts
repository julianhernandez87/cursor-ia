import { Injectable } from '@angular/core';
import { SavingsAccount } from '../../models/savings-account.model';
import { CreditCard } from '../../models/credit-card.model';
import { MOCK_SAVINGS_ACCOUNTS } from '../dashboard/dashboard.mock';
import { MOCK_CREDIT_CARDS } from '../dashboard/dashboard.mock';

export interface ProductOption {
  id: string;
  label: string;
  type: 'account' | 'card';
}

@Injectable({ providedIn: 'root' })
export class SvProductsService {
  getSavingsAccounts(): SavingsAccount[] {
    return [...MOCK_SAVINGS_ACCOUNTS];
  }

  getCreditCards(): CreditCard[] {
    return [...MOCK_CREDIT_CARDS];
  }

  getProductsForPayment(): ProductOption[] {
    const accounts = this.getSavingsAccounts().map((a) => ({
      id: `acc-${a.id}`,
      label: `${a.name} (${a.accountNumber})`,
      type: 'account' as const,
    }));
    const cards = this.getCreditCards().map((c) => ({
      id: `card-${c.id}`,
      label: `${c.brand} ****${c.lastFourDigits}`,
      type: 'card' as const,
    }));
    return [...accounts, ...cards];
  }
}
