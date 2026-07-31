// tests/llm.test.js — unit tests for functions/_lib/llm.js
//
// Verifies:
//   - provider auto-detection from whichever credentials are present
//   - explicit LLM_PROVIDER overrides detection
//   - generic LLM_* vars win over the vendor-specific fallbacks
//   - cloud providers require a key; a local server does not
//   - unknown/missing providers fail closed with a message instead of throwing
//   - each provider's response envelope is unwrapped to plain text

import { resolveConfig, extractReply, PROVIDERS } from '../functions/_lib/llm.js';

export function run({ test, assertTrue, assertEq }) {
  test('no configuration at all is not enabled', () => {
    const cfg = resolveConfig({});
    assertEq(cfg.configured, false);
    assertTrue(cfg.error.includes('LLM_PROVIDER'), 'should name the var to set');
  });

  test('detects anthropic from ANTHROPIC_API_KEY', () => {
    const cfg = resolveConfig({ ANTHROPIC_API_KEY: 'sk-ant-test' });
    assertEq(cfg.provider, 'anthropic');
    assertEq(cfg.configured, true);
    assertEq(cfg.model, 'claude-sonnet-4-6');
  });

  test('detects openai from OPENAI_API_KEY', () => {
    const cfg = resolveConfig({ OPENAI_API_KEY: 'sk-test' });
    assertEq(cfg.provider, 'openai');
    assertEq(cfg.configured, true);
  });

  test('detects local from LLM_BASE_URL with no key', () => {
    const cfg = resolveConfig({ LLM_BASE_URL: 'http://127.0.0.1:1234/v1' });
    assertEq(cfg.provider, 'local');
    assertEq(cfg.configured, true);
    assertEq(cfg.apiKey, '');
  });

  test('explicit LLM_PROVIDER beats detection', () => {
    // A stray Anthropic key must not hijack an explicitly local setup.
    const cfg = resolveConfig({ LLM_PROVIDER: 'local', ANTHROPIC_API_KEY: 'sk-ant-test' });
    assertEq(cfg.provider, 'local');
  });

  test('local defaults to the LM Studio endpoint and a 7B instruct model', () => {
    const cfg = resolveConfig({ LLM_PROVIDER: 'local' });
    assertEq(cfg.baseUrl, 'http://127.0.0.1:1234/v1');
    assertEq(cfg.model, 'qwen2.5-7b-instruct');
    assertEq(cfg.configured, true);
  });

  test('generic LLM_* vars take precedence over vendor-specific ones', () => {
    const cfg = resolveConfig({
      LLM_PROVIDER: 'anthropic',
      LLM_API_KEY: 'generic-key',
      LLM_MODEL: 'generic-model',
      ANTHROPIC_API_KEY: 'vendor-key',
      ANTHROPIC_MODEL: 'vendor-model',
    });
    assertEq(cfg.apiKey, 'generic-key');
    assertEq(cfg.model, 'generic-model');
  });

  test('vendor-specific vars still work as fallbacks', () => {
    const cfg = resolveConfig({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_MODEL: 'claude-x' });
    assertEq(cfg.model, 'claude-x');
  });

  test('cloud providers without a key fail closed', () => {
    for (const p of ['anthropic', 'openai']) {
      const cfg = resolveConfig({ LLM_PROVIDER: p });
      assertEq(cfg.configured, false, `${p} should require a key`);
      assertTrue(cfg.error.includes('LLM_API_KEY'), `${p} error should name LLM_API_KEY`);
    }
  });

  test('unknown provider fails closed and lists the valid ones', () => {
    const cfg = resolveConfig({ LLM_PROVIDER: 'gemini' });
    assertEq(cfg.configured, false);
    for (const p of PROVIDERS) {
      assertTrue(cfg.error.includes(p), `error should mention ${p}`);
    }
  });

  test('provider name is case-insensitive', () => {
    assertEq(resolveConfig({ LLM_PROVIDER: 'LOCAL' }).provider, 'local');
  });

  test('trailing slashes are stripped from the base URL', () => {
    const cfg = resolveConfig({ LLM_PROVIDER: 'local', LLM_BASE_URL: 'http://host:1234/v1///' });
    assertEq(cfg.baseUrl, 'http://host:1234/v1');
  });

  test('extractReply unwraps the anthropic envelope', () => {
    assertEq(extractReply('anthropic', { content: [{ text: 'hello' }] }), 'hello');
  });

  test('extractReply unwraps the openai/local envelope', () => {
    const env = { choices: [{ message: { content: 'hello' } }] };
    assertEq(extractReply('openai', env), 'hello');
    assertEq(extractReply('local', env), 'hello');
  });

  test('extractReply strips local reasoning scratchpads', () => {
    const env = { choices: [{ message: { content: '<think>musing</think>\n\nthe answer' } }] };
    assertEq(extractReply('local', env), 'the answer');
  });

  test('extractReply returns empty string on a malformed envelope', () => {
    assertEq(extractReply('openai', {}), '');
    assertEq(extractReply('anthropic', { content: [] }), '');
  });
}
