/**
 * AI Provider Factory
 *
 * Returns the appropriate AI provider based on environment configuration.
 * If ANTHROPIC_API_KEY is available, uses ClaudeAIProvider.
 * Otherwise falls back to MockAIProvider (deterministic).
 *
 * The provider is cached for the lifetime of the process.
 */

import type { AIProvider } from "./contracts";

let _provider: AIProvider | null = null;

export async function getAIProvider(): Promise<AIProvider> {
  if (_provider) return _provider;

  if (process.env.ANTHROPIC_API_KEY) {
    // Lazy import to avoid loading AI SDK when not needed
    const { ClaudeAIProvider } = await import("./providers/claude");
    _provider = new ClaudeAIProvider();
  } else {
    const { MockAIProvider } = await import("./providers/mock");
    _provider = new MockAIProvider();
  }

  return _provider;
}

/**
 * Safe wrapper that catches any provider errors and falls back to mock.
 * Use this at API boundaries.
 */
export async function withFallback<T>(
  fn: (provider: AIProvider) => Promise<T>,
  fallbackFn: (provider: AIProvider) => Promise<T>,
): Promise<T> {
  const provider = await getAIProvider();
  try {
    return await fn(provider);
  } catch (error) {
    console.error("AI provider error, using mock fallback:", error);
    const { MockAIProvider } = await import("./providers/mock");
    const mock = new MockAIProvider();
    return fallbackFn(mock);
  }
}
