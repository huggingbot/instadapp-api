// Misc config
export const BLOCK_TIME = 2500
// export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
export const MAX_UINT256 = '999'

// Router config
export const INSTADAPP_API_VERSION = 1
export const PROTOCOL_PARAM = 'protocol'
export const USER_QUERY = 'user'

// Token info on matic mainnet
export const TOKEN = {
  matic: {
    symbol: 'MATIC',
    decimals: 18,
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  },
  wmatic: {
    symbol: 'WMATIC',
    decimals: 18,
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  },
  wbtc: {
    symbol: 'WBTC',
    decimals: 8,
    address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
  },
  weth: {
    symbol: 'WETH',
    decimals: 18,
    address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  },
  aave: {
    symbol: 'AAVE',
    decimals: 18,
    address: '0xd6df932a45c0f255f85145f286ea0b292b21c90b',
  },
  usdt: {
    symbol: 'USDT',
    decimals: 6,
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  },
  usdc: {
    symbol: 'USDC',
    decimals: 6,
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  },
  dai: {
    symbol: 'DAI',
    decimals: 18,
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  },
  inst: {
    symbol: 'INST',
    decimals: 18,
    address: '0xf50D05A1402d0adAfA880D36050736f9f6ee7dee',
  },
  amWmatic: {
    symbol: 'amWMATIC',
    decimals: 8,
    address: '0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4',
  },
  amWbtc: {
    symbol: 'amWBTC',
    decimals: 8,
    address: '0x5c2ed810328349100a66b82b78a1791b101c9d61',
  },
  amWeth: {
    symbol: 'amWETH',
    decimals: 18,
    address: '0x28424507fefb6f7f8e9d3860f56504e4e5f5f390',
  },
  amAave: {
    symbol: 'amAAVE',
    decimals: 18,
    address: '0x1d2a0e5ec8e5bbdca5cb219e649b565d8e5c3360',
  },
  amUsdt: {
    symbol: 'amUSDT',
    decimals: 6,
    address: '0x60d55f02a771d515e077c9c2403a1ef324885cec',
  },
  amUsdc: {
    symbol: 'amUSDC',
    decimals: 6,
    address: '0x1a13f4ca1d028320a707d99520abfefca3998b7f',
  },
  amDai: {
    symbol: 'amDAI',
    decimals: 18,
    address: '0x27f8d03b3a2196956ed754badc28d73be8830a6e',
  },
} as const

// Instadapp config
const SLIPPAGE = 2 // 2%
export const PROTOCOL = {
  aave: {
    connector: {
      base: 'AAVE-V2-A',
      instapoolA: 'INSTAPOOL-A',
      paraswapA: 'PARASWAP-A',
    },
  },
  compound: {
    connector: {
      base: 'AAVE-V2-A',
      instapoolA: 'INSTAPOOL-A',
      paraswapA: 'PARASWAP-A',
    },
  },
} as const

export const getInstadappQuoteUrl = (
  buyToken: string,
  sellToken: string,
  sellAmount: string | number,
  slippage = SLIPPAGE
) =>
  `https://api.instadapp.io/defi/polygon/paraswap/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&maxSlippage=${slippage}&fee=0`

export const INSTADAPP_PRICE_URL = 'https://api.instadapp.io/defi/polygon/prices'
export const INSTADAPP_AAVE_POSITION_URL = 'https://api.instadapp.io/defi/polygon/aave/v2/position'
