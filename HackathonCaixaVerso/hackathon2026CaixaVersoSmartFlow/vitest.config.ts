import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ jit: true, tsconfig: './tsconfig.spec.json' })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/**/*.spec.ts',
        'src/test-setup.ts',
        'src/environments/**',
        'src/app/**/*.d.ts',
        'src/app/**/*.model.ts',
        'src/app/**/*.models.ts',
        'src/app/**/*.dto.ts',
        'src/app/**/*.vm.ts',
        'src/app/**/*.type.ts',
        'src/app/**/*.types.ts',
        'src/app/**/*.routes.ts',
        'src/app/**/*.mock.ts',
        'src/app/**/*.mocks.ts',
      ],
    },
  },
});
