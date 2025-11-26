import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    company: string;
  };
  items: Array<{
    product: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

const OrdersManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2025-001',
          customer: { name: 'ABC Corporation', email: 'contact@abc.com', company: 'ABC Corp' },
          items: [
            { product: '1', productName: 'FBLDJ 40x40mm Digital Mosaic', quantity: 50, price: 45.00 },
            { product: '2', productName: 'FBC 001 Pool Mosaic', quantity: 30, price: 38.50 }
          ],
          totalAmount: 3405.00,
          status: 'processing',
          paymentStatus: 'paid',
          shippingAddress: '123 Business St, New York, NY 10001',
          trackingNumber: 'TRK123456789',
          createdAt: '2025-11-25T10:30:00Z'
        },
        {
          _id: '2',
          orderNumber: 'ORD-2025-002',
          customer: { name: 'XYZ Designs', email: 'info@xyz.com', company: 'XYZ Ltd' },
          items: [
            { product: '3', productName: 'FBZD 40x40mm Decoration', quantity: 75, price: 42.00 }
          ],
          totalAmount: 3150.00,
          status: 'shipped',
          paymentStatus: 'paid',
          shippingAddress: '456 Design Ave, Los Angeles, CA 90001',
          trackingNumber: 'TRK987654321',
          createdAt: '2025-11-24T14:20:00Z'
        },
        {
          _id: '3',
          orderNumber: 'ORD-2025-003',
          customer: { name: 'Modern Homes Inc', email: 'orders@modernhomes.com', company: 'Modern Homes' },
          items: [
            { product: '4', productName: 'FBZM 25x25mm Pool Mosaic', quantity: 100, price: 35.00 }
          ],
          totalAmount: 3500.00,
          status: 'pending',
          paymentStatus: 'pending',
          shippingAddress: '789 Home Blvd, Chicago, IL 60601',
          createdAt: '2025-11-26T09:15:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setViewingOrder(null);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // await api.put(`/v1/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Update failed');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      // await api.delete(`/v1/orders/${orderId}`);
      setOrders(orders.filter(o => o._id !== orderId));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Delete failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <button onClick={() => handleEdit({ _id: '', orderNumber: '', customer: { name: '', email: '', company: '' }, items: [], totalAmount: 0, status: 'pending', paymentStatus: 'pending', shippingAddress: '', createdAt: new Date().toISOString() })} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
          <Plus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Order</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500">Track: {order.trackingNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.items.length} item(s)</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value as Order['status'])}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleView(order)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(order._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Edit Modal */}
      {showModal && (viewingOrder || editingOrder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{viewingOrder ? 'Order Details' : 'Edit Order'}</h2>
            </div>
            <div className="p-6 space-y-4">
              {viewingOrder ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold">{viewingOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewingOrder.status)}`}>
                        {getStatusIcon(viewingOrder.status)}
                        {viewingOrder.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold">{viewingOrder.customer.name}</p>
                    <p className="text-sm">{viewingOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Items</p>
                    {viewingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3">
                      <p className="font-bold">Total</p>
                      <p className="font-bold text-lg">${viewingOrder.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Order editing form would go here
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowModal(false); setViewingOrder(null); setEditingOrder(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagementPage;
