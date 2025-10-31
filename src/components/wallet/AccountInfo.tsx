'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import Card from '@/components/ui/Card'

export default function AccountInfo() {
  const { address, status, chainId: connectedChainId } = useAccount()
  const chainId = useChainId() || connectedChainId
  const { data: balance } = useBalance({ address, chainId, query: { enabled: Boolean(address) } })

  return (
    <Card title="账户信息">
      {status === 'connected' ? (
        <div className="grid gap-2 text-sm">
          <div className="opacity-80">
            地址：<span className="font-mono">{address}</span>
          </div>
          <div className="opacity-80">链 ID：{chainId}</div>
          <div className="opacity-80">
            余额：{balance?.formatted} {balance?.symbol}
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-400">请先连接钱包</p>
      )}
    </Card>
  )
}
