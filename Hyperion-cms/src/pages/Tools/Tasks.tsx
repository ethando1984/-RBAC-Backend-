import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Plus, CheckSquare, Clock, AlertCircle, CheckCircle2, XCircle, Loader2, Calendar, User, FileText, Trash2, Edit2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, type Task } from '../../api/tasks';
import { cn } from '../../utils/cn';

const STATUS_CONFIG = {
    TODO: { label: 'To Do', color: 'gray', icon: Clock, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    IN_PROGRESS: { label: 'In Progress', color: 'blue', icon: AlertCircle, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    COMPLETED: { label: 'Completed', color: 'green', icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    CANCELLED: { label: 'Cancelled', color: 'red', icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
} as const;

const PRIORITY_CONFIG = {
    LOW: { label: 'Low', color: 'text-gray-400', icon: '○' },
    MEDIUM: { label: 'Medium', color: 'text-blue-500', icon: '◐' },
    HIGH: { label: 'High', color: 'text-orange-500', icon: '◉' },
    URGENT: { label: 'Urgent', color: 'text-red-600', icon: '⬤' },
} as const;

export function Tasks() {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToEmail: '',
        dueDate: '',
    });

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks', selectedStatus],
        queryFn: () => taskApi.list({ status: selectedStatus || undefined })
    });

    const { data: stats } = useQuery({
        queryKey: ['task-stats'],
        queryFn: taskApi.getStats
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Task>) => {
            if (editingTask) return taskApi.update(editingTask.id, data);
            return taskApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
            setIsModalOpen(false);
            setEditingTask(null);
            resetForm();
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: Task['status'] }) => taskApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: taskApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
        }
    });

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MEDIUM',
            assignedToEmail: '',
            dueDate: '',
        });
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedToEmail: task.assignedToEmail || '',
            dueDate: task.dueDate ? task.dueDate.substring(0, 16) : '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (task: Task) => {
        if (window.confirm(`Are you sure you want to delete the task "${task.title}"?\n\nThis action cannot be undone.`)) {
            deleteMutation.mutate(task.id);
        }
    };

    const handleStatusChange = (id: string, status: Task['status']) => {
        statusMutation.mutate({ id, status });
    };

    return (
        <PageShell
            title="Task Management"
            description="Organize editorial workflow and team assignments"
            actions={
                <button
                    onClick={() => { setEditingTask(null); resetForm(); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Task
                </button>
            }
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        const count = stats?.[key] || 0;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedStatus(selectedStatus === key ? '' : key)}
                                className={cn(
                                    "p-6 rounded-2xl border-2 transition-all text-left group hover:scale-105 active:scale-95",
                                    selectedStatus === key
                                        ? `${config.bg} ${config.border} shadow-lg`
                                        : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                                        selectedStatus === key ? config.bg : 'bg-gray-50 group-hover:bg-gray-100'
                                    )}>
                                        <Icon className={cn("h-6 w-6", selectedStatus === key ? config.text : 'text-gray-400')} />
                                    </div>
                                    <span className={cn(
                                        "text-3xl font-black transition-colors",
                                        selectedStatus === key ? config.text : 'text-gray-900'
                                    )}>{count}</span>
                                </div>
                                <p className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    selectedStatus === key ? config.text : 'text-gray-500'
                                )}>{config.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            {selectedStatus ? `${STATUS_CONFIG[selectedStatus as keyof typeof STATUS_CONFIG].label} Tasks` : 'All Tasks'}
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-400">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 opacity-20" />
                                <p className="text-xs font-medium uppercase tracking-widest">Loading tasks...</p>
                            </div>
                        ) : tasks?.length === 0 ? (
                            <div className="p-20 text-center text-gray-400">
                                <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-10" />
                                <p className="text-lg font-medium text-gray-900 mb-1">No tasks found</p>
                                <p className="text-sm">Create a new task to get started.</p>
                            </div>
                        ) : (
                            tasks?.map(task => {
                                const statusConfig = STATUS_CONFIG[task.status];
                                const priorityConfig = PRIORITY_CONFIG[task.priority];

                                return (
                                    <div key={task.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            {/* Priority Indicator */}
                                            <div className={cn("text-2xl mt-1", priorityConfig.color)} title={priorityConfig.label}>
                                                {priorityConfig.icon}
                                            </div>

                                            {/* Task Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h4 className="font-bold text-gray-900 text-base leading-tight">{task.title}</h4>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(task)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    {task.assignedToEmail && (
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                                            <User className="h-3 w-3" />
                                                            <span className="font-medium">{task.assignedToEmail}</span>
                                                        </div>
                                                    )}
                                                    {task.dueDate && (
                                                        <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 text-orange-700">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    {task.articleId && (
                                                        <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 text-purple-700">
                                                            <FileText className="h-3 w-3" />
                                                            <span className="font-medium">Linked Article</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Dropdown */}
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-xs font-bold border-2 outline-none cursor-pointer transition-all flex-shrink-0",
                                                    statusConfig.bg, statusConfig.text, statusConfig.border,
                                                    "hover:shadow-md"
                                                )}
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">Workflow Assignment</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                    placeholder="e.g. Review article draft"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                                    rows={4}
                                    placeholder="Additional details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Priority</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                                    >
                                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Assign To (Email)</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        placeholder="user@example.com"
                                        value={formData.assignedToEmail}
                                        onChange={e => setFormData({ ...formData, assignedToEmail: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-3xl text-sm font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveMutation.mutate(formData)}
                                    disabled={!formData.title || saveMutation.isPending}
                                    className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-3xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
