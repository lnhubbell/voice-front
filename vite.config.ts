import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()]
  // base: '',
  // root: 'src',
  // build: {
  //   outDir: '../dist'
  // }
};

export default config;
