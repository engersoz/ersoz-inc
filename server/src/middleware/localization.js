// Multi-language and multi-currency middleware

const supportedLanguages = ['en', 'tr', 'de', 'fr', 'es', 'ar'];
const defaultLanguage = 'en';

const supportedCurrencies = ['USD', 'EUR', 'TRY', 'GBP'];
const defaultCurrency = 'USD';

// Exchange rates (would be fetched from external API in production)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  TRY: 32.5,
  GBP: 0.79
};

// Language detection middleware
const languageDetector = (req, res, next) => {
  // Priority: Query param > Header > Cookie > Default
  const langFromQuery = req.query.lang;
  const langFromHeader = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const langFromCookie = req.cookies?.language;

  let detectedLang = langFromQuery || langFromHeader || langFromCookie || defaultLanguage;
  
  // Validate and sanitize
  detectedLang = detectedLang.toLowerCase();
  if (!supportedLanguages.includes(detectedLang)) {
    detectedLang = defaultLanguage;
  }

  req.language = detectedLang;
  res.setHeader('Content-Language', detectedLang);
  
  // Set cookie for persistence
  if (!req.cookies?.language || req.cookies.language !== detectedLang) {
    res.cookie('language', detectedLang, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  next();
};

// Currency detection middleware
const currencyDetector = (req, res, next) => {
  // Priority: Query param > Header > Cookie > Default
  const currencyFromQuery = req.query.currency;
  const currencyFromHeader = req.headers['x-currency'];
  const currencyFromCookie = req.cookies?.currency;

  let detectedCurrency = currencyFromQuery || currencyFromHeader || currencyFromCookie || defaultCurrency;
  
  // Validate and sanitize
  detectedCurrency = detectedCurrency.toUpperCase();
  if (!supportedCurrencies.includes(detectedCurrency)) {
    detectedCurrency = defaultCurrency;
  }

  req.currency = detectedCurrency;
  req.exchangeRate = exchangeRates[detectedCurrency] || 1;
  
  // Set cookie for persistence
  if (!req.cookies?.currency || req.cookies.currency !== detectedCurrency) {
    res.cookie('currency', detectedCurrency, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  next();
};

// Translation helper
const translations = {
  en: {
    common: {
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      products: 'Products',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings'
    },
    errors: {
      notFound: 'Resource not found',
      unauthorized: 'Unauthorized access',
      serverError: 'Internal server error',
      validationError: 'Validation error'
    },
    products: {
      addToQuote: 'Add to Quote',
      viewDetails: 'View Details',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock'
    }
  },
  tr: {
    common: {
      welcome: 'Hoş Geldiniz',
      login: 'Giriş Yap',
      logout: 'Çıkış Yap',
      register: 'Kayıt Ol',
      products: 'Ürünler',
      dashboard: 'Kontrol Paneli',
      profile: 'Profil',
      settings: 'Ayarlar'
    },
    errors: {
      notFound: 'Kaynak bulunamadı',
      unauthorized: 'Yetkisiz erişim',
      serverError: 'Sunucu hatası',
      validationError: 'Doğrulama hatası'
    },
    products: {
      addToQuote: 'Teklif İste',
      viewDetails: 'Detayları Gör',
      outOfStock: 'Stokta Yok',
      inStock: 'Stokta'
    }
  },
  de: {
    common: {
      welcome: 'Willkommen',
      login: 'Anmelden',
      logout: 'Abmelden',
      register: 'Registrieren',
      products: 'Produkte',
      dashboard: 'Dashboard',
      profile: 'Profil',
      settings: 'Einstellungen'
    },
    errors: {
      notFound: 'Ressource nicht gefunden',
      unauthorized: 'Unbefugter Zugriff',
      serverError: 'Interner Serverfehler',
      validationError: 'Validierungsfehler'
    },
    products: {
      addToQuote: 'Zum Angebot hinzufügen',
      viewDetails: 'Details ansehen',
      outOfStock: 'Nicht auf Lager',
      inStock: 'Auf Lager'
    }
  }
};

// Translation function
const translate = (key, lang = defaultLanguage) => {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }
  
  // Fallback to English if translation not found
  if (!value && lang !== defaultLanguage) {
    value = translate(key, defaultLanguage);
  }
  
  return value || key;
};

// Add translation helper to request object
const addTranslationHelper = (req, res, next) => {
  req.t = (key) => translate(key, req.language);
  next();
};

// Currency conversion helper
const convertCurrency = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / (exchangeRates[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (exchangeRates[toCurrency] || 1);
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

// Add currency converter to request object
const addCurrencyHelper = (req, res, next) => {
  req.convertPrice = (amount, fromCurrency = 'USD') => {
    return convertCurrency(amount, fromCurrency, req.currency);
  };
  
  req.formatPrice = (amount, fromCurrency = 'USD') => {
    const converted = convertCurrency(amount, fromCurrency, req.currency);
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      TRY: '₺',
      GBP: '£'
    };
    
    const symbol = currencySymbols[req.currency] || req.currency;
    return `${symbol}${converted.toLocaleString(req.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  next();
};

// Localize response helper
const localizeResponse = (data, language, currency) => {
  if (Array.isArray(data)) {
    return data.map(item => localizeResponse(item, language, currency));
  }
  
  if (typeof data === 'object' && data !== null) {
    const localized = { ...data };
    
    // Handle price fields
    if (data.basePrice || data.price) {
      const priceField = data.basePrice || data.price;
      if (priceField.amount && priceField.currency) {
        localized.localizedPrice = {
          amount: convertCurrency(priceField.amount, priceField.currency, currency),
          currency,
          formatted: formatPrice(priceField.amount, priceField.currency, currency, language)
        };
      }
    }
    
    // Handle translations field
    if (data.translations && data.translations[language]) {
      Object.assign(localized, data.translations[language]);
    }
    
    // Recursively localize nested objects
    Object.keys(localized).forEach(key => {
      if (typeof localized[key] === 'object' && localized[key] !== null) {
        localized[key] = localizeResponse(localized[key], language, currency);
      }
    });
    
    return localized;
  }
  
  return data;
};

// Helper to format price with currency
const formatPrice = (amount, fromCurrency, toCurrency, language) => {
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    TRY: '₺',
    GBP: '£'
  };
  
  const symbol = currencySymbols[toCurrency] || toCurrency;
  return `${symbol}${converted.toLocaleString(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Express middleware to automatically localize all responses
const autoLocalizeResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (data && data.success && data.data) {
      data.data = localizeResponse(data.data, req.language, req.currency);
      data.meta = {
        ...data.meta,
        language: req.language,
        currency: req.currency
      };
    }
    return originalJson(data);
  };
  
  next();
};

module.exports = {
  languageDetector,
  currencyDetector,
  addTranslationHelper,
  addCurrencyHelper,
  autoLocalizeResponse,
  translate,
  convertCurrency,
  formatPrice,
  supportedLanguages,
  supportedCurrencies,
  exchangeRates
};
