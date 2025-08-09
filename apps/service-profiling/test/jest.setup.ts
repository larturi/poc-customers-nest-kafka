import 'reflect-metadata';

// Configuración global para tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock de console.log para evitar ruido en los tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
