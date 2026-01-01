import { Package, AlertCircle, Tag, Plus, Edit, Trash2, ShoppingBag, DollarSign, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';

export default function Inventory() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({ productName: '', sku: '', price: '', stockQuantity: '' });

    const { data: products, isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: api.inventory.list
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.inventory.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.inventory.update(data.productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.inventory.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
    });

    const openModal = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                productName: product.productName,
                sku: product.sku || '',
                price: product.price.toString(),
                stockQuantity: product.stockQuantity.toString()
            });
        } else {
            setEditingProduct(null);
            setFormData({ productName: '', sku: '', price: '', stockQuantity: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.stockQuantity)
        };

        if (editingProduct) {
            updateMutation.mutate({ ...data, productId: editingProduct.productId });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">Warehouse A1 Resources & Assets</p>
                </div>
                <Button className="gap-2 rounded-xl h-11" onClick={() => openModal()}>
                    <Plus size={18} /> Add Stock Item
                </Button>
            </div>

            {isLoading ? (
                <div className="py-24 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((p: any) => (
                        <Card key={p.productId} className="relative overflow-hidden group border border-gray-100/50 hover:shadow-2xl transition-all duration-300">
                            <div className={cn(
                                "absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2",
                                p.stockQuantity < 20 ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-primary-500 shadow-[0_0_15px_rgba(59,102,245,0.3)]"
                            )} />
                            <CardContent className="pt-6 relative">
                                <div className="absolute right-4 top-4">
                                    <Menu as="div" className="relative transition-opacity">
                                        <Menu.Button className="p-1 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50 outline-none">
                                            <Plus size={18} className="rotate-45" />
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
                                                        <button
                                                            onClick={() => openModal(p)}
                                                            className={cn(
                                                                "flex items-center w-full px-3 py-2.5 text-[10px] font-black rounded-xl transition-all gap-3 uppercase tracking-widest",
                                                                active ? "bg-primary-50 text-primary-600" : "text-gray-500"
                                                            )}
                                                        >
                                                            <Edit size={14} /> Update Inventory
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => { if (confirm('Permanently decommission this asset?')) deleteMutation.mutate(p.productId) }}
                                                            className={cn(
                                                                "flex items-center w-full px-3 py-2.5 text-[10px] font-black rounded-xl transition-all gap-3 uppercase tracking-widest text-rose-500",
                                                                active ? "bg-rose-50" : ""
                                                            )}
                                                        >
                                                            <Trash2 size={14} /> Decommission Item
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>

                                <div className="flex justify-between items-start mb-5 gap-4">
                                    <div className="flex-1 min-w-0 pr-6">
                                        <h3 className="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-none truncate mb-2">
                                            {p.productName}
                                        </h3>
                                        <div className="flex items-center gap-1.5 bg-gray-50 w-fit px-2.5 py-1 rounded-lg">
                                            <Tag size={10} className="text-primary-500" strokeWidth={3} />
                                            <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase">{p.sku || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="rounded-lg shrink-0">Asset</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100/60 mt-2">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Market Valuation</p>
                                        <p className="text-base font-black text-gray-900 leading-none">
                                            <span className="text-gray-300 text-xs mr-0.5">$</span>
                                            {Number(p.price || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Stock Integrity</p>
                                        <div className="flex items-center justify-end gap-2 text-base font-black leading-none">
                                            {p.stockQuantity < 20 && <AlertCircle size={16} className="text-rose-500 animate-pulse" />}
                                            <p className={p.stockQuantity < 20 ? "text-rose-600" : "text-primary-600"}>
                                                {p.stockQuantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!products || products.length === 0) && (
                        <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-gray-200">
                                <Package size={32} />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Warehouse Is Depleted</p>
                        </div>
                    )}
                </div>
            )}

            {/* Inventory Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduct ? "Re-evaluate Asset" : "Register New Asset"}
                description={editingProduct ? "Update the supply metrics and valuation for this resource." : "Onboard a new physical or digital asset into the central system."}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Designation</label>
                        <div className="relative group">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.productName}
                                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                placeholder="e.g. MacBook Pro M3 Max"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU ID</label>
                            <div className="relative group">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                                <input
                                    required
                                    type="text"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="LAP-001"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none uppercase"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Price</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="2499"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                        <div className="relative group">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                required
                                type="number"
                                value={formData.stockQuantity}
                                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                                placeholder="0"
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 rounded-2xl h-12" onClick={closeModal}>Abort</Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/10 transition-all active:scale-95"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? "Syncing..." : "Commit Asset"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
