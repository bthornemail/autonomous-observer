// Silence noisy logs during tests to improve readability & performance
// Keep warnings and errors to not hide potential issues
const noop = () => {};

beforeAll(() => {
  // If VERBOSE_TEST_LOGS is set, don't silence logs
  if (process.env.VERBOSE_TEST_LOGS === '1') return;

  jest.spyOn(console, 'log').mockImplementation(noop);
  jest.spyOn(console, 'info').mockImplementation(noop);
  // Leave console.warn and console.error as-is for visibility
});
