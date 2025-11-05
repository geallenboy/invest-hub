'use client'

import { usePublicClient } from 'wagmi'
import Card from '@/components/ui/Card'
import { useTransactionHistory } from '@/components/wallet/TransactionHistoryContext'

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: '待确认', className: 'text-amber-400' },
  confirmed: { text: '已确认', className: 'text-emerald-400' },
  failed: { text: '失败', className: 'text-rose-400' },
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function TransactionHistoryCard() {
  const { records } = useTransactionHistory()
  const publicClient = usePublicClient()
  const explorerBaseUrl = publicClient?.chain?.blockExplorers?.default?.url

  return (
    <Card title="交易历史">
      {records.length === 0 ? (
        <p className="text-sm text-neutral-400">暂无链上交易记录；以下列表将展示本会话内的转账提交。</p>
      ) : (
        <ul className="grid gap-3 text-sm">
          {records.map((record) => {
            const statusMeta = STATUS_LABEL[record.status]
            const submittedAt = new Date(record.submittedAt)
            const formattedTime = submittedAt.toLocaleString()

            return (
              <li
                key={record.hash}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition hover:border-neutral-200/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-neutral-100">
                    {record.amount} {record.tokenSymbol}
                  </span>
                  <span className={`text-xs uppercase ${statusMeta.className}`}>{statusMeta.text}</span>
                </div>
                <div className="mt-2 text-xs text-neutral-400">
                  <div>收款地址：{shortenAddress(record.recipient)}</div>
                  <div>提交时间：{formattedTime}</div>
                  <div>确认次数：{record.confirmations ?? (record.status === 'pending' ? 0 : 'N/A')}</div>
                  {record.nonce !== undefined && <div>交易 Nonce：{record.nonce}</div>}
                  <div>
                    交易哈希：{' '}
                    {explorerBaseUrl ? (
                      <a
                        className="text-neutral-100 underline underline-offset-4"
                        href={`${explorerBaseUrl}/tx/${record.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {record.hash}
                      </a>
                    ) : (
                      record.hash
                    )}
                  </div>
                  {record.errorMessage && (
                    <div className="mt-1 text-rose-400">错误：{record.errorMessage}</div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
