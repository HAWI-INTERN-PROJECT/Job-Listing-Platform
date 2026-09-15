import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/30 dark:bg-background transition-colors">
      {/* Sleek top navigation */}
      <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
            H
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">HireStream</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground hidden sm:inline-block">
              Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main card viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-200">
          {children}
        </div>
      </main>

      {/* Clean footer */}
      <footer className="py-4 border-t border-border/50 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HireStream. All rights reserved.</p>
      </footer>
    </div>
  )
}
