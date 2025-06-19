import { _Logger } from '../../logger'
import { _Helpers } from './private.helpers'

export namespace _Ok
{
	const OK_SYMBOL = Symbol()

	// ---------------------------------------------------------------------

	/**
	 * Create new result with success.
	 *
	 * @template D Optional success data.
	 * @template T Optional success tag.
	 */
	export type Ok<
		D extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> =
		| _Helpers.Result.ResultConstructor<'ok', D, T>

	/**
	 * Create new result with success.
	 *
	 * @template D Optional success data.
	 * @template T Optional success tag.
	 */
	export function Ok<
		D extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> (
		params?: _Helpers.Result.Params<D, T>
	):
		Ok<D, T>
	{
		const result = {
			status: 'ok' as const,
			data: (params?.data || null) as D,
			tag: (params?.tag || null) as T,
			[OK_SYMBOL]: OK_SYMBOL,
		}

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
		V extends _Helpers.Result.SomeData = null,
		T extends _Helpers.Result.SomeTag = null,
	> (
		value: V,
		tag?: T
	):
		OkFrom<V, T>
	{
		const result = IsOk(value)
			? Ok({ ...value, tag: tag || value.tag })
			: Ok({ data: value, tag })

		return result as OkFrom<V, T>
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
}