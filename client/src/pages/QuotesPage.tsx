import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';

interface Quote {
  _id: string;
  quoteNumber: string;
  product: {
    _id: string;
    name: string;
    SKU: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
  notes?: string;
}

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setQuotes([
        {
          _id: '1',
          quoteNumber: 'QT-2024-001',
          product: {
            _id: '1',
            name: 'Premium Glass Mosaic - Sapphire Blue',
            SKU: 'GM-001'
          },
          quantity: 500,
          unitPrice: 12.50,
          totalPrice: 6250,
          status: 'approved',
          createdAt: '2024-01-15T10:00:00Z',
          validUntil: '2024-02-15T10:00:00Z',
          notes: 'Bulk order discount applied'
        }
      ]);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quote.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Requests</h1>
            <p className="text-gray-600">Manage your product quote requests</p>
          </div>
          <Link to="/products" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            New Quote
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by quote number or product..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{filteredQuotes.length} of {quotes.length} quotes</span>
            </div>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quotes found</h3>
            <p className="text-gray-600 mb-6">Start by browsing products and requesting a quote</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <div key={quote._id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(quote.status)}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-bold text-gray-900">{quote.quoteNumber}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{quote.product.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>SKU: {quote.product.SKU}</span>
                        <span>•</span>
                        <span>Qty: {quote.quantity}</span>
                        <span>•</span>
                        <span>Created: {new Date(quote.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${quote.totalPrice.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">${quote.unitPrice.toFixed(2)} per unit</p>
                  </div>
                </div>

                {quote.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">{quote.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="btn-ghost btn-sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    {quote.status === 'approved' && (
                      <Link to={`/checkout?quote=${quote._id}`} className="btn-primary btn-sm">
                        Place Order
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesPage;
