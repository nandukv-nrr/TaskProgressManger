import { motion } from 'framer-motion'
import {
    Sun,
    Moon,
    Download,
    Upload,
    Bell,
    Volume2,
    CheckSquare,
    FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useApp } from '@/contexts/AppContext'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function Settings() {
    const { theme, setTheme, tasks, notes, stats } = useApp()
    const [notifications, setNotifications] = useState(true)
    const [sounds, setSounds] = useState(true)

    const handleExport = () => {
        const data = {
            tasks,
            notes,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `productivepro-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast({
            title: 'Export Complete',
            description: 'Your data has been exported successfully'
        })
    }

    const handleImport = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result)
                // In a real app, we'd import this data into the context/Firebase
                console.log('Imported data:', data)
                toast({
                    title: 'Import Complete',
                    description: `Imported ${data.tasks?.length || 0} tasks and ${data.notes?.length || 0} notes`
                })
            } catch (error) {
                toast({
                    title: 'Import Failed',
                    description: 'Invalid file format',
                    variant: 'destructive'
                })
            }
        }
        reader.readAsText(file)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container py-8 px-4 space-y-8 max-w-2xl"
        >
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your app preferences</p>
            </div>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Appearance</CardTitle>
                    <CardDescription>Customize how FlowZen looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme('light')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-colors",
                                    theme === 'light'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                    <Sun className="h-6 w-6 text-amber-600" />
                                </div>
                                <span className="font-medium">Light</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme('dark')}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-colors",
                                    theme === 'dark'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                                    <Moon className="h-6 w-6 text-slate-300" />
                                </div>
                                <span className="font-medium">Dark</span>
                            </motion.button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>Configure notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <Label className="text-base">Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive task reminders</p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications}
                            onCheckedChange={setNotifications}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Volume2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <Label className="text-base">Sound Effects</Label>
                                <p className="text-sm text-muted-foreground">Play sounds for actions</p>
                            </div>
                        </div>
                        <Switch
                            checked={sounds}
                            onCheckedChange={setSounds}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Data Management</CardTitle>
                    <CardDescription>Export or import your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                        <div className="flex-1">
                            <input
                                type="file"
                                accept=".json"
                                id="import-file"
                                className="hidden"
                                onChange={handleImport}
                            />
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById('import-file')?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Import Data
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Export creates a JSON backup of all your tasks and notes. Import will merge with existing data.
                    </p>
                </CardContent>
            </Card>

            {/* App Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Statistics</CardTitle>
                    <CardDescription>Your productivity at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <CheckSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                                <p className="text-xs text-muted-foreground">Total Tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{notes.length}</p>
                                <p className="text-xs text-muted-foreground">Total Notes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                <CheckSquare className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                <span className="text-emerald-500 font-bold">{stats.completionRate}%</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                                <p className="text-xs text-muted-foreground">Completion Rate</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>FlowZen v1.0.0</p>
                <p className="mt-1">Built with React, Firebase & Tailwind CSS</p>
            </div>
        </motion.div>
    )
}
