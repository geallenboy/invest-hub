'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import type { Address, Hash } from 'viem'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export type TransactionRecord = {
  hash: Hash
  tokenSymbol: string
  amount: string
  recipient: Address
  status: TransactionStatus
  submittedAt: number
  errorMessage?: string
  confirmations?: number
  nonce?: number
}

type TransactionHistoryContextValue = {
  records: TransactionRecord[]
  addTransaction: (record: TransactionRecord) => void
  updateTransaction: (hash: Hash, updates: Partial<TransactionRecord>) => void
}

const TransactionHistoryContext = createContext<TransactionHistoryContextValue | null>(null)

export function TransactionHistoryProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<TransactionRecord[]>([])

  const addTransaction = useCallback((record: TransactionRecord) => {
    setRecords((previous) => [record, ...previous].slice(0, 20))
  }, [])

  const updateTransaction = useCallback((hash: Hash, updates: Partial<TransactionRecord>) => {
    setRecords((previous) =>
      previous.map((item) => (item.hash === hash ? { ...item, ...updates } : item))
    )
  }, [])

  const value = useMemo(
    () => ({
      records,
      addTransaction,
      updateTransaction,
    }),
    [records, addTransaction, updateTransaction]
  )

  return <TransactionHistoryContext.Provider value={value}>{children}</TransactionHistoryContext.Provider>
}

export function useTransactionHistory() {
  const context = useContext(TransactionHistoryContext)

  if (!context) {
    throw new Error('useTransactionHistory 必须在 TransactionHistoryProvider 内使用')
  }

  return context
}
