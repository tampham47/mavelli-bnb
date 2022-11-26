/* eslint-disable no-console */
import { throttle } from 'lodash';

import { strategies } from './strategies';
import { Trade } from './types/Trade';
import { client } from './client';
import BalanceFactory from './factory/BalanceFactory';
import { Mavelli } from './mavelli';

const BOT: Record<string, Mavelli> = {};

strategies.map((i) => {
  BOT[i.symbol] = new Mavelli(i.symbol, i);
});

client.time().then((time) => {
  console.log('STARTED', time);
});

const onLastPrice = (trade: Trade) => {
  console.log('R. TRADE', trade.symbol, trade.price, trade.qty);

  const symbol = trade.symbol;
  const price = trade.price;

  if (BOT[symbol]) {
    BOT[symbol].onLastPrice(price);
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
  const price = data.price;

  if (data.orderStatus === 'FILLED' && BOT[symbol]) {
    BOT[symbol].onOrderMatch(price);
  }
};

(async () => {
  await BalanceFactory.sync();

  client.ws.user(async (data) => {
    if (data.eventType === 'executionReport') {
      await BalanceFactory.sync();
      onOrderMatch(data);
    }

    if (data.eventType === 'balanceUpdate') {
      const asset = data.asset;
      const balance = parseFloat(data.balanceDelta);
      BalanceFactory.set(asset, BalanceFactory.get(asset) + balance);
      console.log('R. Balance Update', asset, BalanceFactory.get(asset));
    }
  });

  strategies.map(async (i) => {
    const onTradeThrottle = throttle(onLastPrice, 2000);

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
