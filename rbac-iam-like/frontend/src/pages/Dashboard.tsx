import {
    Users,
    ShieldCheck,
    ShoppingCart,
    Package,
    RefreshCw,
    CheckCircle2,
    Clock,
    ShieldAlert
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('COMPLETED');

    const { data: users, refetch: refetchUsers } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
    const { data: roles, refetch: refetchRoles } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });
    const { data: orders, refetch: refetchOrders } = useQuery({ queryKey: ['orders'], queryFn: api.orders.list });
    const { data: inventory, refetch: refetchInventory } = useQuery({ queryKey: ['inventory'], queryFn: api.inventory.list });

    const handleRefresh = () => {
        refetchUsers();
        refetchRoles();
        refetchOrders();
        refetchInventory();
    };

    // Prepare data for stock level chart
    const stockChartData = (inventory || []).slice(0, 5).map((item: any) => ({
        name: item.productName.length > 10 ? item.productName.substring(0, 10) + '...' : item.productName,
        value: item.stockQuantity
    }));

    const COLORS = ['#3b66f5', '#7694f8', '#ced9fd', '#b1c2fb', '#ebf0fe'];

    const filteredOrders = (orders || []).filter((o: any) => o.status === activeTab);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">System Insights</p>
                    <p className="text-sm text-gray-400">Real-time overview of your infrastructure and business operations</p>
                </div>
                <Button variant="default" className="gap-2 self-start md:self-center" onClick={handleRefresh}>
                    <RefreshCw size={18} /> Refresh Data
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={users?.length || 0}
                    description={`${users?.filter((u: any) => u.active).length || 0} accounts active`}
                    icon={<Users size={20} />}
                />
                <StatCard
                    title="Active Roles"
                    value={roles?.length || 0}
                    description="Across all domains"
                    icon={<ShieldCheck size={20} />}
                />
                <StatCard
                    title="Total Orders"
                    value={orders?.length || 0}
                    description="From last 30 days"
                    icon={<ShoppingCart size={20} />}
                />
                <StatCard
                    title="In Stock SKUs"
                    value={inventory?.length || 0}
                    description="Warehouse A1"
                    icon={<Package size={20} />}
                />
            </div>

            {/* Charts / Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card: Stock Level Analysis */}
                <Card className="lg:col-span-8 flex flex-col">
                    <CardHeader>
                        <CardTitle>Stock Level Analysis</CardTitle>
                        <CardDescription>Comparing current inventory levels across top assets</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px]">
                        {stockChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                                        {stockChartData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                                No inventory data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card A: Items in Stock */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base uppercase tracking-wider text-gray-500">Items in Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(inventory || []).slice(0, 4).map((item: any) => (
                                    <div key={item.productId} className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{item.productName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{item.sku}</p>
                                        </div>
                                        <Badge variant={item.stockQuantity < 20 ? 'danger' : 'secondary'} className="rounded-lg tabular-nums">
                                            {item.stockQuantity}
                                        </Badge>
                                    </div>
                                ))}
                                {(!inventory || inventory.length === 0) && (
                                    <p className="text-xs text-center text-gray-400">No items in stock</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card B: Order Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base uppercase tracking-wider text-gray-500">Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="w-full">
                                    <TabsTrigger value="COMPLETED" className="flex-1 text-[10px] sm:text-xs">COMPLETED</TabsTrigger>
                                    <TabsTrigger value="PENDING" className="flex-1 text-[10px] sm:text-xs">PENDING</TabsTrigger>
                                    <TabsTrigger value="SHIPPED" className="flex-1 text-[10px] sm:text-xs">SHIPPED</TabsTrigger>
                                </TabsList>
                                <TabsContent value={activeTab} className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-gray-900">{filteredOrders.length} Orders</span>
                                        {filteredOrders.length > 0 && <Badge variant="success">Latest</Badge>}
                                    </div>
                                    <div className="space-y-2">
                                        {filteredOrders.slice(0, 3).map((o: any) => (
                                            <div key={o.orderId} className="text-xs font-medium p-2 bg-gray-50 rounded-lg flex items-center justify-between group">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-primary-500" />
                                                    <span className="text-gray-900 underline underline-offset-2">{o.customerName}</span>
                                                </div>
                                                <span className="text-gray-400 font-bold">${Number(o.totalAmount).toFixed(0)}</span>
                                            </div>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <p className="text-xs text-center py-4 text-gray-400">No {activeTab.toLowerCase()} orders found</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Card C: Security Compliance */}
                    <Card>
                        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base uppercase tracking-wider text-gray-500">Security Compliance</CardTitle>
                            <Badge variant="success" className="px-2">Active</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'MFA enforced', checked: true },
                                    { label: 'Least privilege roles reviewed', checked: true },
                                    { label: 'Policy changes audited', checked: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {item.checked ? (
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                        ) : (
                                            <ShieldAlert size={18} className="text-amber-500" />
                                        )}
                                        <span className={`text-sm font-semibold ${item.checked ? "text-gray-900" : "text-gray-500"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
