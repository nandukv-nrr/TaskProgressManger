import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Search,
    Filter,
    List,
    LayoutGrid,
    Calendar,
    Timer,
    Trash2,
    Edit,
    Mic,
    MicOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { useApp } from '@/contexts/AppContext'
import { cn, formatRelativeDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const priorities = ['high', 'medium', 'low']
const statuses = ['todo', 'doing', 'done']
const categories = ['work', 'personal', 'development', 'design', 'meetings']

const priorityColors = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary'
}

const statusColors = {
    todo: 'secondary',
    doing: 'default',
    done: 'success'
}

export default function Tasks() {
    const [searchParams, setSearchParams] = useSearchParams()
    const {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        viewMode,
        setViewMode,
        setFocusMode,
        setFocusTask
    } = useApp()

    const [search, setSearch] = useState('')
    const [filterPriority, setFilterPriority] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [isListening, setIsListening] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        category: 'work',
        dueDate: ''
    })

    // Check for new task param
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setIsDialogOpen(true)
            setSearchParams({})
        }
    }, [searchParams, setSearchParams])

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description?.toLowerCase().includes(search.toLowerCase())
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus
        return matchesSearch && matchesPriority && matchesStatus
    })

    // Group tasks by status for Kanban view
    const groupedTasks = {
        todo: filteredTasks.filter(t => t.status === 'todo'),
        doing: filteredTasks.filter(t => t.status === 'doing'),
        done: filteredTasks.filter(t => t.status === 'done')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title.trim()) {
            toast({
                title: 'Error',
                description: 'Task title is required',
                variant: 'destructive'
            })
            return
        }

        try {
            if (editingTask) {
                await updateTask(editingTask.id, formData)
                toast({ title: 'Task Updated', description: formData.title })
            } else {
                await addTask(formData)
                toast({ title: 'Task Created', description: formData.title })
            }
            handleCloseDialog()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save task',
                variant: 'destructive'
            })
        }
    }

    const handleEdit = (task) => {
        setEditingTask(task)
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            category: task.category,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (taskId) => {
        await deleteTask(taskId)
        toast({ title: 'Task Deleted' })
    }

    const handleFocus = (task) => {
        setFocusTask(task)
        setFocusMode(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingTask(null)
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            category: 'work',
            dueDate: ''
        })
    }

    // Voice input
    const startVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast({
                title: 'Not Supported',
                description: 'Voice input is not supported in this browser',
                variant: 'destructive'
            })
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setFormData(prev => ({ ...prev, title: transcript }))
        }
        recognition.onerror = () => {
            setIsListening(false)
            toast({
                title: 'Error',
                description: 'Voice recognition failed',
                variant: 'destructive'
            })
        }

        recognition.start()
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container py-8 px-4 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">
                        {filteredTasks.length} tasks · {tasks.filter(t => t.completed).length} completed
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    {priorities.map(p => (
                                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statuses.map(s => (
                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex border rounded-md">
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('kanban')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Task List View */}
            {viewMode === 'list' && (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <Card className={cn(
                                    "transition-all hover:shadow-md",
                                    task.completed && "opacity-60"
                                )}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={() => toggleTaskComplete(task.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className={cn(
                                                            "font-medium",
                                                            task.completed && "line-through text-muted-foreground"
                                                        )}>
                                                            {task.title}
                                                        </p>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleFocus(task)}
                                                            disabled={task.completed}
                                                        >
                                                            <Timer className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(task)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(task.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                    <Badge variant={priorityColors[task.priority]}>
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge variant={statusColors[task.status]}>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge variant="outline">{task.category}</Badge>
                                                    {task.dueDate && (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatRelativeDate(task.dueDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredTasks.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No tasks found. Create one to get started!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                        <div key={status} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold capitalize">{status}</h3>
                                <Badge variant="outline">{statusTasks.length}</Badge>
                            </div>
                            <div className="space-y-3 min-h-[200px] p-3 rounded-lg bg-muted/30">
                                <AnimatePresence>
                                    {statusTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                                <CardContent className="p-3">
                                                    <p className="font-medium text-sm line-clamp-2">{task.title}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={priorityColors[task.priority]} className="text-xs">
                                                            {task.priority}
                                                        </Badge>
                                                        {task.dueDate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatRelativeDate(task.dueDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter task title"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={startVoiceInput}
                                    className={cn(isListening && "bg-red-500 text-white")}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(p => (
                                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(s => (
                                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
