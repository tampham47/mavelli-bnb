type Strategy = {
  symbol: string;
  qty: number;
  delta: number;
  tp: number;
  ticksize: number;
};

const delta = 1.85;
const tpDelta = 10;
const qtyDelta = 1;

export const strategies: Strategy[] = [
  {
    symbol: 'BTCUSDT',
    delta: -1.25 * delta,
    qty: 0.005 * qtyDelta,
    tp: 2.5 * tpDelta,
    ticksize: 2,
  },
  {
    symbol: 'ETHUSDT',
    delta: -1.55 * delta,
    qty: 0.07 * qtyDelta,
    tp: 2.5 * tpDelta,
    ticksize: 2,
  },
  {
    symbol: 'BNBUSDT',
    delta: -2.45 * delta,
    qty: 0.3 * qtyDelta,
    tp: 2.5 * tpDelta,
    ticksize: 1,
  },
  {
    symbol: 'SOLUSDT',
    delta: -3.55 * delta,
    qty: 3.5 * qtyDelta,
    tp: 2.5 * tpDelta,
    ticksize: 2,
  },
  {
    symbol: 'SRMUSDT',
    delta: -5.55 * delta,
    qty: 300 * qtyDelta,
    tp: 12.5,
    ticksize: 4,
  },
];
