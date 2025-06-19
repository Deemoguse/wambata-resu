import { Utils } from '../../../types/utils';
import { _Result } from '../../result';

export namespace _Function
{
	/**
	 * The result of the passed function will always be `Result`.
	 * Restricts the type that the function can return in order to oblige
	 * the user to return `Result`
	 *
	 * @template Args Args of the origin function.
	 * @template Return Return type of the origin function.
	 */
	export type Sync <
		Args extends any[],
		Return extends Utils.Truthy
	> =
		_Result.IsResult<Return> extends true
			? (...args: Args) => Return
			: (...args: Args) => _Result.OkFrom<Return>

	/**
	 * The result of the passed function will always be `Result`.
	 * Restricts the type that the function can return in order to oblige
	 * the user to return `Result`
	 *
	 * @param fn - Original function.
	 */
	export function Sync<
		Args extends any[],
		Return extends Utils.Truthy
	> (
		fn: (...args: Args) => Return
	):
		Sync<Args, Return>
	{
		const wrappedFn = function (...args: Args) {
			const maybeResult = fn(...args)
			const result = _Result.IsResult(maybeResult) ? maybeResult : _Result.OkFrom(maybeResult)
			return result
		}
		return wrappedFn as Sync<Args, Return>
	}

	// ---------------------------------------------------------------------

	/**
	 * The result of the passed function will always be `Result`.
	 * Restricts the type that the function can return in order to oblige
	 * the user to return `Result`
	 *
	 * @template Args Args of the origin function.
	 * @template Return Return type of the origin function.
	 */
	export type Async <
		Args extends any[],
		Return extends Utils.Truthy
	> =
		_Result.IsResult<Return> extends true
			? (...args: Args) => Promise<Return>
			: (...args: Args) => Promise<_Result.OkFrom<Return>>

	/**
	 * The result of the passed function will always be `Result`.
	 * Restricts the type that the function can return in order to oblige
	 * the user to return `Result`
	 *
	 * @param fn - Original function.
	 */
	export function Async<
		Args extends any[],
		Return extends Utils.Truthy
	> (
		fn: (...args: Args) => Promise<Return>
	):
		Async<Args, Return>
	{
		const wrappedFn = async function (...args: Args) {
			const maybeResult = await fn(...args)
			const result = _Result.IsResult(maybeResult) ? maybeResult : _Result.OkFrom(maybeResult)
			return result
		}
		return wrappedFn as Async<Args, Return>
	}
}