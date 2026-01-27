import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = { href: '', reload: vi.fn() };

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.getItem.mockReturnValue(null);
});
