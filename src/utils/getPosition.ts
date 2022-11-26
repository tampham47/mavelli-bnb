import { orderBy } from 'lodash';

import BalanceFactory from '../factory/BalanceFactory';
import { getAssetBySymbol } from './symbol';
import { strategies } from '../strategies';
import { client } from '../client';
import { getChangeByDelta, getPriceByDelta } from './number';
import { Position } from '../types/Position';
import { Order } from '../types/Order';

export const getPosition = async (
  symbol: string,
): Promise<Position | undefined> => {
  console.log(
    'getPosition',
    getAssetBySymbol(symbol),
    BalanceFactory.get(getAssetBySymbol(symbol)),
  );

  const strategy = strategies.find((i) => i.symbol === symbol);
  if (!strategy) {
    return undefined;
  }

  const tradeList = await client.allOrders({
    symbol,
    limit: 500,
  });

  const trades = orderBy(
    tradeList.filter((i) => i.status === 'FILLED'),
    ['time'],
    ['desc'],
  ).map((i) => {
    const price = parseFloat(i.price);
    const quoteQty = parseFloat(i.cummulativeQuoteQty);
    const qty = parseFloat(i.origQty);
    const actualPrice = price
      ? price
      : Math.round((quoteQty / qty) * 100) / 100;

    return {
      ...i,
      price: actualPrice,
      qty,
    };
  }) as Order[];

  const buyOrders = trades.filter((i) => i.side === 'BUY');

  const quantity = BalanceFactory.get(getAssetBySymbol(symbol));
  let price = 0;
  let total = 0;

  if (quantity > 0) {
    // normal case
    for (let i = 0; i < buyOrders.length; i++) {
      const item = buyOrders[i];

      if (total >= quantity) {
        break;
      }

      price += item.price * item.qty;
      total += item.qty;
    }
  }

  const avgPrice = quantity
    ? Math.round((price / total) * Math.pow(10, strategy.ticksize)) /
      Math.pow(10, strategy.ticksize)
    : 0;

  return {
    symbol,
    quantity: Math.floor(quantity * Math.pow(10, 4)) / Math.pow(10, 4),
    avgPrice,
    tp: strategy.tp,
    tpPrice: getPriceByDelta(avgPrice, strategy.tp, strategy.ticksize),
    expectedPnl: getChangeByDelta(quantity * avgPrice, strategy.tp),
    valid: true,
  };
};
