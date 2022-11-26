import * as dotenv from 'dotenv';
import Binance from 'binance-api-node';

dotenv.config();

export const client = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  getTime: () => Date.now(),
});
