import type { Address } from 'viem'

export type Erc20TokenConfig = {
  address: Address
  decimals: number
  symbol: string
}

// 常用链的 USDC 配置；缺少条目的链会显示“暂不支持”
export const USDC_BY_CHAIN: Record<number, Erc20TokenConfig> = {
  1: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC',
  },
  10: {
    address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    decimals: 6,
    symbol: 'USDC',
  },
  42161: {
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
    symbol: 'USDC',
  },
  8453: {
    address: '0x833589fCd6d999F251aF6CC12B9c8f0d094B6760',
    decimals: 6,
    symbol: 'USDC',
  },
}

// 常用链的 USDT 配置
export const USDT_BY_CHAIN: Record<number, Erc20TokenConfig> = {
  1: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
  },
  10: {
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    decimals: 6,
    symbol: 'USDT',
  },
  42161: {
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    decimals: 6,
    symbol: 'USDT',
  },
}
