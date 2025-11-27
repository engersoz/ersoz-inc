import React, { useState } from 'react';
import { Upload, Image, FileText, Trash2, Download, Eye, Folder, Plus, Search } from 'lucide-react';

const MediaLibraryPage: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: 'all', name: 'All Media', count: 42 },
    { id: 'logo', name: 'Logo & Branding', count: 5 },
    { id: 'hero', name: 'Hero Images', count: 8 },
    { id: 'products', name: 'Product Images', count: 24 },
    { id: 'certificates', name: 'Certificates', count: 3 },
    { id: 'team', name: 'Team Photos', count: 2 }
  ];

  const mediaFiles = [
    { id: 1, name: 'company-logo.png', type: 'image', size: '45 KB', folder: 'logo', url: '/uploads/logo.png', uploadedAt: '2024-11-20' },
    { id: 2, name: 'hero-banner-1.jpg', type: 'image', size: '1.2 MB', folder: 'hero', url: '/uploads/hero1.jpg', uploadedAt: '2024-11-19' },
    { id: 3, name: 'product-mosaic-1.jpg', type: 'image', size: '850 KB', folder: 'products', url: '/uploads/product1.jpg', uploadedAt: '2024-11-18' },
    { id: 4, name: 'iso-certificate.pdf', type: 'document', size: '320 KB', folder: 'certificates', url: '/uploads/cert.pdf', uploadedAt: '2024-11-15' }
  ];

  const filteredMedia = selectedFolder === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(f => f.folder === selectedFolder);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage your images, logos, and frontend assets</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Folders</h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-sky-50 text-sky-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{folder.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-sky-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, PDF (Max 5MB)</p>
            </div>

            {/* Media Items */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredMedia.map(file => (
                  <div key={file.id} className="group relative bg-gray-50 rounded-lg overflow-hidden border hover:border-sky-400 transition-all">
                    <div className="aspect-square flex items-center justify-center">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button className="p-2 bg-white rounded-full">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {file.type === 'image' ? (
                        <Image className="w-8 h-8 text-gray-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size} • {file.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryPage;
