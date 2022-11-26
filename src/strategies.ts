export type Strategy = {
  symbol: string;
  qty: number;
  delta: number;
  tp: number;
  ticksize: number;
};

export const strategies: Strategy[] = [
  // {
  //   symbol: 'BTCUSDT',
  //   delta: -1.25,
  //   qty: 0.006,
  //   tp: 2.5,
  //   ticksize: 2,
  // },
  // {
  //   symbol: 'ETHUSDT',
  //   delta: -1.55,
  //   qty: 0.09,
  //   tp: 2.5,
  //   ticksize: 2,
  // },
  // {
  //   symbol: 'SOLUSDT',
  //   delta: -2.75,
  //   qty: 8.5,
  //   tp: 2.5,
  //   ticksize: 2,
  // },
  // {
  //   symbol: 'BNBUSDT',
  //   delta: -2.45,
  //   qty: 0.39,
  //   tp: 7.5,
  //   ticksize: 1,
  // },
  {
    symbol: 'DOGEUSDT',
    delta: -3.75,
    qty: 1000,
    tp: 7.5,
    ticksize: 4,
  },
];
