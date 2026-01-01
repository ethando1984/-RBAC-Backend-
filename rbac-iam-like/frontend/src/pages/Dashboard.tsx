import { Grid, Paper, Typography, Box, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { BarChart, PieChart } from '@mui/x-charts';
import { People, Security, ShoppingCart, Inventory as InventoryIcon } from '@mui/icons-material';

export default function Dashboard() {
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.users.list });
    const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: api.roles.list });
    const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: api.orders.list });
    const { data: inventory } = useQuery({ queryKey: ['inventory'], queryFn: api.inventory.list });

    // 1. Order Status Pie Data
    const statusCounts = (orders || []).reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    const orderPieData = Object.entries(statusCounts).map(([label, value], id) => ({
        id, value: value as number, label
    }));

    // 2. User Active Status Pie Data
    const userActiveCounts = (users || []).reduce((acc: any, user: any) => {
        const status = user.active ? 'Active' : 'Inactive';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    const userPieData = Object.entries(userActiveCounts).map(([label, value], id) => ({
        id, value: value as number, label, color: label === 'Active' ? '#4caf50' : '#f44336'
    }));

    // 3. Inventory Stock Bar Data (Top 6 Items)
    const inventoryBarData = (inventory || []).slice(0, 6).map((item: any) => ({
        name: item.productName.length > 8 ? item.productName.substring(0, 8) + '..' : item.productName,
        stock: item.stockQuantity
    }));

    const SummaryCard = ({ title, value, icon, color }: any) => (
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <Box sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}22`,
                color: color,
                display: 'flex'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                <Typography color="textSecondary" variant="body2">{title}</Typography>
            </Box>
        </Paper>
    );

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard Overview</Typography>
                <Typography variant="body2" color="textSecondary">Last Updated: {new Date().toLocaleTimeString()}</Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}><SummaryCard title="Total Users" value={users?.length || 0} icon={<People />} color="#90caf9" /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard title="Active Roles" value={roles?.length || 0} icon={<Security />} color="#f48fb1" /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard title="Total Orders" value={orders?.length || 0} icon={<ShoppingCart />} color="#a5d6a7" /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard title="SKUs in Stock" value={inventory?.length || 0} icon={<InventoryIcon />} color="#fff59d" /></Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Inventory Chart */}
                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, height: 450 }}>
                        <Typography variant="h6" mb={1}>Stock Levels Comparison</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ width: '100%', height: 350 }}>
                            {inventoryBarData.length > 0 ? (
                                <BarChart
                                    xAxis={[{ scaleType: 'band', data: inventoryBarData.map(d => d.name) }]}
                                    series={[{ data: inventoryBarData.map(d => d.stock), label: 'Current Stock', color: '#90caf9' }]}
                                    margin={{ left: 50, right: 30, top: 30, bottom: 30 }}
                                />
                            ) : <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Typography color="textSecondary">No data</Typography></Box>}
                        </Box>
                    </Paper>
                </Grid>

                {/* Distribution Grid */}
                <Grid item xs={12} lg={5}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, height: 212 }}>
                                <Typography variant="subtitle1" fontWeight="bold">Order Status Distribution</Typography>
                                <Box sx={{ width: '100%', height: 140 }}>
                                    {orderPieData.length > 0 ? (
                                        <PieChart series={[{ data: orderPieData, innerRadius: 20 }]} height={130} />
                                    ) : <Typography mt={4} textAlign="center" color="textSecondary">No orders</Typography>}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, height: 212 }}>
                                <Typography variant="subtitle1" fontWeight="bold">User Account Status</Typography>
                                <Box sx={{ width: '100%', height: 140 }}>
                                    {userPieData.length > 0 ? (
                                        <PieChart series={[{ data: userPieData, innerRadius: 20 }]} height={130} />
                                    ) : <Typography mt={4} textAlign="center" color="textSecondary">No users</Typography>}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
