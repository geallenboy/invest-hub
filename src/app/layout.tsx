import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'invest-hub',
  description: '嘉伦投资成长计划 · Web3 投资与开发指挥台',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <Providers>
          <div className="mx-auto max-w-5xl p-6">
            <header className="flex items-center justify-between py-4">
              <h1 className="text-xl font-bold tracking-tight">invest-hub</h1>
              <div className="text-sm opacity-80">嘉伦web3投资成长计划</div>
            </header>
            <main>{children}</main>
            <footer className="py-12 text-center text-xs text-neutral-400">
              © {new Date().getFullYear()} invest-hub · Built with Next.js + wagmi
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
