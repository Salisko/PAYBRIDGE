import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { arcTestnet } from 'viem/chains'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  FileText,
  BarChart3,
  Zap,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { formatAddress } from './utils'

const ARC_CHAIN_ID = arcTestnet.id
const usdcFact = getUsdc(ARC_CHAIN_ID)!

interface DashboardProps {
  onNavigate: (view: 'send' | 'invoices' | 'history') => void
}

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
    borderRadius: 12,
  } as React.CSSProperties,
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { address, isConnected } = useAccount()

  const { data: rawBalance, isLoading: balanceLoading } = useReadContract({
    address: usdcFact.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address },
  })

  const formattedBalance =
    rawBalance != null
      ? Amount.fromRaw(rawBalance, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2)
      : '0.00'

  const actions = [
    {
      label: 'Send',
      icon: Send,
      color: 'var(--accent)',
      bg: 'rgba(18,45,69,0.07)',
      view: 'send' as const,
    },
    {
      label: 'Request',
      icon: ArrowDownLeft,
      color: '#1061a6',
      bg: 'rgba(16,97,166,0.08)',
      view: 'invoices' as const,
    },
    {
      label: 'Invoices',
      icon: FileText,
      color: '#7c5c2e',
      bg: 'rgba(124,92,46,0.08)',
      view: 'invoices' as const,
    },
    {
      label: 'History',
      icon: Clock,
      color: 'var(--muted)',
      bg: 'rgba(107,101,128,0.08)',
      view: 'history' as const,
    },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Instant Finality',
      desc: 'Sub-second confirmation on Arc',
      color: '#7c5c2e',
      bg: 'rgba(124,92,46,0.10)',
    },
    {
      icon: BarChart3,
      title: 'Stable Fees',
      desc: 'USDC gas — no ETH needed',
      color: '#1061a6',
      bg: 'rgba(16,97,166,0.10)',
    },
    {
      icon: TrendingUp,
      title: 'AI Insights',
      desc: 'Automated expense tracking',
      color: 'var(--success)',
      bg: 'rgba(26,128,71,0.10)',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Hero Balance Card */}
      <section className="rounded-3xl p-5" style={glass.card}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ background: 'rgba(26,128,71,0.10)' }}
            >
              <TrendingUp className="size-4" style={{ color: 'var(--success)' }} />
            </div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
              AVAILABLE BALANCE
            </span>
          </div>
          <TokenUSDC variant="branded" size={24} />
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="display text-5xl font-bold tabular-nums"
            style={{ color: 'var(--ink)' }}
          >
            {balanceLoading ? (
              <span className="inline-block h-10 w-32 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              formattedBalance
            )}
          </span>
          <span className="text-xl font-semibold" style={{ color: 'var(--subtle)' }}>
            USDC
          </span>
        </div>

        <p className="mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          {isConnected && address
            ? `${formatAddress(address)} · Arc Testnet`
            : 'Connect your wallet to view live balance'}
        </p>

        {isConnected && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onNavigate('send')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'var(--accent)' }}
            >
              <ArrowUpRight className="size-4" />
              Send
            </button>
            <button
              onClick={() => onNavigate('invoices')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
            >
              <FileText className="size-4" />
              Invoice
            </button>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {actions.map(({ label, icon: Icon, color, bg, view }) => (
          <button
            key={label}
            onClick={() => onNavigate(view)}
            className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={glass.card}
          >
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: bg }}
            >
              <Icon className="size-5" style={{ color }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--ink-2)' }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* AI Features */}
      <section className="rounded-2xl p-4" style={glass.card}>
        <div className="mb-3 flex items-center gap-2">
          <div
            className="flex size-6 items-center justify-center rounded-lg"
            style={{ background: 'rgba(16,97,166,0.10)' }}
          >
            <Zap className="size-3.5" style={{ color: '#1061a6' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            AI-Powered Features
          </span>
        </div>
        <div className="space-y-2">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-xl p-3"
              style={glass.inner}
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon className="size-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {title}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testnet Hint */}
      <div
        className="rounded-2xl p-3 text-center text-xs"
        style={{ background: 'rgba(16,97,166,0.06)', color: '#1061a6' }}
      >
        Running on Arc Testnet · Get free USDC via "Get test USDC" in the sidebar
      </div>
    </div>
  )
}
