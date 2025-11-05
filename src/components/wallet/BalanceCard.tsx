'use client'

import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { erc20Abi, formatUnits } from 'viem'
import { getBalance, readContract } from 'viem/actions'
import Card from '@/components/ui/Card'
import { USDC_BY_CHAIN, USDT_BY_CHAIN } from '@/components/wallet/tokenConfig'

export default function BalanceCard() {
  const { address, status } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId })

  const nativeSymbol = publicClient?.chain?.nativeCurrency.symbol ?? 'ETH'
  const nativeDecimals = publicClient?.chain?.nativeCurrency.decimals ?? 18
  const usdcConfig = chainId ? USDC_BY_CHAIN[chainId] : undefined
  const usdtConfig = chainId ? USDT_BY_CHAIN[chainId] : undefined

  const {
    data: nativeBalance,
    isLoading: isNativeLoading,
    error: nativeError,
  } = useQuery<bigint, Error>({
    // 使用公共客户端直接调用 viem `getBalance` 读取原生资产
    queryKey: ['native-balance', address, chainId],
    enabled: Boolean(address && publicClient),
    refetchInterval: 20000,
    queryFn: async () => {
      if (!publicClient || !address) {
        throw new Error('Wallet not connected')
      }

      return getBalance(publicClient, { address })
    },
  })

  const {
    data: usdcBalance,
    isLoading: isUsdcLoading,
    error: usdcError,
  } = useQuery<bigint, Error>({
    // 通过通用 ERC20 `balanceOf` 读取 USDC
    queryKey: ['usdc-balance', address, chainId],
    enabled: Boolean(address && publicClient && usdcConfig),
    refetchInterval: 20000,
    queryFn: async () => {
      if (!publicClient || !address || !usdcConfig) {
        throw new Error('Token balance prerequisites missing')
      }

      return readContract(publicClient, {
        abi: erc20Abi,
        address: usdcConfig.address,
        functionName: 'balanceOf',
        args: [address],
      })
    },
  })

  const {
    data: usdtBalance,
    isLoading: isUsdtLoading,
    error: usdtError,
  } = useQuery<bigint, Error>({
    // 同理读取 USDT
    queryKey: ['usdt-balance', address, chainId],
    enabled: Boolean(address && publicClient && usdtConfig),
    refetchInterval: 20000,
    queryFn: async () => {
      if (!publicClient || !address || !usdtConfig) {
        throw new Error('Token balance prerequisites missing')
      }

      return readContract(publicClient, {
        abi: erc20Abi,
        address: usdtConfig.address,
        functionName: 'balanceOf',
        args: [address],
      })
    },
  })

  const renderRow = ({
    label,
    loading,
    error,
    value,
    unsupported,
  }: {
    label: string
    loading: boolean
    error: Error | null
    value?: string
    unsupported?: boolean
  }) => (
    <div className="flex items-center justify-between rounded-xl bg-neutral-900/80 p-4">
      <div className="font-medium opacity-80">{label}</div>
      <div className="font-mono text-base">
        {unsupported
          ? '当前链暂不支持'
          : loading
          ? '加载中...'
          : error
          ? '获取失败'
          : value ?? '0'}
      </div>
    </div>
  )

  return (
    <Card title="余额概览">
      {status !== 'connected' ? (
        <p className="text-sm text-neutral-400">请先连接钱包以加载余额</p>
      ) : (
        <div className="grid gap-2 text-sm">
          {renderRow({
            label: `${nativeSymbol} 余额`,
            loading: isNativeLoading,
            error: nativeError ?? null,
            value: `${formatUnits(nativeBalance ?? BigInt(0), nativeDecimals)} ${nativeSymbol}`,
          })}

          {renderRow({
            label: 'USDC 余额',
            loading: Boolean(usdcConfig) && isUsdcLoading,
            error: (usdcError as Error | null) ?? null,
            unsupported: !usdcConfig,
            value:
              usdcConfig && usdcBalance !== undefined
                ? `${formatUnits(usdcBalance, usdcConfig.decimals)} ${usdcConfig.symbol}`
                : undefined,
          })}

          {renderRow({
            label: 'USDT 余额',
            loading: Boolean(usdtConfig) && isUsdtLoading,
            error: (usdtError as Error | null) ?? null,
            unsupported: !usdtConfig,
            value:
              usdtConfig && usdtBalance !== undefined
                ? `${formatUnits(usdtBalance, usdtConfig.decimals)} ${usdtConfig.symbol}`
                : undefined,
          })}
        </div>
      )}
    </Card>
  )
}
