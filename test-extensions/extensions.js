import { expect } from '@playwright/test';

expect.extend({
  toBeInteger(received) {
    const pass = Number.isInteger(received);
    return {
      message: () => `Expected ${received} to be an integer`,
      pass,
    };
  },
});
export { expect };
