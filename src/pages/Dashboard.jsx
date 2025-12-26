import { motion } from 'framer-motion'
import {
    CheckSquare,
    CheckCircle,
    Flame,
    Target,
    Calendar,
    ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/Dashboard/StatsCard'
import { useApp } from '@/contexts/AppContext'
import { formatRelativeDate, cn } from '@/lib/utils'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Dashboard() {
    const { tasks, stats, productivityData } = useApp()

    // Get upcoming tasks (not completed, sorted by due date)
    const upcomingTasks = tasks
        .filter(task => !task.completed && task.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)

    // Prepare chart data with day names
    const chartData = productivityData.map(item => ({
        ...item,
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
    }))

    const priorityColors = {
        high: 'destructive',
        medium: 'warning',
        low: 'secondary'
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container py-8 px-4 space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your productivity overview.</p>
                </div>
                <Link to="/tasks">
                    <Button>
                        View All Tasks
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <StatsCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={CheckSquare}
                    trend="up"
                    trendValue="12% this week"
                />
                <StatsCard
                    title="Completed"
                    value={stats.completedTasks}
                    icon={CheckCircle}
                    trend="up"
                    trendValue={`${stats.completionRate}% rate`}
                />
                <StatsCard
                    title="Current Streak"
                    value={`${stats.streak} days`}
                    icon={Flame}
                    trend="up"
                    trendValue="Keep it going!"
                />
                <StatsCard
                    title="Focus Score"
                    value={`${stats.focusScore}%`}
                    icon={Target}
                />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Productivity Chart */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Weekly Productivity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar
                                            dataKey="completed"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Completion Rate Trend */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Completion Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Upcoming Tasks */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                        <Link to="/tasks">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {upcomingTasks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No upcoming tasks. Great job! 🎉
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                task.priority === 'high' && "bg-red-500",
                                                task.priority === 'medium' && "bg-amber-500",
                                                task.priority === 'low' && "bg-gray-400"
                                            )} />
                                            <div>
                                                <p className="font-medium">{task.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatRelativeDate(task.dueDate)}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={priorityColors[task.priority]}>
                                            {task.priority}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
