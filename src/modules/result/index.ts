import { _Ok } from './partials/public.ok'
import { _Error } from './partials/public.error'

export namespace _Result
{
	// Aliasing `Ok` namspace:
	export import Ok = _Ok.Ok
	export import IsOk = _Ok.IsOk
	export import OkFrom = _Ok.OkFrom
	export import OkFromUnlessError = _Ok.OkFromUnlessError
	export import AnyOk = _Ok.AnyOk
	export import TaggedOk = _Ok.TaggedOk

	// Aliasing `Error` namspace:
	export import Error = _Error.Error
	export import IsError = _Error.IsError
	export import ErrorFrom = _Error.ErrorFrom
	export import ErrorFromUnlessOk = _Error.ErrorFromUnlessOk
	export import AnyError = _Error.AnyError
	export import TaggedError = _Error.TaggedError

	// ---------------------------------------------------------------------

	/**
	 * Any result with any data type and any tag.
	 */
	export type Any = AnyOk | AnyError

	// ---------------------------------------------------------------------

	/**
	 * Check if the value is a success or error result.
	 *
	 * @template V Source value.
	 */
	export type IsResult<V> =
		| IsOk<V> extends true ? true
		: IsError<V> extends true ? true
		: false

	/**
	 * Check if the value is a success or error result.
	 *
	 * @param value - Source value.
	 */
	export function IsResult (value: unknown): value is Any {
		return IsOk(value) || IsError(value)
	}
}

