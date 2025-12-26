import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function StatsCard({ title, value, icon: Icon, trend, trendValue, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className={cn("overflow-hidden", className)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">{title}</p>
                            <motion.p
                                className="text-3xl font-bold"
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                {value}
                            </motion.p>
                            {trend && (
                                <p className={cn(
                                    "text-xs font-medium",
                                    trend === 'up' ? "text-emerald-500" : "text-red-500"
                                )}>
                                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                                </p>
                            )}
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
