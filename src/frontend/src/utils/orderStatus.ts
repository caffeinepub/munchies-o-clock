import type { OrderStatus } from '../backend';

export function getNextValidStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['inProgress' as OrderStatus, 'cancelled' as OrderStatus];
    case 'inProgress':
      return ['completed' as OrderStatus, 'cancelled' as OrderStatus];
    case 'completed':
    case 'cancelled':
      return [];
    default:
      return [];
  }
}
