import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Settings,
    Command,
    Sun,
    Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
]

export function Header() {
    const location = useLocation()
    const { theme, setTheme, setIsCommandOpen } = useApp()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <motion.div
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* FlowZen Logo - Flowing Zen Circle */}
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" strokeLinecap="round" />
                            <path d="M22 12c0 5.52-4.48 10-10 10" strokeLinecap="round" strokeDasharray="4 4" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                    </motion.div>
                    <span className="text-xl font-bold">
                        Flow<span className="text-primary">Zen</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Command Palette Trigger */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex items-center gap-2"
                        onClick={() => setIsCommandOpen(true)}
                    >
                        <Command className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Ctrl+K</span>
                    </Button>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <motion.div
                            initial={false}
                            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            {theme === 'dark' ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </motion.div>
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="md:hidden flex items-center justify-around border-t py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path}>
                            <motion.div
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                                whileTap={{ scale: 0.95 }}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>
        </header>
    )
}
