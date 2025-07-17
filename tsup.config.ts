import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.ts'],
  format: ['esm'],
  target: 'es2022',
  sourcemap: true,
  clean: true,
  splitting: false,
  dts: true,
});