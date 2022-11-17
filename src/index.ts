import Binance from 'binance-api-node';
import { throttle, orderBy } from 'lodash';
import * as dotenv from 'dotenv';

import { strategies } from './strategies';
import { INTERVAL } from './config';

import { Order } from './types/Order';
import { Position } from './types/Position';
import { Trade } from './types/Trade';
import {
  getPriceByDelta,
  matchExpectedPrice,
  getChangeByDelta,
} from './utils/number';
import { getAssetBySymbol } from './utils/symbol';

dotenv.config();

const BOT_PREFIX = 'mavelli';
const POSITIONS: Record<string, Position> = {};
const LAST_PRICE: Record<string, number> = {};
const TRADE_INTERVAL: Record<string, any> = {};
const POSITION_INTERVAL: Record<string, any> = {};
const BALANCES: Record<string, number> = {};

const client = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  getTime: () => Date.now(),
});

client.time().then((time) => {
  console.log('STARTED', time);
});

const cancelAllOrders = async (symbol: string) => {
  const orders = (await client.openOrders({ symbol })) || [];
  return Promise.all([
    orders.map((i) =>
      client.cancelOrder({
        symbol,
        orderId: i.orderId,
      }),
    ),
  ]);
};

const placeTpOrder = async (symbol: string) => {
  const strategy = strategies.find((i) => i.symbol === symbol);
  if (!strategy || !LAST_PRICE || !POSITIONS[symbol].quantity) return;

  if (
    POSITIONS[symbol].valid &&
    matchExpectedPrice(
      LAST_PRICE[symbol],
      POSITIONS[symbol].avgPrice,
      strategy.tp,
    )
  ) {
    POSITIONS[symbol].valid = false;
    const order = {
      symbol,
      side: 'SELL',
      type: 'LIMIT',
      quantity: POSITIONS[symbol].quantity,
      price: LAST_PRICE[symbol],
      newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
    };

    console.log('R. PLACE TAKE PROFIT ORDER', order.quantity, 'MARKET');
    // @ts-ignore
    await client.order(order);

    // update position
    await startNewPositionSession(symbol);
  }
};

const algoTrade = async (symbol: string) => {
  console.log('R. ALGO TRADE', symbol);

  const strategy = strategies.find((i) => i.symbol === symbol);
  if (!strategy || !LAST_PRICE[symbol]) return;

  console.log('R. CANCEL OPEN ORDERS', symbol);
  await cancelAllOrders(symbol);

  const order = {
    symbol,
    side: 'BUY',
    type: 'LIMIT',
    quantity: strategy.qty,
    price: getPriceByDelta(
      LAST_PRICE[symbol],
      strategy.delta,
      strategy.ticksize,
    ),
    newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
  };

  console.log('R. PLACE ORDER', symbol, order.quantity, order.price);
  // @ts-ignore
  await client.order(order);
};

const startNewPositionSession = async (symbol: string) => {
  const t = await getPosition(symbol);
  POSITIONS[symbol] = t || POSITIONS[symbol];
  console.log('R. POSITIONS');
  console.table([...Object.values(POSITIONS)]);

  if (POSITION_INTERVAL[symbol]) {
    clearInterval(POSITION_INTERVAL[symbol]);
  }
  POSITION_INTERVAL[symbol] = setInterval(async () => {
    startNewPositionSession(symbol);
  }, INTERVAL.m10);
};

const startNewAlgoTradeSession = async (symbol: string) => {
  await algoTrade(symbol);

  if (TRADE_INTERVAL[symbol]) {
    clearInterval(TRADE_INTERVAL[symbol]);
  }

  TRADE_INTERVAL[symbol] = setInterval(async () => {
    startNewAlgoTradeSession(symbol);
  }, INTERVAL.m60);
};

const onTradeSrc = (trade: Trade) => {
  console.log('R. TRADE', trade.symbol, trade.price, trade.qty);

  const symbol = trade.symbol;
  const tmpPrice = LAST_PRICE[symbol];
  LAST_PRICE[symbol] = trade.price;

  placeTpOrder(symbol);

  if (!tmpPrice) {
    startNewAlgoTradeSession(symbol);
  }
};

const onOrderMatch = async (data: any) => {
  console.log(
    'R. ORDER MATCH',
    data.symbol,
    data.orderStatus,
    data.quantity,
    data.price,
  );

  const symbol = data.symbol;
  LAST_PRICE[symbol] = data.price;

  if (data.orderStatus === 'FILLED') {
    await startNewPositionSession(symbol);
    await startNewAlgoTradeSession(symbol);
  }
};

const getPosition = async (symbol: string): Promise<Position | undefined> => {
  console.log(
    'getPosition',
    getAssetBySymbol(symbol),
    BALANCES[getAssetBySymbol(symbol)] || 0,
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

  const quantity = BALANCES[getAssetBySymbol(symbol)] || 0;
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
    tpPercentage: strategy.tp,
    tp: getPriceByDelta(avgPrice, strategy.tp, strategy.ticksize),
    expectedPnl: getChangeByDelta(quantity * avgPrice, strategy.tp),
    valid: true,
  };
};

const updateBalance = async () => {
  const accounts = await client.accountInfo();
  const positiveAccounts = accounts.balances
    .map((i) => ({
      ...i,
      free: parseFloat(i.free),
    }))
    .filter((i) => i.free > 0 && i.asset.indexOf('LD') < 0);

  positiveAccounts.forEach((i) => {
    BALANCES[i.asset] = i.free;
  });

  console.log('R. ACCOUNTS');
  console.table(positiveAccounts);
};

(async () => {
  await updateBalance();

  client.ws.user(async (data) => {
    if (data.eventType === 'executionReport') {
      await updateBalance();
      onOrderMatch(data);
    }

    if (data.eventType === 'balanceUpdate') {
      const asset = data.asset;
      const balance = parseFloat(data.balanceDelta);
      BALANCES[asset] += balance;
      console.log('R. Balance Update', asset, BALANCES[asset]);
    }
  });

  strategies.map(async (i) => {
    await startNewPositionSession(i.symbol);
    await startNewAlgoTradeSession(i.symbol);

    const onTradeThrottle = throttle(onTradeSrc, 2000);

    client.ws.trades(i.symbol, (data: any) => {
      const trade: Trade = {
        ...data,
        price: parseFloat(data.price),
        qty: parseFloat(data.quantity),
      };

      onTradeThrottle(trade);
    });
  });
})();
