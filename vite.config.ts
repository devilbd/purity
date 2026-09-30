import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import { purityPlugin as decoratorsPlugin } from './src/framework/vite-plugin.ts';

function environmentPlugin(isProd: boolean): Plugin {
    return {
        name: 'purity-environment-plugin',
        enforce: 'pre',
        resolveId(source) {
            if (
                isProd &&
                (source.endsWith('environments/environment') ||
                    source.endsWith('environments/environment.ts') ||
                    source === './environments/environment' ||
                    source === '../environments/environment' ||
                    source === '@environments/environment' ||
                    source === '@environments')
            ) {
                return path.resolve(
                    import.meta.dirname,
                    'src/environments/environment.prod.ts',
                );
            }
            return null;
        },
    };
}

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        plugins: [decoratorsPlugin(), environmentPlugin(isProd)],
        resolve: {
            alias: {
                '@package': path.resolve(import.meta.dirname, 'package.json'),
                'package.json': path.resolve(import.meta.dirname, 'package.json'),
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
            chunkSizeWarningLimit: 800,
            modulePreload: false,
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        if (id.includes('node_modules/sucrase') || id.includes('node_modules/prismjs')) {
                            return 'vendor-compiler';
                        }
                    },
                },
            },
        },
    };
});
