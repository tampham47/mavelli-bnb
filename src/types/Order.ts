export type OrderRaw = {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  cummulativeQuoteQty: string;
  executedQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  isWorking: boolean;
};

export type Order = {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: number;
  qty: number;
  cummulativeQuoteQty: string;
  executedQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice: string;
  icebergQty: string;
  time: number;
  isWorking: boolean;
};
