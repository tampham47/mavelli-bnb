export type TradeRaw = {
  eventType: string;
  eventTime: number;
  aggId: number;
  price: string;
  quantity: string;
  firstId: number;
  lastId: number;
  timestamp: number;
  symbol: string;
  isBuyerMaker: boolean;
  wasBestPrice: boolean;
};

export type Trade = {
  eventType: string;
  eventTime: number;
  aggId: number;
  price: number;
  qty: number;
  firstId: number;
  lastId: number;
  timestamp: number;
  symbol: string;
  isBuyerMaker: boolean;
  wasBestPrice: boolean;
};
