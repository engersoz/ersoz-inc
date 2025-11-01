const User = require('../src/models/User');
const Product = require('../src/models/Product');

describe('Model Tests', () => {
  describe('User Model', () => {
    it('should have correct schema structure', () => {
      const userSchema = User.schema;
      expect(userSchema.paths.name).toBeDefined();
      expect(userSchema.paths.email).toBeDefined();
      expect(userSchema.paths.role).toBeDefined();
      expect(userSchema.paths.passwordHash).toBeDefined();
    });
  });

  describe('Product Model', () => {
    it('should have correct schema structure', () => {
      const productSchema = Product.schema;
      expect(productSchema.paths.name).toBeDefined();
      expect(productSchema.paths.category).toBeDefined();
      expect(productSchema.paths.SKU).toBeDefined();
      expect(productSchema.paths.basePrice).toBeDefined();
    });
  });
});
