import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default defineConfig((configEnv) =>
    mergeConfig(
        viteConfig(configEnv),
        defineConfig({
            test: {
                environment: 'happy-dom',
                globals: true,
                include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
            },
        }),
    ),
);
