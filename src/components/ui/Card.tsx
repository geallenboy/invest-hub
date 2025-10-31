import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export default function Card({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 shadow-sm',
        className
      )}
    >
      {title && <h2 className="mb-3 text-base font-semibold tracking-tight">{title}</h2>}
      {children}
    </section>
  )
}
