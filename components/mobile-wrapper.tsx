import type { ReactNode } from "react"

interface MobileWrapperProps {
  children: ReactNode
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4">
      <div className="w-[375px] min-h-[812px] max-h-[812px] bg-background rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-[8px] border-neutral-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-50" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">{children}</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-800 rounded-full" />
      </div>
    </div>
  )
}
