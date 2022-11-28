import { client } from './client';
import { INTERVAL } from './config';
import { Strategy } from './strategies';
import { Position } from './types/Position';
import { getPosition } from './utils/getPosition';
import { getPriceByDelta, matchExpectedPrice } from './utils/number';
import { getAssetBySymbol } from './utils/symbol';

const BOT_PREFIX = 'mavelli';

export class Mavelli {
  symbol: string;
  base: string;
  quote: string;
  strategy: Strategy;
  lastPrice = 0;
  position: Position | undefined;
  interval: NodeJS.Timer | undefined;
  blocking = false;

  constructor(symbol: string, strategy: Strategy) {
    this.symbol = symbol;
    this.strategy = strategy;
    this.quote = getAssetBySymbol(symbol);
    this.base = 'USDT';
    this.init();
  }

  setStrategy = async (strategy: Strategy) => {
    this.strategy = strategy;
    await this.getPosition();
    this.start();
  };

  getPosition = async () => {
    this.position = await getPosition(this.symbol, this.strategy);
    console.log('R. POSITION', this.symbol);
    console.table([this.position]);
  };

  init = async () => {
    await this.getPosition();
    this.start();
  };

  start = async () => {
    if (this.blocking) return;

    this.blocking = true;
    await this.placeBuyOrder();

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.start();
    }, INTERVAL.m60);

    this.blocking = false;
  };

  onCancel = async () => {
    this.lastPrice = 0;
    this.start();
  };

  onOrderMatch = async (lastPrice: number) => {
    this.lastPrice = lastPrice;
    await this.getPosition();
    this.start();
  };

  onLastPrice = (lastPrice: number) => {
    const t = this.lastPrice;
    this.lastPrice = lastPrice;

    this.placeTpOrder();

    if (!t && this.lastPrice) {
      this.start();
    }
  };

  cancelOrders = async (symbol: string) => {
    const orders = (await client.openOrders({ symbol })) || [];
    await Promise.all([
      orders.map((i) =>
        client.cancelOrder({
          symbol,
          orderId: i.orderId,
        }),
      ),
    ]);
    return orders.length;
  };

  placeTpOrder = async () => {
    if (!this.position || !this.lastPrice || !this.position.quantity) return;

    if (
      this.position.valid &&
      matchExpectedPrice(
        this.lastPrice,
        this.position.avgPrice,
        this.strategy.takeProfit,
        this.strategy.tickSize,
      )
    ) {
      this.position.valid = false;
      const order = {
        symbol: this.symbol,
        side: 'SELL',
        type: 'LIMIT',
        quantity: this.position.quantity,
        price: this.lastPrice,
        newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
      };

      console.log(
        'R. PLACE TAKE PROFIT ORDER',
        this.lastPrice,
        this.position.avgPrice,
        this.strategy.takeProfit,
        order.quantity,
      );
      // @ts-ignore
      await client.order(order);
    }
  };

  placeBuyOrder = async () => {
    if (!this.position) return;
    console.log('R. ALGO TRADE', this.symbol);
    if (!this.lastPrice) return;

    console.log('R. CANCEL OPEN ORDERS', this.symbol);
    const t = await this.cancelOrders(this.symbol);

    // wait for cancel event to trigger new orders
    if (t !== 0 || !this.strategy.active) return;

    const order = {
      symbol: this.symbol,
      side: 'BUY',
      type: 'LIMIT',
      quantity: this.strategy.qty,
      price: getPriceByDelta(
        this.lastPrice,
        this.strategy.buyPrice,
        this.strategy.tickSize,
      ),
      newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
    };

    console.log('R. PLACE ORDER', this.symbol, order.quantity, order.price);
    // @ts-ignore
    await client.order(order);
  };
}
