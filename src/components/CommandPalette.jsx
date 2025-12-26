import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Settings,
    Plus,
    Timer,
    Sun,
    Moon
} from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const commands = [
    {
        group: 'Navigation',
        items: [
            { label: 'Go to Dashboard', icon: LayoutDashboard, action: 'navigate', path: '/' },
            { label: 'Go to Tasks', icon: CheckSquare, action: 'navigate', path: '/tasks' },
            { label: 'Go to Notes', icon: FileText, action: 'navigate', path: '/notes' },
            { label: 'Go to Settings', icon: Settings, action: 'navigate', path: '/settings' },
        ]
    },
    {
        group: 'Quick Actions',
        items: [
            { label: 'Add New Task', icon: Plus, action: 'addTask' },
            { label: 'Add New Note', icon: Plus, action: 'addNote' },
            { label: 'Enter Focus Mode', icon: Timer, action: 'focusMode' },
            { label: 'Toggle Theme', icon: Sun, action: 'toggleTheme' },
        ]
    }
]

export function CommandPalette() {
    const navigate = useNavigate()
    const {
        isCommandOpen,
        setIsCommandOpen,
        theme,
        setTheme,
        setFocusMode
    } = useApp()
    const [search, setSearch] = useState('')

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandOpen(true)
            }
            if (e.key === 'Escape') {
                setIsCommandOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [setIsCommandOpen])

    const handleAction = (item) => {
        setIsCommandOpen(false)
        setSearch('')

        switch (item.action) {
            case 'navigate':
                navigate(item.path)
                break
            case 'addTask':
                navigate('/tasks?new=true')
                break
            case 'addNote':
                navigate('/notes?new=true')
                break
            case 'focusMode':
                setFocusMode(true)
                break
            case 'toggleTheme':
                setTheme(theme === 'dark' ? 'light' : 'dark')
                break
        }
    }

    const filteredCommands = commands.map(group => ({
        ...group,
        items: group.items.filter(item =>
            item.label.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(group => group.items.length > 0)

    return (
        <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
            <DialogContent className="max-w-lg p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Command Palette</DialogTitle>
                </DialogHeader>
                <div className="border-b">
                    <Input
                        placeholder="Type a command or search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0 h-12 text-base"
                        autoFocus
                    />
                </div>
                <div className="max-h-96 overflow-auto p-2">
                    {filteredCommands.map((group) => (
                        <div key={group.group} className="mb-4">
                            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                {group.group}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleAction(item)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-3 py-2 rounded-lg",
                                            "text-sm text-left transition-colors",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredCommands.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
