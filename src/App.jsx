import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import { Header } from '@/components/Layout/Header'
import { CommandPalette } from '@/components/CommandPalette'
import { FocusMode } from '@/components/FocusMode'
import { Toaster } from '@/components/ui/toaster'
import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import Notes from '@/pages/Notes'
import Settings from '@/pages/Settings'

function AppContent() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
            <CommandPalette />
            <FocusMode />
            <Toaster />
        </div>
    )
}

function App() {
    return (
        <Router>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </Router>
    )
}

export default App
