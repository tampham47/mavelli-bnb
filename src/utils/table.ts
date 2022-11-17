import { Order } from '../types/Order';

export const getOrderTable = (orders: Order[]) => {
  return orders.map((i) => ({
    symbol: i.symbol,
    clientOrderId: i.clientOrderId,
    price: i.price,
    qty: i.qty,
    status: i.status,
    side: i.side,
    type: i.type,
    time: i.time,
  }));
};
