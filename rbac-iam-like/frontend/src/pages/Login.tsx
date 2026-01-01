import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { authApi } from '../api/client';
import { Lock, User, ShieldAlert, Shield, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100/10 to-indigo-100/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6 shadow-2xl shadow-primary-500/30 animate-in zoom-in duration-500">
                        <Shield size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">IAM Center</h1>
                    <p className="text-gray-500 font-medium flex items-center justify-center gap-2">
                        <Sparkles size={16} className="text-primary-500" />
                        Enterprise Access Control Platform
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-300/20">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Sign In</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
                            <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <div className="font-black text-xs uppercase tracking-wider mb-1">Authentication Failed</div>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Username</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-all duration-300">
                                    <User size={20} strokeWidth={2.5} />
                                </span>
                                <input
                                    required
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 rounded-2xl py-4 pl-14 pr-4 text-gray-900 font-bold placeholder-gray-300 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-all duration-300">
                                    <Lock size={20} strokeWidth={2.5} />
                                </span>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 rounded-2xl py-4 pl-14 pr-4 text-gray-900 font-bold placeholder-gray-300 outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-xl shadow-primary-500/30'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Secure Sign In
                                    <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 justify-center bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Demo Account</span>
                            </div>
                            <div className="h-4 w-px bg-gray-200" />
                            <code className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                                admin / admin123
                            </code>
                        </div>
                    </div>
                </div>

                {/* Security Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                        <Shield size={20} className="text-primary-500 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">AWS IAM</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                        <Lock size={20} className="text-primary-500 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">JWT Auth</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3">
                        <CheckCircle size={20} className="text-primary-500 mx-auto mb-1" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">RBAC</p>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-400 text-xs font-bold">
                    &copy; 2026 IAM Center &middot; Enterprise Access Control
                </p>
            </div>
        </div>
    );
}
