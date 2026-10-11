import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { LayoutDashboard, Send, FileText, Clock, Zap } from 'lucide-react'
import Dashboard from './components/Dashboard'
import SendPayment from './components/SendPayment'
import Invoices from './components/Invoices'
import History from './components/History'

type View = 'dashboard' | 'send' | 'invoices' | 'history'

const NAV = [
  { id: 'dashboard' as View, label: 'Home', Icon: LayoutDashboard },
  { id: 'send' as View, label: 'Send', Icon: Send },
  { id: 'invoices' as View, label: 'Invoices', Icon: FileText },
  { id: 'history' as View, label: 'History', Icon: Clock },
]

export default function App() {
  const [view, setView] = useState<View>('dashboard')

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-gradient)' }}>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent)' }}
            >
              <Zap className="size-4 text-white" />
            </div>
            <span className="display text-base font-bold" style={{ color: 'var(--ink)' }}>
              PayBridge
              <span className="ml-1 text-xs font-semibold" style={{ color: 'var(--accent-hover)' }}>
                AI
              </span>
            </span>
          </div>
          <ConnectKitButton
            customTheme={{
              '--ck-font-family': "'DM Sans', sans-serif",
              '--ck-primary-button-background': '#122d45',
              '--ck-primary-button-hover-background': '#1061a6',
              '--ck-body-background': '#ffffff',
              '--ck-body-color': '#122d45',
              '--ck-border-radius': '14px',
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        {view === 'dashboard' && (
          <Dashboard onNavigate={(v) => setView(v)} />
        )}
        {view === 'send' && <SendPayment />}
        {view === 'invoices' && <Invoices />}
        {view === 'history' && <History />}
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-safe pt-1">
          {NAV.map(({ id, label, Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2 transition-all"
              >
                <div
                  className="flex size-9 items-center justify-center rounded-xl transition-all"
                  style={{
                    background: active ? 'rgba(18,45,69,0.09)' : 'transparent',
                  }}
                >
                  <Icon
                    className="size-5"
                    style={{ color: active ? 'var(--accent)' : 'var(--subtle)' }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: active ? 'var(--accent)' : 'var(--subtle)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
