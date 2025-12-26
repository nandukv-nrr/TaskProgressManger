import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { generateId } from '@/lib/utils'

const AppContext = createContext(null)

// Mock data for when Firebase is not configured
const mockTasks = [
    {
        id: '1',
        title: 'Complete project proposal',
        description: 'Draft and finalize the Q1 project proposal',
        priority: 'high',
        status: 'todo',
        category: 'work',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Review design mockups',
        description: 'Review the new dashboard design mockups',
        priority: 'medium',
        status: 'doing',
        category: 'design',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Update documentation',
        description: 'Update API documentation for v2.0',
        priority: 'low',
        status: 'done',
        category: 'development',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdAt: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Team meeting preparation',
        description: 'Prepare slides for the weekly team sync',
        priority: 'high',
        status: 'todo',
        category: 'meetings',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Fix authentication bug',
        description: 'Debug and fix the login timeout issue',
        priority: 'high',
        status: 'doing',
        category: 'development',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
    }
]

const mockNotes = [
    {
        id: '1',
        title: 'Project Ideas',
        content: '# Project Ideas\n\n- Build a task management app\n- Create a notes app with markdown support\n- Develop a focus timer with pomodoro technique',
        tags: ['ideas', 'features'],
        isPinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Meeting Notes - Q2 Planning',
        content: '## Q2 Planning Meeting\n\n**Attendees**: Team A\n\n### Key Points\n1. Focus on user experience\n2. Implement new features\n3. Performance optimization',
        tags: ['meetings', 'planning'],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Learning Resources',
        content: '# Learning Resources\n\n## React\n- Official docs\n- React patterns\n\n## Firebase\n- Firestore documentation\n- Authentication guides',
        tags: ['learning', 'development'],
        isPinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Quick Thoughts',
        content: 'Remember to take breaks and stay hydrated throughout the day.',
        tags: ['personal'],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

const mockProductivityData = [
    { date: '2025-01-01', completed: 3 },
    { date: '2025-01-02', completed: 5 },
    { date: '2025-01-03', completed: 2 },
    { date: '2025-01-04', completed: 4 },
    { date: '2025-01-05', completed: 6 },
    { date: '2025-01-06', completed: 3 },
    { date: '2025-01-07', completed: 7 }
]

export function AppProvider({ children }) {
    // Theme
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark'
        }
        return 'dark'
    })

    // Data - using mock data for now (will sync with Firebase when configured)
    const [tasks, setTasks] = useState(mockTasks)
    const [notes, setNotes] = useState(mockNotes)
    const [productivityData] = useState(mockProductivityData)
    const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false)

    // UI State
    const [isCommandOpen, setIsCommandOpen] = useState(false)
    const [focusMode, setFocusMode] = useState(false)
    const [focusTask, setFocusTask] = useState(null)
    const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'

    // Apply theme
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // Check if Firebase is configured
    useEffect(() => {
        try {
            // Try to access Firestore - if config is invalid, this will fail
            const tasksRef = collection(db, 'tasks')
            getDocs(tasksRef).then(() => {
                setIsFirebaseConfigured(true)
            }).catch(() => {
                console.log('Firebase not configured, using local storage')
                setIsFirebaseConfigured(false)
            })
        } catch (error) {
            setIsFirebaseConfigured(false)
        }
    }, [])

    // Firebase listeners (when configured)
    useEffect(() => {
        if (!isFirebaseConfigured) return

        const tasksRef = collection(db, 'tasks')
        const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'))

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dueDate: doc.data().dueDate?.toDate?.()?.toISOString() || doc.data().dueDate,
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
            }))
            setTasks(tasksData)
        })

        return () => unsubscribe()
    }, [isFirebaseConfigured])

    useEffect(() => {
        if (!isFirebaseConfigured) return

        const notesRef = collection(db, 'notes')
        const notesQuery = query(notesRef, orderBy('updatedAt', 'desc'))

        const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
            }))
            setNotes(notesData)
        })

        return () => unsubscribe()
    }, [isFirebaseConfigured])

    // Task operations
    const addTask = useCallback(async (taskData) => {
        const newTask = {
            ...taskData,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString()
        }

        if (isFirebaseConfigured) {
            await addDoc(collection(db, 'tasks'), {
                ...taskData,
                completed: false,
                createdAt: Timestamp.now(),
                dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null
            })
        } else {
            setTasks(prev => [newTask, ...prev])
        }
    }, [isFirebaseConfigured])

    const updateTask = useCallback(async (taskId, updates) => {
        if (isFirebaseConfigured) {
            const taskRef = doc(db, 'tasks', taskId)
            await updateDoc(taskRef, {
                ...updates,
                dueDate: updates.dueDate ? Timestamp.fromDate(new Date(updates.dueDate)) : null
            })
        } else {
            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            ))
        }
    }, [isFirebaseConfigured])

    const deleteTask = useCallback(async (taskId) => {
        if (isFirebaseConfigured) {
            await deleteDoc(doc(db, 'tasks', taskId))
        } else {
            setTasks(prev => prev.filter(task => task.id !== taskId))
        }
    }, [isFirebaseConfigured])

    const toggleTaskComplete = useCallback(async (taskId) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return

        const newCompleted = !task.completed
        const newStatus = newCompleted ? 'done' : 'todo'

        if (isFirebaseConfigured) {
            await updateDoc(doc(db, 'tasks', taskId), {
                completed: newCompleted,
                status: newStatus
            })
        } else {
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: newCompleted, status: newStatus } : t
            ))
        }
    }, [tasks, isFirebaseConfigured])

    // Note operations
    const addNote = useCallback(async (noteData) => {
        const now = new Date().toISOString()
        const newNote = {
            ...noteData,
            id: generateId(),
            isPinned: false,
            createdAt: now,
            updatedAt: now
        }

        if (isFirebaseConfigured) {
            await addDoc(collection(db, 'notes'), {
                ...noteData,
                isPinned: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            })
        } else {
            setNotes(prev => [newNote, ...prev])
        }
    }, [isFirebaseConfigured])

    const updateNote = useCallback(async (noteId, updates) => {
        if (isFirebaseConfigured) {
            const noteRef = doc(db, 'notes', noteId)
            await updateDoc(noteRef, {
                ...updates,
                updatedAt: Timestamp.now()
            })
        } else {
            setNotes(prev => prev.map(note =>
                note.id === noteId ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
            ))
        }
    }, [isFirebaseConfigured])

    const deleteNote = useCallback(async (noteId) => {
        if (isFirebaseConfigured) {
            await deleteDoc(doc(db, 'notes', noteId))
        } else {
            setNotes(prev => prev.filter(note => note.id !== noteId))
        }
    }, [isFirebaseConfigured])

    const toggleNotePin = useCallback(async (noteId) => {
        const note = notes.find(n => n.id === noteId)
        if (!note) return

        if (isFirebaseConfigured) {
            await updateDoc(doc(db, 'notes', noteId), {
                isPinned: !note.isPinned,
                updatedAt: Timestamp.now()
            })
        } else {
            setNotes(prev => prev.map(n =>
                n.id === noteId ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
            ))
        }
    }, [notes, isFirebaseConfigured])

    // Computed stats
    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        activeTasks: tasks.filter(t => !t.completed).length,
        completionRate: tasks.length > 0
            ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
            : 0,
        streak: 5, // Mock value
        focusScore: 85 // Mock value
    }

    const value = {
        // Theme
        theme,
        setTheme,

        // Tasks
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,

        // Notes
        notes,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePin,

        // Data
        productivityData,
        stats,

        // UI State
        isCommandOpen,
        setIsCommandOpen,
        focusMode,
        setFocusMode,
        focusTask,
        setFocusTask,
        viewMode,
        setViewMode,

        // Firebase status
        isFirebaseConfigured
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
