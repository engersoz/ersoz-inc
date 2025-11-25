import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Stats {
  totalOrders: number;
  pendingQuotes: number;
  totalSpent: number;
  activeProjects: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingQuotes: 0,
    totalSpent: 0,
    activeProjects: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with real API calls
      setStats({
        totalOrders: 24,
        pendingQuotes: 3,
        totalSpent: 45780,
        activeProjects: 5
      });
      
      setRecentOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          date: '2024-01-15',
          total: 5670,
          status: 'delivered',
          items: 12
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          date: '2024-01-18',
          total: 3240,
          status: 'processing',
          items: 8
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          date: '2024-01-20',
          total: 8950,
          status: 'shipped',
          items: 15
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes,
      icon: FileText,
      color: 'yellow',
      change: '3 waiting'
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Package,
      color: 'purple',
      change: '2 in progress'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      delivered: 'bg-green-100 text-green-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <Link to="/orders" className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-sky-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.items} items • {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.total.toLocaleString()}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center justify-between p-4 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="w-5 h-5 text-sky-600" />
                    <span className="font-medium text-gray-900">Browse Products</span>
                  </div>
                  <span className="text-sky-600 group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  to="/quotes"
                  className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Request Quote</span>
                  </div>
                  <span className="text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  to="/configurator"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Design Custom</span>
                  </div>
                  <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-soft p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Account Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{user?.company}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">N/A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
