import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from 'wagmi'
import { erc20Abi, isAddress } from 'viem'
import { arcTestnet } from 'viem/chains'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, Loader2, CheckCircle2, XCircle, ExternalLink, ChevronDown } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor, parseAmount } from '@/onchain-money'
import { parseOnchainError } from './utils'
import { toast } from 'sonner'

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

const spectral = 'linear-gradient(90deg, #6e9ef5 0%, #a78bfa 33%, #f9a8d4 66%, #fcd34d 100%)'

const QUICK_AMOUNTS = ['1', '5', '10', '25']

export default function SendPayment() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [showMemo, setShowMemo] = useState(false)

  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID
  const recipientValid = isAddress(recipient)
  const amountNum = parseFloat(amount)
  const amountValid = amount.length > 0 && !isNaN(amountNum) && amountNum > 0

  const { data: rawBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address },
  })

  const formattedBalance =
    rawBalance != null
      ? Amount.fromRaw(rawBalance, usdcDecimalsFor(ARC_CHAIN_ID)).toFixed(2)
      : null

  const ready = isConnected && !wrongChain && recipientValid && amountValid && !isPending && !isConfirming

  const handleSend = () => {
    if (wrongChain) {
      switchChain({ chainId: ARC_CHAIN_ID })
      return
    }
    if (!ready) return
    try {
      const parsed = parseAmount(ARC_CHAIN_ID, amount)
      writeContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipient, parsed.raw],
        chainId: ARC_CHAIN_ID,
      })
    } catch (e) {
      toast.error(parseOnchainError(e))
    }
  }

  const handleReset = () => {
    reset()
    setAmount('')
    setRecipient('')
    setMemo('')
  }

  const txUrl: string | undefined = hash ? buildTxExplorerUrl(ARC_CHAIN_ID, hash) : undefined

  return (
    <div className="space-y-4">
      <section className="rounded-3xl p-5" style={glass.card}>
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(18,45,69,0.07)' }}
          >
            <Send className="size-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Send USDC
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Instant transfer on Arc Testnet
            </p>
          </div>
          <div className="ml-auto">
            <TokenUSDC variant="branded" size={28} />
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4 rounded-2xl p-4" style={glass.inner}>
          <div className="flex items-center gap-2">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v)
              }}
              placeholder="0.00"
              className="display min-w-0 flex-1 bg-transparent text-4xl font-bold tabular-nums outline-none placeholder:text-slate-300"
              style={{ color: 'var(--ink)' }}
            />
            <span className="text-lg font-semibold" style={{ color: 'var(--subtle)' }}>
              USDC
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1.5">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(q)}
                  className="rounded-lg px-2 py-0.5 text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    background: amount === q ? 'var(--accent)' : 'rgba(18,45,69,0.06)',
                    color: amount === q ? '#fff' : 'var(--ink-2)',
                  }}
                >
                  ${q}
                </button>
              ))}
            </div>
            {formattedBalance && (
              <button
                onClick={() => setAmount(formattedBalance)}
                className="text-xs font-semibold"
                style={{ color: 'var(--accent-hover)' }}
              >
                Max: {formattedBalance} USDC
              </button>
            )}
          </div>
        </div>

        {/* Recipient Input */}
        <div className="mb-3 rounded-2xl p-4" style={glass.inner}>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            RECIPIENT ADDRESS
          </label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder="0x..."
            className="mono w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
            style={{ color: recipientValid ? 'var(--ink)' : recipient.length > 0 ? 'var(--danger)' : 'var(--ink)' }}
          />
          {recipient.length > 0 && !recipientValid && (
            <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
              Invalid address
            </p>
          )}
        </div>

        {/* Memo Toggle */}
        <button
          onClick={() => setShowMemo((v) => !v)}
          className="mb-3 flex w-full items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--muted)' }}
        >
          <ChevronDown
            className="size-3.5 transition-transform"
            style={{ transform: showMemo ? 'rotate(180deg)' : 'none' }}
          />
          {showMemo ? 'Hide memo' : 'Add memo (optional)'}
        </button>

        <AnimatePresence>
          {showMemo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="rounded-2xl p-4" style={glass.inner}>
                <input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                  style={{ color: 'var(--ink)' }}
                  maxLength={100}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <button
          disabled={!ready && !wrongChain}
          onClick={handleSend}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          {!isConnected
            ? 'Connect Wallet'
            : wrongChain
            ? 'Switch to Arc Testnet'
            : isPending
            ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Confirm in wallet...</span>
            : isConfirming
            ? <span className="flex items-center justify-center gap-2"><Loader2 className="size-4 animate-spin" /> Confirming...</span>
            : `Send ${amount ? `$${amount} ` : ''}USDC`}
        </button>

        {/* Receipt */}
        <AnimatePresence>
          {isSuccess && txUrl && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-2xl p-4"
              style={{ background: 'rgba(26,128,71,0.08)', border: '1px solid rgba(26,128,71,0.18)' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" style={{ color: 'var(--success)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                  Payment sent!
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: 'var(--accent-hover)' }}
                >
                  View on ArcScan
                  <ExternalLink className="size-3" />
                </a>
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold"
                  style={{ color: 'var(--muted)' }}
                >
                  New payment
                </button>
              </div>
            </motion.div>
          )}

          {writeError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-start gap-2 rounded-2xl p-4"
              style={{ background: 'rgba(186,43,76,0.07)', border: '1px solid rgba(186,43,76,0.15)' }}
            >
              <XCircle className="size-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>
                {parseOnchainError(writeError)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Spectral strip card hint */}
      <div className="overflow-hidden rounded-2xl" style={glass.card}>
        <div className="h-0.5" style={{ background: spectral }} />
        <div className="p-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Transactions on Arc settle in under 1 second. Gas is paid in USDC — no ETH required.
          </p>
        </div>
      </div>
    </div>
  )
}
