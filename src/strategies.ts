export type Strategy = {
  symbol: string;
  qty: number;
  buyPrice: number;
  takeProfit: number;
  tickSize: number;
  active: boolean;
};

export const defaultValue: Strategy = {
  symbol: '',
  buyPrice: -2.25,
  takeProfit: 3.25,
  qty: 0.1,
  tickSize: 2,
  active: false,
};
