import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, FileText } from 'lucide-react';

interface Quote {
  _id: string;
  quoteNumber: string;
  customer: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  items: Array<{
    product: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const QuotesManagementPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      // Mock data with Mossaica products
      setQuotes([
        {
          _id: '1',
          quoteNumber: 'QT-2025-001',
          customer: {
            name: 'Premium Tiles Ltd',
            email: 'purchasing@premiumtiles.com',
            company: 'Premium Tiles Ltd',
            phone: '+1-555-0123'
          },
          items: [
            { product: '1', productName: 'FBLDJ 40x40mm Digital Mosaic - White', quantity: 100, unitPrice: 45.00, total: 4500.00 },
            { product: '2', productName: 'FBZD 40x40mm Decoration - Marble', quantity: 75, unitPrice: 42.00, total: 3150.00 }
          ],
          subtotal: 7650.00,
          discount: 765.00,
          tax: 688.50,
          totalAmount: 7573.50,
          status: 'pending',
          validUntil: '2025-12-15T23:59:59Z',
          notes: 'Bulk order discount applied',
          createdAt: '2025-11-20T10:30:00Z',
          updatedAt: '2025-11-20T10:30:00Z'
        },
        {
          _id: '2',
          quoteNumber: 'QT-2025-002',
          customer: {
            name: 'Modern Architecture Studio',
            email: 'projects@modernarch.com',
            company: 'Modern Architecture Studio',
            phone: '+1-555-0456'
          },
          items: [
            { product: '3', productName: 'FBC 001 Pool Mosaic - Ocean Blue', quantity: 200, unitPrice: 38.50, total: 7700.00 },
            { product: '4', productName: 'FBZM 25x25mm Pool Series', quantity: 150, unitPrice: 35.00, total: 5250.00 }
          ],
          subtotal: 12950.00,
          discount: 1295.00,
          tax: 1165.50,
          totalAmount: 12820.50,
          status: 'approved',
          validUntil: '2025-12-20T23:59:59Z',
          notes: 'Pool renovation project - 3 locations',
          createdAt: '2025-11-18T14:20:00Z',
          updatedAt: '2025-11-25T09:15:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (quote: Quote) => {
    setViewingQuote(quote);
    setShowModal(true);
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      setQuotes(quotes.map(q => q._id === quoteId ? { ...q, status: newStatus } : q));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Update failed');
    }
  };

  const handleDelete = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      setQuotes(quotes.filter(q => q._id !== quoteId));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Delete failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'converted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes Management</h1>
          <p className="text-gray-600 mt-1">Manage customer quote requests</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
          <Plus className="w-5 h-5" />
          Create Quote
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Quote #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No quotes found</td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{quote.quoteNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{quote.customer.name}</p>
                        <p className="text-sm text-gray-500">{quote.customer.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">${quote.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={quote.status}
                        onChange={(e) => handleUpdateStatus(quote._id, e.target.value as Quote['status'])}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleView(quote)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(quote._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

      {/* View Modal */}
      {showModal && viewingQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Quote Details - {viewingQuote.quoteNumber}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{viewingQuote.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-bold text-2xl text-sky-600">${viewingQuote.totalAmount.toFixed(2)}</p>
              </div>
              <button onClick={() => { setShowModal(false); setViewingQuote(null); }} className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesManagementPage;
