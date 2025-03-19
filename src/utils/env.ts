/**
 * Safely get environment variables in a way that works in both browser and test environments
 */

// Default test keys to use in test environment
const TEST_KEYS = {
  VITE_GEMINI_API_KEY: 'test-gemini-key',
  OPENAI_API_KEY: 'test-openai-key',
  HF_API_KEY: 'test-huggingface-key'
};

/**
 * Get an environment variable safely
 * @param key The environment variable key
 * @param defaultValue Default value if not found
 * @returns The environment variable value
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // In test environment, return test keys
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return (TEST_KEYS as any)[key] || defaultValue;
  }
  
  // In browser environment
  try {
    // @ts-ignore - TypeScript doesn't like dynamic access to import.meta.env
    const value = import.meta.env[key];
    return value || defaultValue;
  } catch (e) {
    console.warn(`Could not access import.meta.env.${key}, using default value`);
    return defaultValue;
  }
} 