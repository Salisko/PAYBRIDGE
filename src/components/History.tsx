import { useAccount, useReadContract, useBlockNumber } from 'wagmi'
import { erc20Abi, parseAbiItem } from 'viem'
import { arcTestnet } from 'viem/chains'
import { usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { formatAddress } from './utils'

const ARC_CHAIN_ID = arcTestnet.id
const usdcFact = getUsdc(ARC_CHAIN_ID)!
const USDC_ADDRESS = usdcFact.address as `0x${string}`

const glass = {
  card: {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(18,45,69,0.10)',
    boxShadow: '0 2px 24px rgba(18,45,69,0.06)',
  } as React.CSSProperties,
  inner: {
    background: 'rgba(245,245,248,0.80)',
    border: '1px solid rgba(18,45,69,0.07)',
  } as React.CSSProperties,
}

interface TxEvent {
  hash: string
  from: string
  to: string
  amount: string
  direction: 'sent' | 'received'
  blockNumber: bigint
}

const transferAbi = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')

export default function History() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID })
  const [events, setEvents] = useState<TxEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const { data: rawBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address },
  })

  const { data: blockNumber } = useBlockNumber({ chainId: ARC_CHAIN_ID })

  const formattedBalance =
    rawBalance != null
      ? Amount.fromRaw(rawBalance, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2)
      : '0.00'

  const fetchHistory = async () => {
    if (!address || !publicClient || !blockNumber) return
    setLoading(true)
    try {
      const fromBlock = blockNumber > 200n ? blockNumber - 200n : 0n

      const [sentLogs, receivedLogs] = await Promise.all([
        publicClient.getLogs({
          address: USDC_ADDRESS,
          event: transferAbi,
          args: { from: address },
          fromBlock,
          toBlock: 'latest',
        }),
        publicClient.getLogs({
          address: USDC_ADDRESS,
          event: transferAbi,
          args: { to: address },
          fromBlock,
          toBlock: 'latest',
        }),
      ])

      const decimals = usdcDecimalsFor(ARC_CHAIN_ID)

      const allEvents: TxEvent[] = [
        ...sentLogs.map((log) => ({
          hash: log.transactionHash ?? '',
          from: (log.args.from as string) ?? '',
          to: (log.args.to as string) ?? '',
          amount: Amount.fromRaw(BigInt(String(log.args.value ?? 0)), decimals).toFixed(2),
          direction: 'sent' as const,
          blockNumber: log.blockNumber ?? 0n,
        })),
        ...receivedLogs.map((log) => ({
          hash: log.transactionHash ?? '',
          from: (log.args.from as string) ?? '',
          to: (log.args.to as string) ?? '',
          amount: Amount.fromRaw(BigInt(String(log.args.value ?? 0)), decimals).toFixed(2),
          direction: 'received' as const,
          blockNumber: log.blockNumber ?? 0n,
        })),
      ]

      const unique = allEvents
        .filter((e, i, arr) => arr.findIndex((x) => x.hash === e.hash && x.direction === e.direction) === i)
        .sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1))
        .slice(0, 20)

      setEvents(unique)
      setLastFetched(new Date())
    } catch {
      // silent — user may not have testnet activity
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address && publicClient && blockNumber) {
      void fetchHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, blockNumber?.toString()])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl p-8 text-center" style={glass.card}>
        <Clock className="size-8 opacity-30" style={{ color: 'var(--ink)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Connect your wallet to view transaction history
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <section className="rounded-3xl p-5" style={glass.card}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(107,101,128,0.10)' }}
            >
              <Clock className="size-5" style={{ color: 'var(--muted)' }} />
            </div>
            <div>
              <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                History
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Recent USDC transfers
              </p>
            </div>
          </div>
          <button
            onClick={() => { void fetchHistory() }}
            disabled={loading}
            className="flex size-8 items-center justify-center rounded-xl transition-all hover:scale-105 disabled:opacity-40"
            style={glass.inner}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-4" style={glass.inner}>
          <TokenUSDC variant="branded" size={32} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Current Balance
            </p>
            <p className="display text-2xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {formattedBalance} <span className="text-base font-semibold" style={{ color: 'var(--subtle)' }}>USDC</span>
            </p>
          </div>
        </div>

        {lastFetched && (
          <p className="mt-2 text-center text-xs" style={{ color: 'var(--subtle)' }}>
            Last updated {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </section>

      {/* Transactions */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl" style={glass.card} />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl p-8 text-center" style={glass.card}>
          <Clock className="size-7 opacity-25" style={{ color: 'var(--ink)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            No recent transactions found
          </p>
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            Transfers will appear here after your first payment
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-2">
          {events.map((tx) => (
            <a
              key={`${tx.hash}-${tx.direction}`}
              href={tx.hash ? buildTxExplorerUrl(ARC_CHAIN_ID, tx.hash) : '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.01]"
              style={glass.card}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: tx.direction === 'sent' ? 'rgba(186,43,76,0.08)' : 'rgba(26,128,71,0.08)',
                }}
              >
                {tx.direction === 'sent'
                  ? <ArrowUpRight className="size-4" style={{ color: 'var(--danger)' }} />
                  : <ArrowDownLeft className="size-4" style={{ color: 'var(--success)' }} />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {tx.direction === 'sent' ? 'Sent' : 'Received'}
                </p>
                <p className="mono truncate text-xs" style={{ color: 'var(--muted)' }}>
                  {tx.direction === 'sent' ? `To: ${formatAddress(tx.to)}` : `From: ${formatAddress(tx.from)}`}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="display text-base font-bold tabular-nums"
                  style={{ color: tx.direction === 'sent' ? 'var(--danger)' : 'var(--success)' }}
                >
                  {tx.direction === 'sent' ? '-' : '+'}{tx.amount}
                </p>
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                  USDC
                </p>
              </div>
              <ExternalLink className="size-3.5 shrink-0" style={{ color: 'var(--subtle)' }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
