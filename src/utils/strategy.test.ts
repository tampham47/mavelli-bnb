import { mergeStrategies } from './strategy';
import { defaultValue } from '../strategies';

jest.mock('../strategies', () => ({
  ...jest.requireActual('../strategies'),
  defaultValue: {
    symbol: 'BTCUSDT',
    buyPrice: -2.25,
    takeProfit: 3.25,
    qty: 0.1,
    tickSize: 2,
    active: false,
  },
}));

describe('mergeStrategies', () => {
  test('it should be accept new strategy', () => {
    const t = mergeStrategies([], [{ symbol: 'BTCUSDT' }]);

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('BTCUSDT');
  });

  test('symbols should be merged', () => {
    const t = mergeStrategies(
      [{ ...defaultValue }],
      [{ symbol: 'BTCUSDT', buyPrice: 6 }],
    );

    expect(t).toHaveLength(1);
    expect(t[0].symbol).toBe('BTCUSDT');
    expect(t[0].buyPrice).toBe(6);
  });

  test('symbols should be merged 02', () => {
    const t = mergeStrategies(
      [{ ...defaultValue }],
      [{ symbol: 'ETHUSDT', buyPrice: 6 }],
    );

    expect(t).toHaveLength(2);
    expect(t.map((i) => i.symbol).join(', ')).toBe('BTCUSDT, ETHUSDT');
  });
});
