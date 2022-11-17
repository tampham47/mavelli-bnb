import { getPriceByDelta, matchExpectedPrice } from './number';

describe('getPriceByDelta', () => {
  it('getPriceByDelta', () => {
    expect(getPriceByDelta(100, 1)).toBe(101);
    expect(getPriceByDelta(21274.57, 1.5)).toBe(21593.69);
    expect(getPriceByDelta(21298.4, 1.5)).toBe(21617.88);

    expect(getPriceByDelta(100, -1.5)).toBe(98.5);
    expect(getPriceByDelta(21274.57, -1.5)).toBe(20955.45);
    expect(getPriceByDelta(21298.4, -1.5)).toBe(20978.92);

    expect(getPriceByDelta(1.23456, -1.5, 3)).toBe(1.216);
    expect(getPriceByDelta(12.3456, -1.5, 3)).toBe(12.16);
    expect(getPriceByDelta(123.456, -1.5, 3)).toBe(121.604);
    expect(getPriceByDelta(1234.56, -1.5, 3)).toBe(1216.042);
    expect(getPriceByDelta(12345.6, -1.5, 3)).toBe(12160.416);

    expect(getPriceByDelta(1.23456, -1.5, 4)).toBe(1.216);
    expect(getPriceByDelta(12.3456, -1.5, 4)).toBe(12.1604);
    expect(getPriceByDelta(123.456, -1.5, 4)).toBe(121.6042);
    expect(getPriceByDelta(1234.56, -1.5, 4)).toBe(1216.0416);
    expect(getPriceByDelta(12345.6, -1.5, 4)).toBe(12160.416);
  });

  it('matchExpectedPrice', () => {
    expect(matchExpectedPrice(10149, 10000, 1.5)).toBe(false);
    expect(matchExpectedPrice(10150, 10000, 1.5)).toBe(true);
  });
});
