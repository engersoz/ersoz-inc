// Test setup file
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ersoz_test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';

// Mock external services for testing
jest.setTimeout(10000);

beforeAll(async () => {
  // Test setup
});

afterAll(async () => {
  // Test cleanup
});
