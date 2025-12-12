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
	 * @template Data Optional success data.
	 * @template Tag Optional success tag.
	 */
	export type Ok<
		Data extends _Helpers.Result.SomeData = null,
		Tag extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultConstructor<'ok', Data, Tag>

	/**
	 * Create new result with success.
	 *
	 * @template Data Optional success data.
	 * @template Tag Optional success tag.
	 */
	export function Ok<
		Data extends _Helpers.Result.SomeData = null,
		const Tag extends _Helpers.Result.SomeTag = null,
	> (
		params?: _Helpers.Result.Params<Data, Tag>
	):
		Ok<Data, Tag>
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
	 * @template Value Source value.
	 */
	export type IsOk<Value> =
		| Value extends Ok<any, any> ? true : false

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
	 * @template Value Source value.
	 * @template Tag Optional tag.
	 */
	export type OkFrom<
		Value extends _Helpers.Result.SomeData = null,
		Tag extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultFrom<'ok', Value, Tag>

	/**
	 * Create a new success result from the passed value. If the passed value
	 * is already a result, then its `status` and `tag` will be overwritten
	 * with new ones.
	 *
	 * @param value - Source value.
	 * @param tag - Optional tag.
	 */
	export function OkFrom<
		Value extends _Helpers.Result.SomeData = null,
		const Tag extends _Helpers.Result.SomeTag = null,
	> (
		value: Value,
		tag?: Tag
	):
		OkFrom<Value, Tag>
	{
		const result = IsOk(value)
			? Ok({ ...value, tag: tag || value.tag })
			: Ok({ data: value, tag })

		return result as OkFrom<Value, Tag>
	}

	// ---------------------------------------------------------------------

	/**
	 * Create a new `Result.Ok` from the result if it is not an instance
	 * of `Result.Error`. If the passed value is already a `Result.Ok`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @template Value Source value.
	 * @template Tag Optional tag.
	 */
	export type OkFromUnlessError<
		Value extends _Helpers.Result.SomeData = null,
		Tag extends _Helpers.Result.SomeTag = null
	> =
		| Value extends { status: 'error' } ? Value : OkFrom<Value, Tag>

	/**
	 * Create a new `Result.Ok` from the result if it is not an instance
	 * of `Result.Error`. If the passed value is already a `Result.Ok`,
	 * then the `tag` will be replaced with a new one.
	 *
	 * @param value - Source value.
	 * @param tag - Optional tag.
	 */
	export function OkFromUnlessError<
		Value extends _Helpers.Result.SomeData = null,
		Tag extends _Helpers.Result.SomeTag = null,
	> (
		value: Value,
		tag?: Tag
	):
		OkFromUnlessError<Value, Tag>
	{
		const result = _Error.IsError(value) ? value : OkFrom(value, tag)
		return result as OkFromUnlessError<Value, Tag>
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