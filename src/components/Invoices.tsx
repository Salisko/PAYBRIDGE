import { useState } from 'react'
import { useAccount } from 'wagmi'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Copy, CheckCheck, Sparkles, Plus, X, ChevronRight } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { toast } from 'sonner'
import { formatAddress } from './utils'

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

interface Invoice {
  id: string
  client: string
  amount: string
  memo: string
  status: 'pending' | 'paid'
  date: string
}

const AI_TEMPLATES = [
  { label: 'Freelance Design', amount: '250', memo: 'Logo & brand identity design services' },
  { label: 'Development Work', amount: '500', memo: 'Full-stack feature implementation — 10 hrs' },
  { label: 'Consulting', amount: '150', memo: 'Strategy consulting session — 2 hrs @ $75/hr' },
  { label: 'Content Writing', amount: '80', memo: 'Blog article — 1500 words' },
]

export default function Invoices() {
  const { address } = useAccount()
  const [showCreate, setShowCreate] = useState(false)
  const [clientAddr, setClientAddr] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const paymentLink = clientAddr && amount
    ? `${window.location.origin}?to=${address}&amount=${amount}&memo=${encodeURIComponent(memo)}`
    : ''

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      toast.success('Link copied!')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleApplyTemplate = (tmpl: { amount: string; memo: string }) => {
    setAmount(tmpl.amount)
    setMemo(tmpl.memo)
  }

  const handleCreate = () => {
    if (!amount || !memo) return
    const inv: Invoice = {
      id: Math.random().toString(36).slice(2, 9),
      client: clientAddr || 'Open Link',
      amount,
      memo,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
    setInvoices((prev) => [inv, ...prev])
    setShowCreate(false)
    setClientAddr('')
    setAmount('')
    setMemo('')
    toast.success('Invoice created!')
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <section className="rounded-3xl p-5" style={glass.card}>
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(124,92,46,0.10)' }}
          >
            <FileText className="size-5" style={{ color: '#7c5c2e' }} />
          </div>
          <div>
            <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Invoices
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              AI-generated payment requests
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="size-3.5" />
            New
          </button>
        </div>

        {/* AI Templates */}
        <div className="mb-1">
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3.5" style={{ color: '#1061a6' }} />
            <span className="text-xs font-semibold" style={{ color: '#1061a6' }}>
              AI Templates
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AI_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                onClick={() => { setShowCreate(true); handleApplyTemplate(tmpl) }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all hover:scale-[1.02]"
                style={glass.inner}
              >
                <span className="text-xs font-medium" style={{ color: 'var(--ink-2)' }}>
                  {tmpl.label}
                </span>
                <ChevronRight className="size-3 shrink-0" style={{ color: 'var(--subtle)' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Invoice List */}
      {invoices.length > 0 && (
        <section className="space-y-2">
          {invoices.map((inv) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={glass.card}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        background: inv.status === 'paid' ? 'rgba(26,128,71,0.10)' : 'rgba(124,92,46,0.10)',
                        color: inv.status === 'paid' ? 'var(--success)' : '#7c5c2e',
                      }}
                    >
                      {inv.status}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {inv.date}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    {inv.memo}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--subtle)' }}>
                    {inv.client === 'Open Link' ? 'Open payment link' : `To: ${formatAddress(inv.client)}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TokenUSDC variant="branded" size={14} />
                    <span className="display text-lg font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                      {inv.amount}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(
                      `${window.location.origin}?to=${address}&amount=${inv.amount}&memo=${encodeURIComponent(inv.memo)}`,
                      inv.id
                    )}
                    className="mt-1 flex items-center gap-1 text-xs font-medium"
                    style={{ color: 'var(--accent-hover)' }}
                  >
                    {copiedId === inv.id ? (
                      <><CheckCheck className="size-3" /> Copied</>
                    ) : (
                      <><Copy className="size-3" /> Copy link</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {invoices.length === 0 && !showCreate && (
        <div
          className="flex flex-col items-center gap-2 rounded-2xl p-8 text-center"
          style={glass.card}
        >
          <FileText className="size-8 opacity-30" style={{ color: 'var(--ink)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
            No invoices yet
          </p>
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            Click "New" or pick an AI template to create your first invoice
          </p>
        </div>
      )}

      {/* Create Invoice Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.section
              className="relative w-full max-w-md overflow-hidden rounded-t-3xl"
              style={{
                background: 'rgba(255,255,255,0.94)',
                backdropFilter: 'blur(40px) saturate(200%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="h-1"
                style={{ background: 'linear-gradient(90deg, #6e9ef5 0%, #a78bfa 33%, #f9a8d4 66%, #fcd34d 100%)' }}
              />
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-black/10" />
              </div>
              <div className="px-5 pb-8 pt-3">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                    New Invoice
                  </h3>
                  <button onClick={() => setShowCreate(false)}>
                    <X className="size-5" style={{ color: 'var(--subtle)' }} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl p-4" style={glass.inner}>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                      AMOUNT (USDC)
                    </label>
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => { const v = e.target.value.replace(/[^0-9.]/g, ''); if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v) }}
                      placeholder="0.00"
                      className="display w-full bg-transparent text-3xl font-bold tabular-nums outline-none placeholder:text-slate-300"
                      style={{ color: 'var(--ink)' }}
                    />
                  </div>

                  <div className="rounded-2xl p-4" style={glass.inner}>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                      DESCRIPTION
                    </label>
                    <input
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="What are you billing for?"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                      style={{ color: 'var(--ink)' }}
                    />
                  </div>

                  <div className="rounded-2xl p-4" style={glass.inner}>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                      CLIENT ADDRESS (OPTIONAL)
                    </label>
                    <input
                      value={clientAddr}
                      onChange={(e) => setClientAddr(e.target.value.trim())}
                      placeholder="0x... (leave blank for open link)"
                      className="mono w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
                      style={{ color: 'var(--ink)' }}
                    />
                  </div>

                  {paymentLink && (
                    <div className="flex items-center gap-2 rounded-2xl p-3" style={glass.inner}>
                      <p className="mono min-w-0 flex-1 truncate text-xs" style={{ color: 'var(--muted)' }}>
                        {paymentLink}
                      </p>
                      <button onClick={() => handleCopy(paymentLink, 'preview')}>
                        {copiedId === 'preview'
                          ? <CheckCheck className="size-4" style={{ color: 'var(--success)' }} />
                          : <Copy className="size-4" style={{ color: 'var(--accent)' }} />
                        }
                      </button>
                    </div>
                  )}

                  <button
                    disabled={!amount || !memo}
                    onClick={handleCreate}
                    className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: 'var(--accent)' }}
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
