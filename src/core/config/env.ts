import { z } from 'zod';

const EnvSchema = z.object({
  RO_API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  RO_ENABLE_TURBO_DEMO: z.enum(['true', 'false']).default('false'),
});

type RuntimeEnv = Partial<Record<'RO_API_TIMEOUT_MS' | 'RO_ENABLE_TURBO_DEMO', string>>;

function getRuntimeEnv(): RuntimeEnv {
  // [SENIOR_INSIGHT] React Native does not guarantee Node typings in app TS config.
  // We read env values through a runtime-safe guard instead of relying on `process` types.
  const maybeProcess = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const env = maybeProcess.process?.env;
  return {
    ...(env?.RO_API_TIMEOUT_MS ? { RO_API_TIMEOUT_MS: env.RO_API_TIMEOUT_MS } : {}),
    ...(env?.RO_ENABLE_TURBO_DEMO ? { RO_ENABLE_TURBO_DEMO: env.RO_ENABLE_TURBO_DEMO } : {}),
  };
}

const parsed = EnvSchema.safeParse(getRuntimeEnv());

if (!parsed.success) {
  // [SENIOR_INSIGHT] Startup should not crash because CI/mobile runtime might miss non-critical envs.
  // We validate eagerly, but gracefully fallback to sane defaults to keep startup resilient.
  console.warn('[env] Invalid env configuration, using defaults', parsed.error.issues);
}

const values = parsed.success
  ? parsed.data
  : EnvSchema.parse({
      RO_API_TIMEOUT_MS: 10000,
      RO_ENABLE_TURBO_DEMO: 'false',
    });

export const env = {
  apiTimeoutMs: values.RO_API_TIMEOUT_MS,
  turboDemoEnabled: values.RO_ENABLE_TURBO_DEMO === 'true',
};
