import { useState } from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { Search, PenLine, Trash2, UserPlus, FileText, Loader2, UserCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { hemeraApi, iamApi } from '../../api/client';
import { cn } from '../../utils/cn';

export function Authors() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['iam-users'],
        queryFn: async () => {
            const response = await iamApi.get('/users');
            return Array.isArray(response.data) ? response.data : (response.data.content || []);
        }
    });

    const { data: roles } = useQuery({
        queryKey: ['iam-roles'],
        queryFn: async () => {
            const response = await iamApi.get('/roles');
            return Array.isArray(response.data) ? response.data : (response.data.content || []);
        }
    });

    const { data: allArticles } = useQuery({
        queryKey: ['articles', 'all-counts'],
        queryFn: async () => {
            const response = await hemeraApi.get('/articles', { params: { limit: 1000 } });
            return response.data;
        }
    });

    const getArticleCount = (userId: string) => {
        if (!allArticles) return 0;
        return allArticles.filter((a: any) => a.authorUserId === userId).length;
    };

    const filteredUsers = users?.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (usersLoading) {
        return (
            <PageShell title="Authors" description="Loading contributors...">
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm text-gray-500 font-medium">Fetching IAM identities...</p>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell
            title="Authors"
            description="Manage contributors and editors from IAM"
            actions={
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95">
                    <UserPlus className="h-4 w-4 mr-2" /> Invite Author
                </button>
            }
        >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-b-4 border-b-blue-500/10">
                <div className="p-6 border-b border-gray-200 bg-gray-50/30 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        Total: {filteredUsers?.length || 0}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Author Identity</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">System Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Articles</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredUsers?.map((user: any) => (
                                <tr key={user.userId} className="hover:bg-blue-50/10 transition-colors group">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-100 group-hover:rotate-3 transition-transform">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.username}</div>
                                                <div className="text-[11px] text-gray-400 font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit uppercase tracking-tighter shadow-sm">
                                                Member
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-mono">ID: {user.userId.substring(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{getArticleCount(user.userId)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest",
                                            user.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"
                                        )}>
                                            {user.active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Profile">
                                                <PenLine className="h-4.5 w-4.5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Remove Access">
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>
    );
}
