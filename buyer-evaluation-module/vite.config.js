import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone harness config. Resolves node_modules from the parent repo, so no
// separate `npm install` is needed — run `npx vite` from this folder.
export default defineConfig({
  plugins: [react()],
});
