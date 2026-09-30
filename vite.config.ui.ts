import { defineConfig } from 'vite';
import path from 'path';
import { purityPlugin } from './src/framework/vite-plugin.ts';

export default defineConfig({
    plugins: [purityPlugin()],
    resolve: {
        alias: {
            '@purity/core': path.resolve(import.meta.dirname, 'src/framework/core.ts'),
            '@purity': path.resolve(import.meta.dirname, 'src/framework'),
            '@environments': path.resolve(import.meta.dirname, 'src/environments'),
            '@data': path.resolve(import.meta.dirname, 'src/data'),
            '@pages': path.resolve(import.meta.dirname, 'src/app/pages'),
            '@shared': path.resolve(import.meta.dirname, 'src/app/shared'),
            '@components': path.resolve(import.meta.dirname, 'src/app/shared/components'),
            '@widgets': path.resolve(import.meta.dirname, 'src/app/shared/widgets'),
            '@directives': path.resolve(import.meta.dirname, 'src/app/shared/directives'),
            '@pipes': path.resolve(import.meta.dirname, 'src/app/shared/pipes'),
            '@validators': path.resolve(import.meta.dirname, 'src/app/shared/validators'),
            '@behaviors': path.resolve(import.meta.dirname, 'src/app/shared/behaviors'),
            '@interceptors': path.resolve(import.meta.dirname, 'src/app/shared/interceptors'),
            '@app': path.resolve(import.meta.dirname, 'src/app'),
            '@external': path.resolve(import.meta.dirname, 'src/app/external'),
            '@styles': path.resolve(import.meta.dirname, 'src/styles/index.scss'),
        },
    },
    build: {
        outDir: 'npm-publish-ui',
        emptyOutDir: false,
        lib: {
            entry: {
                index: path.resolve(import.meta.dirname, 'src/ui.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: [
                '@purity/core',
                'purity-world',
                'purity-world/core',
                'purity-world/styles',
            ],
            output: {
                exports: 'named',
                paths: {
                    '@purity/core': 'purity-world/core',
                },
            },
        },
    },
});
