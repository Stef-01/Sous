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
