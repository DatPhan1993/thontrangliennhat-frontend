// This file contains utilities to suppress specific React warnings
// These are typically used for 3rd party libraries that need to be updated

/**
 * Suppresses React lifecycle method warnings in the console
 * This is useful when using 3rd party libraries that still use deprecated lifecycle methods
 */
export const suppressLifecycleWarnings = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      const suppressedWarnings = [
        'Warning: Using UNSAFE_componentWillMount in strict mode is not recommended',
        'Warning: Using UNSAFE_componentWillReceiveProps in strict mode is not recommended',
        'Warning: Using UNSAFE_componentWillUpdate in strict mode is not recommended',
      ];
      
      for (const warning of suppressedWarnings) {
        if (args[0].includes(warning)) {
          return;
        }
      }
    }
    originalConsoleError(...args);
  };
};

export default suppressLifecycleWarnings; 