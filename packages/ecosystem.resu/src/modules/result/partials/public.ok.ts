import { _Error } from '../partials/public.error'
import { _Logger } from '../../logger'
import { _Helpers } from './private.helpers'

export namespace _Ok
{
	export const OK_SYMBOL = Symbol()

	// ---------------------------------------------------------------------

	/**
	 * Create new result with success.
	 *
	 * @template D Optional success data.
	 * @template Y Optional success tag.
	 */
	export type Ok<
		D extends _Helpers.Result.SomeData = null,
		Y extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultConstructor<'ok', D, Y>

	/**
	 * Create new result with success.
	 *
	 * @template D Optional success data.
	 * @template T Optional success tag.
	 */
	export function Ok<
		D extends _Helpers.Result.SomeData = null,
		const T extends _Helpers.Result.SomeTag = null,
	> (
		params?: _Helpers.Result.Params<D, T>
	):
		Ok<D, T>
	{
		const result = _Helpers.Result.ResultConstructor(OK_SYMBOL, { status: 'ok', ...params })

		const logAllowed = params?.log ?? _Logger.LogOkResult
		if (logAllowed && _Logger.Engine) _Logger.Engine!(result)

		return result
	}

	// ---------------------------------------------------------------------

	/**
	 * Check if the value is a success result.
	 *
	 * @template V Source value.
	 */
	export type IsOk<V> =
		| V extends Ok<any, any> ? true : false

	/**
	 * Check if the value is a success result.
	 *
	 * @param value - Source value.
	 */
	export function IsOk (value: unknown): value is AnyOk {
		const isObject = value !== null && typeof value === 'object'
		if (!isObject) return false

		const hasSymbolOkSymbol = (value as any)[OK_SYMBOL] === OK_SYMBOL
		return hasSymbolOkSymbol
	}

	// ---------------------------------------------------------------------

	/**
	 * Create a new success result from the passed value. If the passed value
	 * is already a result, then its `status` and `tag` will be overwritten
	 * with new ones.
	 *
	 * @template V Source value.
	 * @template T Optional tag.
	 */
	export type OkFrom<
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultFrom<'ok', V, T>

	/**
	 * Create a new success result from the passed value. If the passed value
	 * is already a result, then its `status` and `tag` will be overwritten
	 * with new ones.
	 *
	 * @param value - Source value.
	 * @param tag - Optional tag.
	 */
	export function OkFrom<
		D extends _Helpers.Result.SomeData = null,
		const T extends _Helpers.Result.SomeTag = null,
	> (
		data: D,
		tag?: T
	):
		OkFrom<D, T>
	{
		const isOk = IsOk(data)
		if (isOk) return Ok({ ...data, tag: tag !== undefined ? tag : data.tag }) as OkFrom<D, T>

		const isError = _Error.IsError(data)
		if (isError) return Ok({ data: data.data, tag: tag !== undefined ? tag : data.tag }) as OkFrom<D, T>

		return Ok({ data, tag }) as OkFrom<D, T>
	}

	// ---------------------------------------------------------------------

	/**
	 * Create a new `Result.Ok` from the result if it is not an instance
	 * of `Result.Error`. If the passed value is already a `Result.Ok`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @template D Source value.
	 * @template T Optional tag.
	 */
	export type OkFromUnlessError<
		D extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null
	> =
		| D extends { status: 'error' } ? D : OkFrom<D, T>

	/**
	 * Create a new `Result.Ok` from the result if it is not an instance
	 * of `Result.Error`. If the passed value is already a `Result.Ok`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @param value - Source value.
	 * @param tag - Optional tag.
	 */
	export function OkFromUnlessError<
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> (
		value: V,
		tag?: T
	):
		OkFromUnlessError<V, T>
	{
		const result = _Error.IsError(value) ? value : OkFrom(value, tag)
		return result as OkFromUnlessError<V, T>
	}

	// ---------------------------------------------------------------------

	/**
	 * Success result with a tag and no data.
	 *
	 * @template Tag Error tag.
	 */
	export type TaggedOk <Tag extends _Helpers.Result.SomeTag> =
		| Ok<null, Tag>

	/**
	 * Success result with any type of data and with any tag.
	 */
	export type AnyOk =
		| Ok<_Helpers.Result.SomeData, _Helpers.Result.SomeTag>

	/**
	 * Extract all ok results from value
	 *
	 * @template Value Source value.
	 */
	export type ExtractOk <Value> =
		| Value extends infer U
			? IsOk<U> extends true ? U : never
			: never

	/**
	 * Exclude all ok results from value
	 *
	 * @template Value Source value.
	 */
	export type ExcludeOk <Value> =
		| Value extends infer U
			? IsOk<U> extends true ? never : U
			: never
}