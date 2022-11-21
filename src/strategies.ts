type Strategy = {
  symbol: string;
  qty: number;
  delta: number;
  tp: number;
  ticksize: number;
};

const delta = 1.85;
const qtyDelta = 1;
const tpDelta = 10;

export const strategies: Strategy[] = [
  // {
  //   symbol: 'BTCUSDT',
  //   delta: -1.25 * delta,
  //   qty: 0.005 * qtyDelta,
  //   tp: 2.5 * tpDelta,
  //   ticksize: 2,
  // },
  // {
  //   symbol: 'ETHUSDT',
  //   delta: -1.55 * delta,
  //   qty: 0.07 * qtyDelta,
  //   tp: 2.5 * tpDelta,
  //   ticksize: 2,
  // },
  // {
  //   symbol: 'BNBUSDT',
  //   delta: -2.45 * delta,
  //   qty: 0.3 * qtyDelta,
  //   tp: 2.5 * tpDelta,
  //   ticksize: 1,
  // },
  {
    symbol: 'SOLUSDT',
    delta: -2.75 * delta,
    qty: 7.5 * qtyDelta,
    tp: 2.5 * tpDelta,
    ticksize: 2,
  },
  {
    symbol: 'SRMUSDT',
    delta: -5.55 * delta,
    qty: 440 * qtyDelta,
    tp: 15.25,
    ticksize: 4,
  },
  {
    symbol: 'DYDXUSDT',
    delta: -2.95 * delta,
    qty: 50 * qtyDelta,
    tp: 15.25,
    ticksize: 4,
  },
];
