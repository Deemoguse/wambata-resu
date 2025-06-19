import { _Logger } from '../../logger';
import { _Helpers } from './private.helpers';

export namespace _Error
{
	const ERROR_SYMBOL = Symbol()

	// ---------------------------------------------------------------------

	/**
	 * Create new result with error.
	 *
	 * @template D Optional error data.
	 * @template T Optional error tag.
	 */
	export type Error<
		D extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultConstructor<'error', D, T>

	/**
	 * Create new result with error.
	 *
	 * @template D Optional error data.
	 * @template T Optional error tag.
	 */
	export function Error<
		D extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> (
		params?: _Helpers.Result.Params<D, T>
	):
		Error<D, T>
	{
		const result = {
			status: 'error' as const,
			data: (params?.data || null) as D,
			tag: (params?.tag || null) as T,
			[ERROR_SYMBOL]: ERROR_SYMBOL,
		}

		const logAllowed = params?.log ?? _Logger.LogErrorResult
		if (logAllowed && _Logger.Engine) _Logger.Engine!(result)

		return result
	}

	// ---------------------------------------------------------------------

	/**
	 * Check if the value is a success result.
	 *
	 * @template V Source value.
	 */
	export type IsError<V> =
		| V extends Error<any, any> ? true : false

	/**
	 * Check if the value is a success result.
	 *
	 * @param value - Source value.
	 */
	export function IsError (value: unknown): value is AnyError {
		const isObject = value !== null && typeof value === 'object'
		if (!isObject) return false

		const hasSymbolOkSymbol = (value as any)[ERROR_SYMBOL] === ERROR_SYMBOL
		return hasSymbolOkSymbol
	}

	// ---------------------------------------------------------------------

	/**
	 * Create a new error result from the passed value. If the passed value
	 * is already a result, then its `status` and `tag` will be overwritten
	 * with new ones.
	 *
	 * @template value Source value.
	 * @template tag Optional tag.
	 */
	export type ErrorFrom<
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultFrom<'error', V, T>

	/**
	 * Create a new error result from the passed value. If the passed value
	 * is already a result, then its `status` and `tag` will be overwritten
	 * with new ones.
	 *
	 * @param value - Source value.
	 * @param tag - Optional tag.
	 */
	export function ErrorFrom<
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> (
		value: V,
		tag?: T
	):
		ErrorFrom<V, T>
	{
		const result = IsError(value)
			? Error({ ...value, tag: tag || value.tag })
			: Error({ data: value, tag })

		return result as ErrorFrom<V, T>
	}

	// ---------------------------------------------------------------------

	/**
	 * Error with a tag and no data.
	 *
	 * @template Tag Error tag.
	 */
	export type TaggedError<Tag extends _Helpers.Result.SomeTag> =
		| Error<null, Tag>

	/**
	 * Error with any type of data and with any tag.
	 */
	export type AnyError =
		| Error<_Helpers.Result.SomeData, _Helpers.Result.SomeTag>
}