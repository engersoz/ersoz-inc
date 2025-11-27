import React from 'react';
import { config, API_BASE_URL } from '../config';

const ConfigDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">🔧 Configuration Debug</h1>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex">
                  <span className="font-bold w-64">VITE_API_URL:</span>
                  <span className="text-blue-600">{import.meta.env.VITE_API_URL || 'NOT SET'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">MODE:</span>
                  <span className="text-blue-600">{import.meta.env.MODE}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">DEV:</span>
                  <span className="text-blue-600">{String(import.meta.env.DEV)}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">PROD:</span>
                  <span className="text-blue-600">{String(import.meta.env.PROD)}</span>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">Active Configuration</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex">
                  <span className="font-bold w-64">API_BASE_URL (from config):</span>
                  <span className="text-green-600 font-bold">{API_BASE_URL}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">Environment:</span>
                  <span className="text-green-600">{config.environment}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">Is Development:</span>
                  <span className="text-green-600">{String(config.isDevelopment)}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-64">Is Production:</span>
                  <span className="text-green-600">{String(config.isProduction)}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Expected Values:</h3>
              <div className="text-sm space-y-1 text-yellow-700">
                <p>✅ VITE_API_URL should be: <code className="bg-yellow-100 px-1">https://ersoz-inc-api.onrender.com/api</code></p>
                <p>✅ MODE should be: <code className="bg-yellow-100 px-1">production</code></p>
                <p>✅ PROD should be: <code className="bg-yellow-100 px-1">true</code></p>
                <p>✅ API_BASE_URL should be: <code className="bg-yellow-100 px-1">https://ersoz-inc-api.onrender.com/api</code></p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔍 If API_BASE_URL shows incorrect value:</h3>
              <ol className="text-sm space-y-2 text-blue-700 list-decimal list-inside">
                <li>Verify <code className="bg-blue-100 px-1">VITE_API_URL</code> is set in Vercel environment variables</li>
                <li>Ensure it's set for <strong>Production</strong> environment</li>
                <li><strong>Redeploy the project</strong> from Vercel dashboard (Environment variables are build-time, not runtime)</li>
                <li>Wait for deployment to complete (usually 1-2 minutes)</li>
                <li>Refresh this page and verify the values</li>
              </ol>
            </div>

            <div className="pt-4">
              <a 
                href="/admin/login" 
                className="inline-block px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                ← Back to Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigDebugPage;
