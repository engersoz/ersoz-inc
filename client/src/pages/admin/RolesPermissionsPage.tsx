import React, { useState } from 'react';
import { Shield, Users, Plus, Edit2, Trash2, Check } from 'lucide-react';

const RolesPermissionsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: 'owner', name: 'Owner', description: 'God-mode access to everything', users: 1, color: 'purple' },
    { id: 'super_admin', name: 'Super Admin', description: 'Full admin access with all permissions', users: 2, color: 'red' },
    { id: 'admin', name: 'Admin', description: 'Management access with limited permissions', users: 5, color: 'orange' },
    { id: 'user', name: 'User', description: 'Staff members (Sales, Support, Tech)', users: 12, color: 'blue' },
    { id: 'vendor', name: 'Vendor', description: 'External vendors and suppliers', users: 8, color: 'green' },
    { id: 'customer', name: 'Customer', description: 'External clients and customers', users: 145, color: 'gray' }
  ];

  const modules = [
    { id: 'products', name: 'Products', actions: ['create', 'read', 'update', 'delete', 'export', 'import'] },
    { id: 'orders', name: 'Orders', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { id: 'users', name: 'Users', actions: ['create', 'read', 'update', 'delete'] },
    { id: 'inventory', name: 'Inventory', actions: ['create', 'read', 'update', 'delete'] },
    { id: 'analytics', name: 'Analytics', actions: ['read', 'export'] },
    { id: 'quotes', name: 'Quotes', actions: ['create', 'read', 'update', 'delete'] },
    { id: 'settings', name: 'Settings', actions: ['read', 'update'] },
    { id: 'notifications', name: 'Notifications', actions: ['create', 'read', 'update', 'delete'] }
  ];

  const rolePermissions: Record<string, Record<string, string[]>> = {
    owner: Object.fromEntries(modules.map(m => [m.id, m.actions])),
    super_admin: Object.fromEntries(modules.map(m => [m.id, m.actions])),
    admin: {
      products: ['create', 'read', 'update', 'delete'],
      orders: ['read', 'update'],
      users: ['read'],
      quotes: ['read', 'update'],
      analytics: ['read']
    },
    user: {
      products: ['read'],
      orders: ['create', 'read', 'update'],
      quotes: ['create', 'read', 'update']
    },
    vendor: {
      products: ['create', 'read', 'update'],
      inventory: ['read', 'update']
    },
    customer: {
      products: ['read'],
      quotes: ['create', 'read']
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and access control</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Role
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-lg mb-4">User Roles</h3>
            <div className="space-y-2">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedRole === role.id
                      ? `border-${role.color}-500 bg-${role.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-5 h-5 text-${role.color}-600`} />
                      <span className="font-semibold">{role.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {role.users} users
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold capitalize">{selectedRole.replace('_', ' ')} Permissions</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage what this role can access</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  {!['owner', 'super_admin'].includes(selectedRole) && (
                    <button className="btn-ghost btn-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Create</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Read</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Update</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Delete</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(module => {
                      const permissions = rolePermissions[selectedRole]?.[module.id] || [];
                      return (
                        <tr key={module.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{module.name}</td>
                          <td className="py-3 px-4 text-center">
                            {permissions.includes('create') ? (
                              <Check className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {permissions.includes('read') ? (
                              <Check className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {permissions.includes('update') ? (
                              <Check className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {permissions.includes('delete') ? (
                              <Check className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {permissions.includes('export') ? (
                              <Check className="w-5 h-5 text-green-500 inline" />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedRole === 'owner' && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Owner Role:</strong> Has unrestricted access to all modules and actions. This role cannot be edited or deleted.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Role</h3>
              <p className="text-gray-500">Choose a role from the list to view and manage its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
