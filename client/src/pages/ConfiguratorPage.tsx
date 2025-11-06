import React, { useState } from 'react';
import { 
  Grid, 
  Palette, 
  Ruler, 
  Layers,
  Download,
  Save,
  RotateCcw,
  Zap
} from 'lucide-react';

const ConfiguratorPage: React.FC = () => {
  const [gridSize, setGridSize] = useState({ width: 10, height: 10 });
  const [selectedPattern, setSelectedPattern] = useState('mosaic');
  const [selectedColor, setSelectedColor] = useState('#0ea5e9');
  const [showGrid, setShowGrid] = useState(true);

  const patterns = [
    { id: 'mosaic', name: 'Mosaic', icon: Grid },
    { id: 'subway', name: 'Subway', icon: Layers },
    { id: 'herringbone', name: 'Herringbone', icon: Zap },
    { id: 'hexagon', name: 'Hexagon', icon: Grid }
  ];

  const colors = [
    { name: 'Sky Blue', hex: '#0ea5e9' },
    { name: 'Purple', hex: '#d946ef' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Slate', hex: '#64748b' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#000000' }
  ];

  const renderPreview = () => {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-xl overflow-hidden">
        {showGrid && (
          <div 
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize.width}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize.height}, 1fr)`,
              gap: '2px'
            }}
          >
            {Array.from({ length: gridSize.width * gridSize.height }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
                style={{
                  backgroundColor: i % 3 === 0 ? selectedColor : '#f3f4f6'
                }}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Click tiles to customize</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tile Configurator</h1>
          <p className="text-gray-600">Design your custom tile pattern</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Preview</h2>
                <div className="flex items-center space-x-2">
                  <button className="btn-ghost btn-sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </button>
                  <button className="btn-secondary btn-sm">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button className="btn-primary btn-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
              {renderPreview()}
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-soft p-4">
                <Ruler className="w-6 h-6 text-sky-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Dimensions</p>
                <p className="text-xs text-gray-600">{gridSize.width} × {gridSize.height}</p>
              </div>
              <div className="bg-white rounded-xl shadow-soft p-4">
                <Grid className="w-6 h-6 text-sky-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Pattern</p>
                <p className="text-xs text-gray-600">{selectedPattern}</p>
              </div>
              <div className="bg-white rounded-xl shadow-soft p-4">
                <Palette className="w-6 h-6 text-sky-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Primary Color</p>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <p className="text-xs text-gray-600">{selectedColor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div>
            {/* Pattern Selection */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Grid className="w-5 h-5 mr-2" />
                Pattern
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {patterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPattern === pattern.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <pattern.icon className={`w-6 h-6 mx-auto mb-2 ${
                      selectedPattern === pattern.id ? 'text-sky-600' : 'text-gray-400'
                    }`} />
                    <p className="text-sm font-medium text-gray-900">{pattern.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Colors
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    className={`group relative w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColor === color.hex
                        ? 'border-sky-500 scale-110'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full border-2 border-gray-900" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Size */}
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Ruler className="w-5 h-5 mr-2" />
                Grid Size
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width: {gridSize.width}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={gridSize.width}
                    onChange={(e) => setGridSize({ ...gridSize, width: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height: {gridSize.height}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={gridSize.height}
                    onChange={(e) => setGridSize({ ...gridSize, height: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="font-bold text-gray-900 mb-4">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Show Grid Lines</span>
                </label>
              </div>

              <button className="w-full btn-primary mt-6">
                Request Quote for This Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorPage;
