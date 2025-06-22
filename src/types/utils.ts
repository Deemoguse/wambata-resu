import { _Result } from '../modules/result'
import type { Settings } from './settings'

export namespace Utils
{
	/**
	 * Utility to improve type display in IDE.
	 */
	export type Prettify <Source> = Source extends object | any[]
		? {} & { [K in keyof Source]: Source[K] }
		: Source

	/**
	 * Resolution values as a result of library methods.
	 */
	export type AllowedReturn = Settings['strict'] extends false
		? ({} | null | '' | _Result.Any)
		: _Result.Any
}
