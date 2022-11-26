/* eslint-disable no-console */
import { client as clientSrc } from '../client';

class BalanceFactory {
  client;
  balances: Record<string, number> = {};

  constructor() {
    this.client = clientSrc;
  }

  sync = async () => {
    const accounts = await this.client.accountInfo();
    const positiveAccounts = accounts.balances
      .map((i) => ({
        ...i,
        free: parseFloat(i.free),
      }))
      .filter((i) => i.free > 0 && i.asset.indexOf('LD') < 0);

    positiveAccounts.forEach((i) => {
      this.balances[i.asset] = i.free;
    });
  };

  get = (asset: string) => {
    return this.balances[asset] || 0;
  };

  set = (asset: string, value: number) => {
    this.balances[asset] = value;
  };

  print = () => {
    console.log('R. ACCOUNTS');
    console.table(
      Object.keys(this.balances).map((i) => ({
        asset: i,
        balance: this.balances[i],
      })),
    );
  };
}

export default new BalanceFactory();
