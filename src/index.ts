/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { throttle } from 'lodash';

import { client } from './client';
import { Strategy } from './strategies';
import { Trade } from './types/Trade';
import BalanceFactory from './factory/BalanceFactory';
import { Mavelli } from './mavelli';
import {
  fetchStrategies,
  FirebaseStrategy,
  onDataChange,
} from './firestore/strategies';
import { mergeStrategies } from './utils/strategy';
import { getStrategyTable } from './utils/table';

dotenv.config();

// @ts-ignore
import strategies from '../strategies.json';

let AGG_STRATEGIES: Strategy[] = strategies;
const BOT: Record<string, Mavelli> = {};

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
    'R. ORDER UPDATE',
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

  if (data.orderStatus === 'CANCELED' && BOT[symbol]) {
    BOT[symbol].onCancel();
  }
};

(async () => {
  const strategyList = await fetchStrategies();
  AGG_STRATEGIES = mergeStrategies(AGG_STRATEGIES, strategyList);
  AGG_STRATEGIES.forEach((i) => {
    BOT[i.symbol] = new Mavelli(i.symbol, i);
  });

  onDataChange((list: FirebaseStrategy[]) => {
    AGG_STRATEGIES = mergeStrategies(AGG_STRATEGIES, list);
    console.log('R. STRATEGY');
    console.table(getStrategyTable(AGG_STRATEGIES));

    const updatedSymbols = list.map((i) => i.symbol).join(', ');
    AGG_STRATEGIES.filter((i) => updatedSymbols.indexOf(i.symbol) >= 0).forEach(
      (i) => {
        const symbol = i.symbol;
        if (!symbol) return;

        const newStrategy = {
          ...strategies.find((i: Strategy) => i.symbol === symbol),
          ...i,
        } as Strategy;

        if (BOT[symbol]) {
          BOT[symbol].setStrategy(newStrategy);
        } else {
          BOT[symbol] = new Mavelli(symbol, i);
        }
      },
    );
  });

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

  AGG_STRATEGIES.map(async (i: Strategy) => {
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
