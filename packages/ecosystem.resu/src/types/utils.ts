import { _Result } from '../modules/result'
import type { FunctionStrictSetting, StrictSetting } from './settings'

export namespace _Utils
{
	/**
	 * Utility to improve type display in IDE.
	 */
	export type Prettify <Source> = Source extends object | any[]
		? {} & { [K in keyof Source]: Source[K] }
		: Source

	/**
	 * Any values other than `void` and `undefined`.
	 */
	export type NotVoidOrUndefined = {} | null | ''
	/**
	 * Resolution values as a result of library methods.
	 */
	export type AllowedReturn = StrictSetting['enable'] extends true
		? _Result.Any
		: NotVoidOrUndefined

	/**
	 * Resolution values as a result of `Flow.Function` methods.
	 */
	export type FunctionAllowedReturn = FunctionStrictSetting['enable'] extends boolean
		? FunctionStrictSetting['enable'] extends true
			? _Result.Any
			: NotVoidOrUndefined
		: AllowedReturn
}
