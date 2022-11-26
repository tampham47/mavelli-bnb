export const getChangeByDelta = (number: number, delta: number) => {
  return Math.round(number * delta) / 100;
};

export const getPriceByDelta = (price: number, delta: number, tickSize = 4) => {
  return (
    Math.round(((price * (100 + delta)) / 100) * Math.pow(10, tickSize)) /
    Math.pow(10, tickSize)
  );
};

export const matchExpectedPrice = (
  price: number,
  avgPrice: number,
  delta: number,
  tickSize = 4,
) => {
  const expectedPrice = getPriceByDelta(avgPrice, delta, tickSize);
  return price >= expectedPrice;
};
