import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Search,
    Pin,
    PinOff,
    Trash2,
    Edit,
    Tag,
    Mic,
    MicOff,
    X
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { useApp } from '@/contexts/AppContext'
import { cn, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function Notes() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { notes, addNote, updateNote, deleteNote, toggleNotePin } = useApp()

    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [viewingNote, setViewingNote] = useState(null)
    const [isListening, setIsListening] = useState(false)
    const [tagInput, setTagInput] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: []
    })

    // Check for new note param
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setIsDialogOpen(true)
            setSearchParams({})
        }
    }, [searchParams, setSearchParams])

    // Filter notes
    const filteredNotes = notes.filter(note => {
        const searchLower = search.toLowerCase()
        return note.title.toLowerCase().includes(searchLower) ||
            note.content.toLowerCase().includes(searchLower) ||
            note.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    })

    // Separate pinned notes
    const pinnedNotes = filteredNotes.filter(n => n.isPinned)
    const otherNotes = filteredNotes.filter(n => !n.isPinned)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title.trim()) {
            toast({
                title: 'Error',
                description: 'Note title is required',
                variant: 'destructive'
            })
            return
        }

        try {
            if (editingNote) {
                await updateNote(editingNote.id, formData)
                toast({ title: 'Note Updated', description: formData.title })
            } else {
                await addNote(formData)
                toast({ title: 'Note Created', description: formData.title })
            }
            handleCloseDialog()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save note',
                variant: 'destructive'
            })
        }
    }

    const handleEdit = (note) => {
        setEditingNote(note)
        setFormData({
            title: note.title,
            content: note.content || '',
            tags: note.tags || []
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (noteId) => {
        await deleteNote(noteId)
        toast({ title: 'Note Deleted' })
        setViewingNote(null)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingNote(null)
        setFormData({
            title: '',
            content: '',
            tags: []
        })
        setTagInput('')
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
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
            setFormData(prev => ({
                ...prev,
                content: prev.content + (prev.content ? ' ' : '') + transcript
            }))
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

    const NoteCard = ({ note }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            className="cursor-pointer"
            onClick={() => setViewingNote(note)}
        >
            <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                        {note.isPinned && (
                            <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert line-clamp-4 text-sm text-muted-foreground">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                    {note.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {note.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {note.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{note.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        {formatDate(note.updatedAt)}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    )

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container py-8 px-4 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Notes</h1>
                    <p className="text-muted-foreground">
                        {filteredNotes.length} notes · {pinnedNotes.length} pinned
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notes by title, content, or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Pin className="h-4 w-4" />
                        Pinned
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {pinnedNotes.map(note => (
                                <NoteCard key={note.id} note={note} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* All Notes */}
            <div className="space-y-4">
                {pinnedNotes.length > 0 && <h2 className="text-lg font-semibold">Other Notes</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {otherNotes.map(note => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </AnimatePresence>
                </div>
                {filteredNotes.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No notes found. Create one to get started!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* View Note Dialog */}
            <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {viewingNote && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between">
                                    <DialogTitle className="pr-8">{viewingNote.title}</DialogTitle>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleNotePin(viewingNote.id)}
                                    >
                                        {viewingNote.isPinned ? (
                                            <><PinOff className="h-4 w-4 mr-2" /> Unpin</>
                                        ) : (
                                            <><Pin className="h-4 w-4 mr-2" /> Pin</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            handleEdit(viewingNote)
                                            setViewingNote(null)
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(viewingNote.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2 text-destructive" /> Delete
                                    </Button>
                                </div>
                                {viewingNote.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {viewingNote.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{viewingNote.content}</ReactMarkdown>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Created: {formatDate(viewingNote.createdAt)} · Updated: {formatDate(viewingNote.updatedAt)}
                                </p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add/Edit Note Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter note title"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content">Content (Markdown supported)</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={startVoiceInput}
                                    className={cn(isListening && "bg-red-500 text-white")}
                                >
                                    {isListening ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                                    {isListening ? 'Stop' : 'Voice'}
                                </Button>
                            </div>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Write your note content here..."
                                rows={8}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={addTag}>
                                    Add
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingNote ? 'Update Note' : 'Create Note'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
