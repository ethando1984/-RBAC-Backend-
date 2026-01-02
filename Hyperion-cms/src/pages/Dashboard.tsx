import { useQuery } from '@tanstack/react-query';
import { PageShell } from '../components/layout/PageShell';
import { FileText, CheckSquare, TrendingUp, Clock, AlertCircle, CheckCircle2, Users, Activity, ArrowUpRight, Loader2 } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { cn } from '../utils/cn';

export function Dashboard() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const { data: activity, isLoading: activityLoading } = useQuery({
        queryKey: ['dashboard-activity'],
        queryFn: dashboardApi.getRecentActivity,
        refetchInterval: 30000,
    });

    const statCards = [
        {
            title: 'Total Articles',
            value: stats?.articles.total || 0,
            change: '+12%',
            trend: 'up',
            icon: FileText,
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
        },
        {
            title: 'Published',
            value: stats?.articles.published || 0,
            change: '+8%',
            trend: 'up',
            icon: CheckCircle2,
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            text: 'text-green-700',
        },
        {
            title: 'Pending Tasks',
            value: stats?.tasks.todo || 0,
            change: '-3%',
            trend: 'down',
            icon: Clock,
            gradient: 'from-orange-500 to-amber-600',
            bg: 'bg-orange-50',
            text: 'text-orange-700',
        },
        {
            title: 'In Progress',
            value: stats?.tasks.inProgress || 0,
            change: '+15%',
            trend: 'up',
            icon: AlertCircle,
            gradient: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
        },
    ];

    return (
        <PageShell
            title="Dashboard"
            description="Welcome back! Here's what's happening with your content."
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br",
                                        card.gradient
                                    )}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
                                        card.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    )}>
                                        <ArrowUpRight className={cn(
                                            "h-3 w-3",
                                            card.trend === 'down' && 'rotate-90'
                                        )} />
                                        {card.change}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                                    {statsLoading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                    ) : (
                                        <p className="text-4xl font-black text-gray-900">{card.value}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Article Status Breakdown */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Content Overview</h3>
                                <p className="text-sm text-gray-500 mt-1">Article status distribution</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Published</span>
                                </div>
                                <p className="text-3xl font-black text-green-900">{stats?.articles.published || 0}</p>
                                <p className="text-xs text-green-600 mt-2">Live content</p>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Draft</span>
                                </div>
                                <p className="text-3xl font-black text-yellow-900">{stats?.articles.draft || 0}</p>
                                <p className="text-xs text-yellow-600 mt-2">In progress</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Pending</span>
                                </div>
                                <p className="text-3xl font-black text-orange-900">{stats?.articles.pending || 0}</p>
                                <p className="text-xs text-orange-600 mt-2">Review needed</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 font-medium">Total Articles</span>
                                <span className="text-2xl font-black text-gray-900">{stats?.articles.total || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Task Summary */}
                    <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Tasks</h3>
                                <p className="text-sm text-gray-500 mt-1">Workflow status</p>
                            </div>
                            <CheckSquare className="h-8 w-8 text-purple-600" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-200 rounded-xl flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="font-semibold text-gray-700">To Do</span>
                                </div>
                                <span className="text-2xl font-black text-gray-900">{stats?.tasks.todo || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-200 rounded-xl flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-blue-700">In Progress</span>
                                </div>
                                <span className="text-2xl font-black text-blue-900">{stats?.tasks.inProgress || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-200 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="font-semibold text-green-700">Completed</span>
                                </div>
                                <span className="text-2xl font-black text-green-900">{stats?.tasks.completed || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Articles */}
                    <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900">Recent Articles</h3>
                            <FileText className="h-6 w-6 text-gray-400" />
                        </div>

                        <div className="space-y-3">
                            {activityLoading ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-300" />
                                </div>
                            ) : activity?.recentArticles && activity.recentArticles.length > 0 ? (
                                activity.recentArticles.map((article) => (
                                    <div key={article.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{article.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded font-bold",
                                                article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                    article.status === 'DRAFT' ? 'bg-gray-200 text-gray-700' :
                                                        'bg-orange-100 text-orange-700'
                                            )}>
                                                {article.status}
                                            </span>
                                            <span>•</span>
                                            <span>{article.createdByEmail}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-8 text-sm">No recent articles</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Log */}
                    <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900">Recent Activity</h3>
                            <Activity className="h-6 w-6 text-gray-400" />
                        </div>

                        <div className="space-y-3">
                            {activityLoading ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-300" />
                                </div>
                            ) : activity?.recentAuditLogs && activity.recentAuditLogs.length > 0 ? (
                                activity.recentAuditLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                {log.actorEmail || 'System'} {log.actionType.toLowerCase()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-8 text-sm">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
