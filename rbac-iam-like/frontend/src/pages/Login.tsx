import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { authApi } from '../api/client';
import { Lock, User, ShieldAlert } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const res = await authApi.login({ username, password });
            await login(res.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white mb-4 shadow-xl shadow-primary-500/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">IAM Center</h1>
                    <p className="text-gray-500 mt-2 font-medium">Verify your identity to continue</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary text-center">Sign In</h2>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex gap-3 items-center">
                            <ShieldAlert size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <User size={18} />
                                </span>
                                <input
                                    required
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-300 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary-500/20 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-300 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className={`w-full py-4 rounded-xl font-bold transition-all transform active:scale-[0.98] ${isSubmitting
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                                }`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                            Demo: admin / admin
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs font-medium">
                    &copy; 2026 IAM Center. Secure Access Control.
                </p>
            </div>
        </div>
    );
}
