import { Filter, Download, MoreVertical, Plus, User, DollarSign, Calendar, Info, Trash2, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';

export default function Orders() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ customerName: '', totalAmount: '', status: 'PENDING' });

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: api.orders.list
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.orders.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            closeModal();
        }
    });

    const openModal = () => {
        setFormData({ customerName: '', totalAmount: '', status: 'PENDING' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            customerName: formData.customerName,
            totalAmount: parseFloat(formData.totalAmount),
            status: formData.status,
            orderDate: new Date().toISOString()
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Commercial Transactions ledger</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl"><Download size={18} /></Button>
                    <Button className="gap-2 rounded-xl" onClick={openModal}><Plus size={18} /> New Request</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-50">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Order Reference</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Identity / Customer</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Net Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none text-center">Lifecycle Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders?.map((o: any) => (
                                    <tr key={o.orderId} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-gray-900 tracking-tight">ORD-{o.orderId.substring(0, 4)}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                                                <Calendar size={12} strokeWidth={2.5} /> {new Date(o.orderDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                                    <User size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{o.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-gray-900 border-l border-transparent group-hover:border-primary-100/50 transition-all">
                                            <span className="text-[10px] text-gray-300 mr-0.5">$</span>
                                            {Number(o.totalAmount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge variant={o.status === 'COMPLETED' ? 'success' : o.status === 'PENDING' ? 'warning' : 'outline'} className="rounded-lg h-7 px-3 font-black tracking-widest text-[9px] uppercase">
                                                {o.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-4">
                                            <Menu as="div" className="relative inline-block">
                                                <Menu.Button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl outline-none">
                                                    <MoreVertical size={20} />
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-1.5 z-10 outline-none">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={cn("flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider", active ? "bg-gray-50 text-gray-900" : "text-gray-600")}>
                                                                    <Eye size={16} /> View Details
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={cn("flex items-center w-full px-3 py-2.5 text-xs font-bold rounded-xl transition-all gap-3 uppercase tracking-wider text-rose-500", active ? "bg-rose-50" : "")}>
                                                                    <Trash2 size={16} /> Cancel Order
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </td>
                                    </tr>
                                ))}
                                {(!orders || orders.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center text-gray-400 font-black uppercase tracking-widest text-xs italic">No commercial activity recorded</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Order Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Initiate Commercial Transaction"
                description="Record a new manual order request into the ledger."
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Identifier</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Full Name or Business Entity"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Valuation</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.totalAmount}
                                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-primary-500">Lifecycle Status</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['PENDING', 'SHIPPED', 'COMPLETED'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: s })}
                                    className={cn(
                                        "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                        formData.status === s
                                            ? "bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20"
                                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-2xl h-12" onClick={closeModal}>Discard</Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/10"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Processing..." : "Authorize Request"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
