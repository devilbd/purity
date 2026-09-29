import { defineConfig } from 'vite';
import path from 'path';
import { purityPlugin } from './src/framework/vite-plugin.ts';

export default defineConfig({
    plugins: [purityPlugin()],
    build: {
        outDir: 'npm-publish',
        emptyOutDir: false,
        lib: {
            entry: {
                index: path.resolve(import.meta.dirname, 'src/framework/core.ts'),
                vite: path.resolve(import.meta.dirname, 'src/framework/vite-plugin.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['vite', 'path', 'fs'],
            output: {
                exports: 'named',
            },
        },
    },
});
