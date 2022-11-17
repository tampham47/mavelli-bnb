export const getAssetBySymbol = (symbol: string) => {
  const [base] = symbol.split('USDT');
  return base;
};
