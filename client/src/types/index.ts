// User types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'sales' | 'vendor' | 'client'
  company: string
  locale: string
  currency: string
  twoFAEnabled?: boolean
  contactInfo?: {
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  preferences?: {
    units: 'metric' | 'imperial'
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
}

// Product types
export interface ProductImage {
  url: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  tags: string[]
}

export interface ProductVideo {
  url: string
  thumbnail?: string
  title?: string
  duration?: number
  type: 'demo' | 'installation' | 'showcase'
}

export interface ProductSpecifications {
  dimensions?: {
    length: number
    width: number
    thickness: number
  }
  material?: string
  finish?: string
  texture?: string
  usage: string[]
  resistance?: {
    water: boolean
    frost: boolean
    slip?: string
  }
  certifications: string[]
}

export interface PricingTier {
  minQuantity: number
  unitPrice: number
  currency: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category: 'glass_mosaic' | 'ceramic' | 'mural' | 'natural_stone' | 'porcelain'
  subcategory?: string
  brand?: string
  SKU: string
  basePrice: number
  baseCurrency: string
  images: ProductImage[]
  videos?: ProductVideo[]
  specifications: ProductSpecifications
  pricing: {
    tiers: PricingTier[]
    laborCostMultiplier: number
    wasteFactor: number
  }
  tags: string[]
  searchKeywords: string[]
  status: 'active' | 'inactive' | 'discontinued' | 'seasonal'
  availabilityStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order' | 'discontinued'
  analytics: {
    views: number
    configurationCount: number
    quoteRequests: number
    orders: number
  }
  createdAt: string
  updatedAt: string
}

// Configuration types
export interface ConfigurationProduct {
  productId: string
  product?: Product
  selectedOptions: {
    color?: string
    size?: string
    pattern?: string
    finish?: string
    customizations: Array<{
      type: string
      value: string
      priceModifier: number
    }>
  }
  quantity: {
    area: number
    pieces?: number
    wastePercentage: number
  }
  pricing: {
    unitPrice: number
    subtotal: number
    wasteAmount?: number
    customizationCost?: number
    totalCost: number
  }
  notes?: string
}

export interface Configuration {
  id: string
  userId: string
  projectName?: string
  projectInfo: {
    areaDetails: {
      totalArea: number
      unit: 'sqft' | 'sqm'
      rooms: Array<{
        name: string
        area: number
        usage: string
      }>
    }
    location: {
      type: 'interior' | 'exterior'
      environment: 'dry' | 'wet' | 'submerged'
    }
  }
  products: ConfigurationProduct[]
  uploadedFiles: Array<{
    url: string
    filename: string
    originalName: string
    fileType: 'image' | 'cad' | 'sketch' | 'document'
    size: number
    uploadedAt: string
    description?: string
  }>
  calculations: {
    totalArea: number
    totalCost: number
    breakdown: {
      materials: number
      waste: number
      customizations: number
      laborEstimate: number
    }
    currency: string
    lastCalculatedAt: string
  }
  preferences: {
    includeLaborEstimate: boolean
    includeWasteFactor: boolean
    preferredUnits: 'metric' | 'imperial'
  }
  notes?: string
  status: 'draft' | 'calculated' | 'saved' | 'quote_requested' | 'quote_received' | 'approved' | 'ordered' | 'archived'
  createdAt: string
  updatedAt: string
}

// Quote types
export interface QuoteProduct {
  productId: string
  product?: Product
  specifications: {
    color?: string
    size?: string
    pattern?: string
    finish?: string
    customOptions: Array<{
      option: string
      value: string
    }>
  }
  quantity: {
    area: number
    pieces?: number
    unit: 'sqft' | 'sqm' | 'pieces'
  }
  usage?: string
  notes?: string
  quotedPrice?: {
    unitPrice: number
    totalPrice: number
    discountPercent?: number
    discountAmount?: number
    finalPrice: number
  }
}

export interface QuoteRequest {
  id: string
  quoteNumber: string
  userId: string
  configurationId?: string
  clientInfo: {
    companyName: string
    contactPerson: string
    email: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  projectDetails?: {
    name?: string
    type: 'residential' | 'commercial' | 'industrial'
    timeline?: {
      startDate?: string
      completionDate?: string
      urgency: 'low' | 'medium' | 'high' | 'rush'
    }
    location?: {
      address?: string
      accessRequirements?: string
      specialInstructions?: string
    }
  }
  products: QuoteProduct[]
  attachments: Array<{
    url: string
    filename: string
    originalName: string
    fileType: 'image' | 'cad' | 'pdf' | 'document' | 'sketch'
    size: number
    description?: string
    category: 'reference' | 'blueprint' | 'inspiration' | 'technical' | 'other'
    uploadedAt: string
  }>
  status: 'new' | 'reviewing' | 'calculating' | 'quote_prepared' | 'quote_sent' | 'negotiating' | 'approved' | 'rejected' | 'expired' | 'converted'
  quote?: {
    totalAmount: number
    currency: string
    taxAmount?: number
    shippingCost?: number
    discounts: Array<{
      type: 'percentage' | 'fixed' | 'bulk' | 'seasonal'
      value: number
      description: string
    }>
    terms?: {
      validUntil?: string
      paymentTerms?: string
      deliveryTime?: string
      warranty?: string
      additionalTerms: string[]
    }
    breakdown: Array<{
      description: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
  }
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pages: number
    total: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
  twoFactorToken?: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  company: string
  role?: 'client' | 'vendor'
  locale?: string
  currency?: string
}

// Filter types
export interface ProductFilters {
  category?: string
  subcategory?: string
  brand?: string
  priceRange?: {
    min: number
    max: number
  }
  usage?: string[]
  inStock?: boolean
  search?: string
  sortBy?: 'name' | 'price' | 'views' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
