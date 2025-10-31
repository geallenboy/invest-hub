'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import AccountInfo from '@/components/wallet/AccountInfo'
import Card from '@/components/ui/Card'

export default function Page() {
  return (
    <div className="grid gap-6">
      <Card title="连接钱包">
        <div className="flex flex-wrap items-center gap-4">
          <ConnectButton chainStatus="icon" accountStatus="address" showBalance={false} />
          <p className="text-sm text-neutral-400">
            支持 Mainnet / Base / Arbitrum / Optimism / Sepolia
          </p>
        </div>
      </Card>

      <AccountInfo />
    </div>
  )
}
