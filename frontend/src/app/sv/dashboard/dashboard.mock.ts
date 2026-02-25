import { SavingsAccount } from '../../models/savings-account.model';
import { CreditCard } from '../../models/credit-card.model';

export const MOCK_SAVINGS_ACCOUNTS: SavingsAccount[] = [
  { id: '1', name: 'Cuenta Ahorro Corriente', accountNumber: '****4521', balance: 125_450.5, currency: 'USD' },
  { id: '2', name: 'Cuenta Ahorro Plus', accountNumber: '****7832', balance: 89_200.0, currency: 'USD' },
];

export const MOCK_CREDIT_CARDS: CreditCard[] = [
  { id: '1', lastFourDigits: '3345', brand: 'Visa', consumption: 2_340, limit: 10_000, currency: 'USD' },
  { id: '2', lastFourDigits: '8821', brand: 'Mastercard', consumption: 5_100, limit: 15_000, currency: 'USD' },
];
