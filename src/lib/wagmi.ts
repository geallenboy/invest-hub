import { http } from 'wagmi'
import { mainnet, base, arbitrum, optimism, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const CHAINS = [mainnet, base, arbitrum, optimism, sepolia] as const

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  // 在开发环境提示；生产环境请在部署平台里配置变量

  console.warn('\n[warn] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 缺失，将影响移动端钱包连接。\n')
}

export const wagmiConfig = getDefaultConfig({
  appName: 'invest-hub',
  projectId,
  chains: CHAINS,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
})
