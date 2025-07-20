import { basename } from 'path'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// экспортируем массив билдов
export default defineConfig({
	mode: 'lib',

	build: {
		outDir: 'dist',
		lib: {
			entry: './src/index.ts',
		},
		rollupOptions: {
			output: [
				{
					format: 'esm',
					entryFileNames: ({ name }) => `esm/${basename(name)}.js`,
				},
				{
					format: 'cjs',
					entryFileNames: ({ name }) => `cjs/${basename(name)}.js`,
				},
			],
			external: [ 'vue', '@wambata/resu' ],
			treeshake: true,
		}
	},

	plugins: [
		vue(),
		dts({
			rollupTypes: true,
			outDir: 'dist/types',
		})
	],
})
