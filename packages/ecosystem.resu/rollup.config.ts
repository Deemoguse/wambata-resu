import { createRequire } from 'module'
import { defineConfig } from 'rollup'
import { execSync } from 'child_process'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

const require = createRequire(import.meta.url)
const packageJson = require('./package.json')

// Generate types:
const command = `tsc --emitDeclarationOnly --declaration --declarationDir dist/types`
execSync(command, { stdio: 'inherit' })

export default defineConfig({
	input: 'src/index.ts',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: false,
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: false,
		},
	],
	plugins: [
		terser(),
		typescript(),
	],
});
