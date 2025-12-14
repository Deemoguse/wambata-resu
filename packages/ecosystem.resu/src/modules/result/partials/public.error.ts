import { _Ok } from '../partials/public.ok'
import { _Logger } from '../../logger'
import { _Helpers } from './private.helpers'

export namespace _Error
{
	export const ERROR_SYMBOL = Symbol()

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
		const T extends _Helpers.Result.SomeTag = null,
	> (
		params?: _Helpers.Result.Params<D, T>
	):
		Error<D, T>
	{
		const result = _Helpers.Result.ResultConstructor(ERROR_SYMBOL, { status: 'error', ...params })

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
		| V extends { status: 'error' } ? true : false

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
	 * @param data - Source value.
	 * @param tag - Optional tag.
	 */
	export function ErrorFrom<
		D extends _Helpers.Result.SomeData = null,
		const T extends _Helpers.Result.SomeTag = null,
	> (
		data: D,
		tag?: T
	):
		ErrorFrom<D, T>
	{
		const isError = IsError(data)
		if (isError) return Error({ ...data, tag: tag !== undefined ? tag : data.tag }) as ErrorFrom<D, T>

		const IsOk = _Ok.IsOk(data)
		if (IsOk) return Error({ data: data.data, tag: tag !== undefined ? tag : data.tag }) as ErrorFrom<D, T>

		return Error({ data, tag }) as ErrorFrom<D, T>
	}

	// ---------------------------------------------------------------------

	/**
	 * Create a new `Result.Error` from the result if it is not an instance
	 * of `Result.Ok`. If the passed value is already a `Result.Error`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @template V Source value.
	 * @template T Optional tag.
	 */
	export type ErrorFromUnlessOk<
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null
	> =
		| V extends { status: 'ok' } ? V : ErrorFrom<V, T>

	/**
	 * Create a new `Result.Error` from the result if it is not an instance
	 * of `Result.Ok`. If the passed value is already a `Result.Error`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @param data - Source value.
	 * @param tag - Optional tag.
	 */
	export function ErrorFromUnlessOk<
		D extends _Helpers.Result.SomeData = null,
		const T extends _Helpers.Result.SomeTag = null,
	> (
		data: D,
		tag?: T
	):
		ErrorFromUnlessOk<D, T>
	{
		const result = _Ok.IsOk(data) ? data : ErrorFrom(data, tag)
		return result as ErrorFromUnlessOk<D, T>
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

	/**
	 * Extract all error results from value
	 *
	 * @template Value Source value.
	 */
	export type ExtractError <Value> =
		| Value extends infer U
			? IsError<U> extends true ? U : never
			: never

	/**
	 * Exclude all error results from value
	 *
	 * @template Value Source value.
	 */
	export type ExcludeError <Value> =
		| Value extends infer U
			? IsError<U> extends true ? never : U
			: never
}