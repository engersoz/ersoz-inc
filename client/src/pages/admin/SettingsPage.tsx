import React, { useState } from 'react';
import { Save, Building2, Mail, DollarSign, Truck, Shield, Bell } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-600 mt-1">Configure your platform preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'company', label: 'Company Info', icon: Building2 },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'payment', label: 'Payment', icon: DollarSign },
              { id: 'shipping', label: 'Shipping', icon: Truck },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input type="text" defaultValue="ERSOZ INC" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
                  <input type="text" defaultValue="Ersoz International Trading Inc." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                  <input type="text" defaultValue="US-123456789" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input type="text" defaultValue="+1-555-0199" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea defaultValue="1234 Business Ave, Suite 500, New York, NY 10001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" rows={3} />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input type="text" placeholder="smtp.gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input type="text" placeholder="587" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" placeholder="noreply@ersozinc.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input type="text" placeholder="ERSOZ INC" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Email Settings
                </button>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Payment Gateways</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="font-semibold">Stripe</p>
                        <p className="text-sm text-gray-500">Credit card processing</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600">Active</span>
                  </label>
                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="font-semibold">PayPal</p>
                        <p className="text-sm text-gray-500">PayPal payments</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">Inactive</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Payment Settings
                </button>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Provider</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                    <option>FedEx</option>
                    <option>UPS</option>
                    <option>DHL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Weight Unit</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                    <option>Pounds (lbs)</option>
                    <option>Kilograms (kg)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Shipping Settings
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto logout after 30 minutes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                </label>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">Order Notifications</p>
                    <p className="text-sm text-gray-500">Email alerts for new orders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Notify when products run low</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">Quote Requests</p>
                    <p className="text-sm text-gray-500">Notify on new quote requests</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600" />
                </label>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <Save className="w-4 h-4" />
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
