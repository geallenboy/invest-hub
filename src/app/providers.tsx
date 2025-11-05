'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig, CHAINS } from '@/lib/wagmi'
import { ReactNode, useState } from 'react'
import { TransactionHistoryProvider } from '@/components/wallet/TransactionHistoryContext'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider
          theme={darkTheme({ borderRadius: 'large' })}
          modalSize="compact"
          locale="zh-CN"
          initialChain={CHAINS[1]} // 默认 Base
        >
          <TransactionHistoryProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TransactionHistoryProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
