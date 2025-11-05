'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useAccount,
  useBlockNumber,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import {
  erc20Abi,
  isAddress,
  parseUnits,
  UserRejectedRequestError,
  type Address,
  type Hash,
} from 'viem'
import Card from '@/components/ui/Card'
import { USDC_BY_CHAIN, USDT_BY_CHAIN } from '@/components/wallet/tokenConfig'
import { useTransactionHistory } from '@/components/wallet/TransactionHistoryContext'
import { toast } from 'sonner'

type TokenKey = 'native' | 'usdc' | 'usdt'

type TokenOption = {
  key: TokenKey
  symbol: string
  decimals: number
  type: 'native' | 'erc20'
  address?: Address
}

export default function TransferCard() {
  const { address, status } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId })
  const queryClient = useQueryClient()
  const { addTransaction, updateTransaction } = useTransactionHistory()

  const [tokenKey, setTokenKey] = useState<TokenKey>('native')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeHash, setActiveHash] = useState<Hash | undefined>(undefined)
  const [latestHash, setLatestHash] = useState<Hash | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { sendTransactionAsync, isPending: isSendingNative } = useSendTransaction()
  const { writeContractAsync, isPending: isSendingToken } = useWriteContract()

  const { data: receipt, isLoading: isConfirming, error: receiptError } = useWaitForTransactionReceipt({
    hash: activeHash,
    query: {
      enabled: Boolean(activeHash),
    },
  })
  const { data: currentBlock } = useBlockNumber({
    watch: Boolean(activeHash),
  })
  const { data: transactionData } = useTransaction({
    hash: activeHash,
    query: {
      enabled: Boolean(activeHash),
    },
  })

  const tokenOptions = useMemo<TokenOption[]>(() => {
    if (!publicClient || !chainId) {
      return []
    }

    const options: TokenOption[] = []

    const nativeCurrency = publicClient.chain?.nativeCurrency
    if (nativeCurrency) {
      options.push({
        key: 'native',
        symbol: nativeCurrency.symbol,
        decimals: nativeCurrency.decimals,
        type: 'native',
      })
    }

    const usdcConfig = USDC_BY_CHAIN[chainId]
    if (usdcConfig) {
      options.push({
        key: 'usdc',
        symbol: usdcConfig.symbol,
        decimals: usdcConfig.decimals,
        type: 'erc20',
        address: usdcConfig.address,
      })
    }

    const usdtConfig = USDT_BY_CHAIN[chainId]
    if (usdtConfig) {
      options.push({
        key: 'usdt',
        symbol: usdtConfig.symbol,
        decimals: usdtConfig.decimals,
        type: 'erc20',
        address: usdtConfig.address,
      })
    }

    return options
  }, [chainId, publicClient])

  const selectedToken = tokenOptions.find((token) => token.key === tokenKey)
  const explorerBaseUrl = publicClient?.chain?.blockExplorers?.default?.url

  useEffect(() => {
    if (tokenOptions.length === 0) {
      return
    }

    if (!selectedToken) {
      setTokenKey(tokenOptions[0].key)
    }
  }, [selectedToken, tokenOptions])

  const handledHashesRef = useRef<Set<Hash>>(new Set())

  useEffect(() => {
    if (!activeHash || !receipt) {
      return
    }

    if (handledHashesRef.current.has(activeHash)) {
      return
    }

    if (receipt.status === 'success') {
      handledHashesRef.current.add(activeHash)
      setSuccessMessage('转账成功，余额即将刷新')
      toast.success('交易已确认', { id: activeHash })
      queryClient.invalidateQueries({ queryKey: ['native-balance'] })
      queryClient.invalidateQueries({ queryKey: ['usdc-balance'] })
      queryClient.invalidateQueries({ queryKey: ['usdt-balance'] })
      setAmount('')
      updateTransaction(activeHash, {
        status: 'confirmed',
        errorMessage: undefined,
        confirmations: Math.max(1, receipt.confirmations ?? 1),
      })
      return
    }

    if (receipt.status === 'reverted') {
      handledHashesRef.current.add(activeHash)
      const message = '交易失败：链上回执标记为 Reverted'
      setErrorMessage(message)
      toast.error(message, { id: activeHash })
      updateTransaction(activeHash, { status: 'failed', errorMessage: message, confirmations: 0 })
    }
  }, [activeHash, queryClient, receipt, updateTransaction])

  useEffect(() => {
    if (receiptError && activeHash) {
      const message = receiptError.shortMessage ?? receiptError.message
      setErrorMessage(message)
      toast.error(message, { id: activeHash })
      updateTransaction(activeHash, { status: 'failed', errorMessage: message, confirmations: 0 })
    }
  }, [receiptError, activeHash, updateTransaction])

  useEffect(() => {
    if (!activeHash || !receipt?.blockNumber || currentBlock === undefined) {
      return
    }

    if (currentBlock < receipt.blockNumber) {
      return
    }

    const confirmations = Number(currentBlock - receipt.blockNumber + 1n)
    updateTransaction(activeHash, { confirmations })
  }, [activeHash, currentBlock, receipt?.blockNumber, updateTransaction])

  useEffect(() => {
    if (!activeHash || transactionData?.nonce === undefined) {
      return
    }

    updateTransaction(activeHash, { nonce: Number(transactionData.nonce) })
  }, [activeHash, transactionData?.nonce, updateTransaction])

  const isSubmitting = isSendingNative || isSendingToken || isConfirming

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (status !== 'connected' || !address) {
      setErrorMessage('请先连接钱包')
      return
    }

    if (!selectedToken) {
      setErrorMessage('当前链暂不支持可用代币')
      return
    }

    if (!isAddress(recipient)) {
      setErrorMessage('请输入有效的收款地址')
      return
    }

    if (!amount.trim()) {
      setErrorMessage('请输入转账数量')
      return
    }

    let value: bigint
    try {
      value = parseUnits(amount, selectedToken.decimals)
    } catch {
      setErrorMessage('金额格式错误，请检查小数位')
      return
    }

    if (value <= 0) {
      setErrorMessage('转账金额须大于 0')
      return
    }

    let pendingHash: Hash | undefined

    try {
      let hash: Hash
      if (selectedToken.type === 'native') {
        hash = await sendTransactionAsync({
          to: recipient as Address,
          value,
        })
      } else {
        if (!selectedToken.address) {
          throw new Error('缺少代币合约地址')
        }

        hash = await writeContractAsync({
          abi: erc20Abi,
          address: selectedToken.address,
          functionName: 'transfer',
          args: [recipient as Address, value],
        })
      }

      pendingHash = hash
      toast.loading('交易已提交，等待确认...', { id: hash })
      addTransaction({
        hash,
        tokenSymbol: selectedToken.symbol,
        amount,
        recipient: recipient as Address,
        status: 'pending',
        submittedAt: Date.now(),
        confirmations: 0,
      })
      setActiveHash(hash)
      setLatestHash(hash)
    } catch (error) {
      if (error instanceof UserRejectedRequestError) {
        setErrorMessage('用户取消了交易签名')
        toast.info('已取消交易签名')
        return
      }

      const message =
        (error as { shortMessage?: string; message?: string })?.shortMessage ||
        (error as Error).message ||
        '发送交易失败'

      setErrorMessage(message)
      if (pendingHash) {
        toast.error(message, { id: pendingHash })
        updateTransaction(pendingHash, { status: 'failed', errorMessage: message, confirmations: 0 })
      } else {
        toast.error(message)
      }
    }
  }

  return (
    <Card title="资产转账">
      {status !== 'connected' ? (
        <p className="text-sm text-neutral-400">请连接钱包后再尝试转账</p>
      ) : tokenOptions.length === 0 ? (
        <p className="text-sm text-neutral-400">当前链暂无可用代币配置</p>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">收款地址</span>
            <input
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm outline-none transition focus:border-neutral-200"
              placeholder="0x..."
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="opacity-80">选择代币</span>
              <select
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm outline-none transition focus:border-neutral-200"
                value={selectedToken?.key ?? ''}
                onChange={(event) => setTokenKey(event.target.value as TokenKey)}
              >
                {tokenOptions.map((token) => (
                  <option key={token.key} value={token.key}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="opacity-80">转账数量</span>
              <input
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm outline-none transition focus:border-neutral-200"
                placeholder={`请输入 ${selectedToken?.symbol ?? ''} 数量`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '发起转账'}
          </button>

          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

          {latestHash && (
            <p className="text-xs text-neutral-400">
              交易哈希：{' '}
              {explorerBaseUrl ? (
                <a
                  className="text-neutral-100 underline underline-offset-4"
                  href={`${explorerBaseUrl}/tx/${latestHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {latestHash}
                </a>
              ) : (
                latestHash
              )}
            </p>
          )}

          {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}

          {isConfirming && <p className="text-xs text-neutral-400">等待链上确认...</p>}
        </form>
      )}
    </Card>
  )
}
