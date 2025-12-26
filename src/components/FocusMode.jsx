import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/contexts/AppContext'
import { toast } from '@/hooks/use-toast'

const MODES = {
    pomodoro: { label: 'Pomodoro', duration: 25 * 60, color: 'from-emerald-500 to-teal-600' },
    shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'from-cyan-500 to-blue-600' },
    longBreak: { label: 'Long Break', duration: 15 * 60, color: 'from-violet-500 to-purple-600' }
}

export function FocusMode() {
    const { focusMode, setFocusMode, focusTask, setFocusTask, toggleTaskComplete } = useApp()
    const [mode, setMode] = useState('pomodoro')
    const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration)
    const [isRunning, setIsRunning] = useState(false)

    const currentMode = MODES[mode]
    const progress = ((currentMode.duration - timeLeft) / currentMode.duration) * 100

    // Timer logic
    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsRunning(false)
                    toast({
                        title: `${currentMode.label} Complete!`,
                        description: mode === 'pomodoro'
                            ? 'Time for a break!'
                            : 'Ready to focus again?',
                        variant: 'success'
                    })
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, timeLeft, currentMode.label, mode])

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const handleModeChange = (newMode) => {
        setMode(newMode)
        setTimeLeft(MODES[newMode].duration)
        setIsRunning(false)
    }

    const handleReset = () => {
        setTimeLeft(currentMode.duration)
        setIsRunning(false)
    }

    const handleComplete = async () => {
        if (focusTask) {
            await toggleTaskComplete(focusTask.id)
            toast({
                title: 'Task Completed!',
                description: focusTask.title,
                variant: 'success'
            })
        }
        setFocusMode(false)
        setFocusTask(null)
    }

    const handleClose = () => {
        setFocusMode(false)
        setFocusTask(null)
        setIsRunning(false)
        setTimeLeft(MODES.pomodoro.duration)
        setMode('pomodoro')
    }

    return (
        <AnimatePresence>
            {focusMode && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br ${currentMode.color}`}
                >
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10"
                        onClick={handleClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>

                    {/* Task Info */}
                    {focusTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 text-center"
                        >
                            <p className="text-white/60 text-sm mb-2">Currently focusing on</p>
                            <h2 className="text-white text-2xl font-bold max-w-md truncate">
                                {focusTask.title}
                            </h2>
                        </motion.div>
                    )}

                    {/* Mode Selector */}
                    <div className="flex gap-2 mb-8">
                        {Object.entries(MODES).map(([key, { label }]) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                className={`
                  ${mode === key
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }
                `}
                                onClick={() => handleModeChange(key)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <motion.div
                        key={timeLeft}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="mb-8"
                    >
                        <p className="text-8xl md:text-9xl font-bold text-white tabular-nums">
                            {formatTime(timeLeft)}
                        </p>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="w-80 mb-8">
                        <Progress value={progress} className="h-2 bg-white/20" />
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                            onClick={handleReset}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-white/90 px-8"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? (
                                <Pause className="h-5 w-5 mr-2" />
                            ) : (
                                <Play className="h-5 w-5 mr-2" />
                            )}
                            {isRunning ? 'Pause' : 'Start'}
                        </Button>
                        {focusTask && (
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={handleComplete}
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Complete
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
