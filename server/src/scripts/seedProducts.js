const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Real Mossaica Product Data
const mossaicaProducts = [
  // DIGITAL CATEGORY
  {
    name: 'FBLDJ 001 - Digital Mosaic 40x40mm',
    sku: 'FBLDJ-001',
    description: 'Premium digital print glass mosaic tile, 40x40mm. Perfect for modern interior designs with vibrant digital patterns.',
    category: 'Glass Mosaic',
    subcategory: 'Digital',
    price: 45.99,
    unit: 'sqm',
    stock: 500,
    minOrder: 10,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbldj001-1.jpg'],
    specifications: {
      size: '40x40mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Indoor walls',
      resistance: 'Water resistant'
    },
    features: ['Digital print technology', 'High adhesion with Polydot system', 'Easy installation', 'UV resistant colors'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBZDJ 001 - Digital Mosaic 50x50mm',
    sku: 'FBZDJ-001',
    description: 'Large format digital glass mosaic, 50x50mm. Ideal for feature walls and decorative applications.',
    category: 'Glass Mosaic',
    subcategory: 'Digital',
    price: 52.99,
    unit: 'sqm',
    stock: 350,
    minOrder: 10,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbzdj001-1.jpg'],
    specifications: {
      size: '50x50mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Indoor walls',
      resistance: 'Water resistant'
    },
    features: ['Larger format', 'Digital precision printing', 'Polydot backing system', 'Easy maintenance'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBDJ HEXAGONE 001 - Digital Hexagon',
    sku: 'FBDJ-HEX-001',
    description: 'Unique hexagon-shaped digital mosaic. Creates stunning geometric patterns.',
    category: 'Glass Mosaic',
    subcategory: 'Digital',
    price: 58.99,
    unit: 'sqm',
    stock: 280,
    minOrder: 8,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbdj001-1.jpg'],
    specifications: {
      size: 'Hexagon 23mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Indoor walls',
      resistance: 'Water resistant'
    },
    features: ['Hexagonal shape', 'Geometric design capability', 'Digital print', 'Polydot system'],
    isActive: true,
    isFeatured: false
  },

  // POOL CATEGORY
  {
    name: 'FBC 001 - Pool Mosaic',
    sku: 'FBC-001',
    description: 'Classic pool mosaic in ocean blue. Specifically designed for swimming pools with superior water resistance.',
    category: 'Glass Mosaic',
    subcategory: 'Pool',
    price: 38.50,
    unit: 'sqm',
    stock: 800,
    minOrder: 20,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbc001-1.jpg'],
    specifications: {
      size: '25x25mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Matte',
      application: 'Swimming pools',
      resistance: 'Chlorine resistant, UV resistant'
    },
    features: ['Pool certified', 'Chlorine resistant', 'Non-slip surface', 'Fade resistant', 'Polydot system'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBZM 001 - Pool Mosaic 25x25mm',
    sku: 'FBZM-001',
    description: 'Premium pool mosaic series. Durable and beautiful for all pool applications.',
    category: 'Glass Mosaic',
    subcategory: 'Pool',
    price: 35.00,
    unit: 'sqm',
    stock: 920,
    minOrder: 25,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbzm001-1.jpg'],
    specifications: {
      size: '25x25mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Matte',
      application: 'Swimming pools, spas',
      resistance: 'Chlorine resistant, UV resistant'
    },
    features: ['Pool and spa certified', 'Chemical resistant', 'Easy to clean', 'Long-lasting colors'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBY DROP 001 - Pool Drop Shape',
    sku: 'FBY-DROP-001',
    description: 'Unique drop-shaped pool mosaic. Creates elegant water-inspired designs.',
    category: 'Glass Mosaic',
    subcategory: 'Pool',
    price: 42.00,
    unit: 'sqm',
    stock: 450,
    minOrder: 15,
    images: ['https://mossaica.com/uploads/images/mozaikler/fby001-1.jpg'],
    specifications: {
      size: 'Drop shape',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Pool accent walls',
      resistance: 'Chlorine resistant'
    },
    features: ['Unique drop shape', 'Pool certified', 'Artistic design', 'Polydot backing'],
    isActive: true,
    isFeatured: false
  },

  // DECORATION CATEGORY
  {
    name: 'FBA HEXAGONE 001 - Decorative Hexagon',
    sku: 'FBA-HEX-001',
    description: 'Decorative hexagon mosaic for stunning interior designs. Perfect for feature walls.',
    category: 'Glass Mosaic',
    subcategory: 'Decoration',
    price: 48.50,
    unit: 'sqm',
    stock: 380,
    minOrder: 12,
    images: ['https://mossaica.com/uploads/images/mozaikler/fba001-1.jpg'],
    specifications: {
      size: 'Hexagon 23mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Indoor walls, backsplashes',
      resistance: 'Water resistant'
    },
    features: ['Hexagonal geometry', 'Premium finish', 'Modern aesthetic', 'Easy installation'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBLD 001 - Decoration Press 40x40mm',
    sku: 'FBLD-001',
    description: 'Press-molded decorative mosaic with textured surface. Adds depth to any space.',
    category: 'Glass Mosaic',
    subcategory: 'Decoration',
    price: 44.00,
    unit: 'sqm',
    stock: 520,
    minOrder: 10,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbld001-1.jpg'],
    specifications: {
      size: '40x40mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Textured',
      application: 'Indoor walls, bathrooms',
      resistance: 'Moisture resistant'
    },
    features: ['Textured surface', 'Press-molded quality', '3D effect', 'Premium appearance'],
    isActive: true,
    isFeatured: false
  },
  {
    name: 'FBZD 002 - Decoration Press 40x40mm Marble',
    sku: 'FBZD-002',
    description: 'Marble-effect decorative mosaic. Combines elegance with modern manufacturing.',
    category: 'Glass Mosaic',
    subcategory: 'Decoration',
    price: 42.00,
    unit: 'sqm',
    stock: 410,
    minOrder: 10,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbzd002-1.jpg'],
    specifications: {
      size: '40x40mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Marble effect',
      application: 'Indoor walls, kitchens',
      resistance: 'Stain resistant'
    },
    features: ['Marble appearance', 'Luxury finish', 'Easy maintenance', 'Polydot system'],
    isActive: true,
    isFeatured: true
  },
  {
    name: 'FBN 001 - Press Mosaic 25x25mm',
    sku: 'FBN-001',
    description: 'Classic 25x25mm press mosaic. Versatile for any interior application.',
    category: 'Glass Mosaic',
    subcategory: 'Decoration',
    price: 32.50,
    unit: 'sqm',
    stock: 750,
    minOrder: 15,
    images: ['https://mossaica.com/uploads/images/mozaikler/fbn001-1.jpg'],
    specifications: {
      size: '25x25mm',
      thickness: '4mm',
      material: 'Glass',
      finish: 'Glossy',
      application: 'Indoor walls, floors',
      resistance: 'Water resistant'
    },
    features: ['Standard size', 'Versatile application', 'Easy installation', 'Cost-effective'],
    isActive: true,
    isFeatured: false
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      await Product.deleteMany({});
      console.log('🗑️  Cleared existing products');
    }

    // Insert products
    const insertedProducts = await Product.insertMany(mossaicaProducts);
    console.log(`✅ Inserted ${insertedProducts.length} Mossaica products`);

    // Display summary
    console.log('\n📊 Product Summary:');
    console.log(`   Digital: ${mossaicaProducts.filter(p => p.subcategory === 'Digital').length} products`);
    console.log(`   Pool: ${mossaicaProducts.filter(p => p.subcategory === 'Pool').length} products`);
    console.log(`   Decoration: ${mossaicaProducts.filter(p => p.subcategory === 'Decoration').length} products`);
    console.log(`   Total Stock Value: $${mossaicaProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}`);

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
