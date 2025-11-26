import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$428,950</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% vs last month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,834</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.2% vs last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">247</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +5.1% vs last month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Products Sold</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8,492</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15.3% vs last month
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart.js or Recharts integration</p>
              <p className="text-sm text-gray-400 mt-1">Line chart showing revenue over time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Bar chart integration</p>
              <p className="text-sm text-gray-400 mt-1">Top selling Mossaica products</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Pie chart integration</p>
              <p className="text-sm text-gray-400 mt-1">Orders by status</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Growth</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Area chart integration</p>
              <p className="text-sm text-gray-400 mt-1">New customers over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Sales</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-semibold">FBLDJ 40x40mm Digital</td>
                <td className="px-4 py-3 text-gray-600">Digital Mosaic</td>
                <td className="px-4 py-3">1,245 units</td>
                <td className="px-4 py-3 font-semibold">$56,025</td>
                <td className="px-4 py-3 text-green-600">+18%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">FBC Pool Mosaic</td>
                <td className="px-4 py-3 text-gray-600">Pool Series</td>
                <td className="px-4 py-3">2,130 units</td>
                <td className="px-4 py-3 font-semibold">$81,990</td>
                <td className="px-4 py-3 text-green-600">+22%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">FBZD 40x40mm Decoration</td>
                <td className="px-4 py-3 text-gray-600">Decoration</td>
                <td className="px-4 py-3">980 units</td>
                <td className="px-4 py-3 font-semibold">$41,160</td>
                <td className="px-4 py-3 text-green-600">+15%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
