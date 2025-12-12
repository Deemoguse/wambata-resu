import { _Utils } from '../../../types/utils'

export namespace _Helpers
{
	export namespace Result
	{
		export type SomeData = any | null
		export type SomeTag  = string | null

		/**
		 * Params for `Result.Ok` and `Result.Error` functions.
		 *
		 * @template D Optional data.
		 * @template T Optional tag.
		 */
		export type Params<
			D extends SomeData = null,
			T extends SomeTag = null,
		> = {
			/**
			 * Optional data for the new result.
			 */
			data?: D,
			/**
			 * Optional new result tag.
			 */
			tag?: T,
			/**
			 * Should this result be processed by the logger during creation.
			 * This takes precedence over [`Logger.LogOkResult` or `Logger.LogErrorResult`](../../logger/index.ts).
			 */
			log?: boolean,
		}

		/**
		 * A utilitarian type for creating a new result type.
		 *
		 * @template S Status describing the result.
		 * @template D Optional data.
		 * @template T Optional tag.
		 */
		export type ResultConstructor<
			S extends string,
			D extends SomeData = null,
			T extends SomeTag = null,
		> =
			| _Utils.Prettify<{
				status: S
				tag?: T
				data?: D
			}>

		/**
		 * A utilitarian type for creating a new result type.
		 *
		 * @template S Status describing the result.
		 * @template D Optional data.
		 * @template T Optional tag.
		 */
		export function ResultConstructor <
			S extends string = string,
			D extends SomeData = null,
			const T extends SomeTag = null,
		> (
			symbol: symbol,
			params: ResultConstructor<S, D, T>
		):
			ResultConstructor<S, D, T>
		{
			const dataIsFalsy = [undefined, null, void 0].includes(params.data as any)
			if (dataIsFalsy) params.data = null as D

			// tagIsFalsy:
			params.tag ||= null as T

			return { ...params, [symbol]: symbol }
		}

		/**
		 * Create a new result from the passed value. If the passed value
		 * is already a result, then its `status` and `tag` will be overwritten
		 * with new ones.
		 *
		 * @template S Status describing the result.
		 * @template V Source value.
		 * @template T Optional tag.
		 */
		export type ResultFrom<
			S extends string = string,
			V extends SomeData = null,
			T extends SomeTag = null,
		> =
			| V extends ResultConstructor<string, infer Data, infer Tag>
				? ResultConstructor<S, Data, T extends null ? Tag : T>
				: ResultConstructor<S, V, T>
	}
}