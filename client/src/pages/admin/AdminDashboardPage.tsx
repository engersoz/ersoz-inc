import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingQuotes: number;
  recentOrders: any[];
  recentUsers: any[];
  lowStockProducts: any[];
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingQuotes: 0,
    recentOrders: [],
    recentUsers: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In real implementation, these would be actual API calls
      // For now, using mock data
      setStats({
        totalUsers: 247,
        totalProducts: 156,
        totalOrders: 1834,
        totalRevenue: 428950,
        pendingQuotes: 23,
        recentOrders: [
          { id: '1', customer: 'ABC Corp', amount: 5400, status: 'processing', date: '2025-11-25' },
          { id: '2', customer: 'XYZ Ltd', amount: 3200, status: 'shipped', date: '2025-11-24' },
          { id: '3', customer: 'Design Studio', amount: 8900, status: 'delivered', date: '2025-11-24' },
        ],
        recentUsers: [
          { id: '1', name: 'John Smith', email: 'john@example.com', joined: '2025-11-25' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', joined: '2025-11-24' },
          { id: '3', name: 'Mike Williams', email: 'mike@example.com', joined: '2025-11-24' },
        ],
        lowStockProducts: [
          { id: '1', name: 'Glass Mosaic Tile GM-001', stock: 5, sku: 'GM-001' },
          { id: '2', name: 'Ceramic Tile CT-045', stock: 3, sku: 'CT-045' },
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'Products',
      value: stats.totalProducts.toLocaleString(),
      change: '+2.3%',
      trend: 'up',
      icon: Package,
      color: 'bg-orange-500'
    },
    {
      name: 'Pending Quotes',
      value: stats.pendingQuotes.toLocaleString(),
      change: '-3.1%',
      trend: 'down',
      icon: FileText,
      color: 'bg-yellow-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-semibold text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.amount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-4">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-sky-600 font-semibold">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{user.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Low Stock Alert</h3>
              <p className="text-yellow-700 mb-3">The following products are running low on stock:</p>
              <div className="space-y-2">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
