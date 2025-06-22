import { _Result } from '../../result'
import { Utils } from '../../../types/utils'

export namespace _Try
{
	/**
	 * Wrap values into {@link _Result.Error `Result.Error`} and/or {@link _Result.Ok `Result.Ok`}
	 * if they are not already a `Result`.
	 *
	 * @template Ok Success value or `Result`.
	 * @template Error Failure value or `Result`.
	 */
	type TryReturn<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn | unknown
	> =
		| (Ok extends _Result.Any ? Ok : _Result.Ok<Ok>)
		| (Error extends _Result.Any ? Error : _Result.Error<Error>)

	// ---------------------------------------------------------------------

	/**
	 * A function that returns a result tagged as success.
	 *
	 * @template Ok Result data or `Result`.
	 */
	type SyncFunction<Ok extends Utils.AllowedReturn> =
		() => Ok

	/**
	 * Configuration for executing a function and handling errors.
	 *
	 * @template Ok Result data or `Result` tagged as success.
	 * @template Error Result data or `Result` tagged as error.
	 */
	type SyncConfig<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> = {
		try: SyncFunction<Ok>
	} | {
		try: SyncFunction<Ok>
		catch: (error: unknown) => Error
	}

	/**
	 * Executes `config.try` and intercepts errors via `config.catch`:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 *
	 * @param config Callbacks for execution and error handling.
	 */
	export function Sync<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> (
		config: SyncConfig<Ok, Error>
	):
		Utils.Prettify<TryReturn<Ok, Error>>

	/**
	/**
	 * Executes a callback and, if an error occurs, returns {@link _Result.Error `Result.Error`} without a tag.
	 *
	 * @param cb Callback.
	 */
	export function Sync<Ok extends Utils.AllowedReturn> (cb: SyncFunction<Ok>): Utils.Prettify<TryReturn<Ok, unknown>>

	// Signature implementation:
	export function Sync<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> (
		arg: SyncFunction<Ok> | SyncConfig<Ok, Error>
	):
		TryReturn<Ok, Error>
	{
		const tryFunc = typeof arg === 'object' ? arg.try : arg
		const catchFunc = (typeof arg === 'object' && 'catch' in arg ? arg.catch : null) || ((data: unknown) => _Result.Error({ data, log: false }))

		try {
			const tryFuncResult = tryFunc()
			const result = _Result.IsResult(tryFuncResult) ? tryFuncResult : _Result.OkFrom(tryFuncResult)
			return result as TryReturn<Ok, Error>
		}
		catch (error) {
			const catchFuncResult = catchFunc(error)
			const result = _Result.IsResult(catchFuncResult) ? catchFuncResult : _Result.ErrorFrom(catchFuncResult)
			return result as TryReturn<Ok, Error>
		}
	}

	// ---------------------------------------------------------------------

	/**
	 * Executes a promise and catches errors.
	 *
	 * @template Ok Result data or `Result`.
	 */
	type AsyncFunction<
		Ok extends Utils.AllowedReturn,
		Args extends any[] = []
	> =
		(...args: Args) => Promise<Ok>

	/**
	 * Configuration for executing a promise and handling errors.
	 *
	 * @template Ok Result data or `Result` tagged as success.
	 * @template Error Result data or `Result` tagged as error.
	 */
	type AsyncConfig<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> = {
		try: AsyncFunction<Ok>,
	} | {
		try: AsyncFunction<Ok>,
		catch: (error: unknown) => Error
	}

	/**
	 * Configuration for executing a promise and handling errors
	 * with the ability to cancel the operation.
	 *
	 * @template Ok Result data or `Result` tagged as success.
	 * @template Error Result data or `Result` tagged as error.
	 */
	type AsyncConfigWithSignal<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> = {
		signal: AbortSignal
		try: AsyncFunction<Ok, [signal: AbortSignal]>
	} | {
		signal: AbortSignal
		try: AsyncFunction<Ok, [signal: AbortSignal]>
		catch: (error: unknown) => Error
	}

	/**
	 * Executes the promise `config.try` and intercepts errors via `config.catch`:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 * - `signal` is a cancellation signal. If `abort` is called, it returns {@link _Result.Error `Result.Error<Error, 'AbortError'>`}.
	 *
	 * @param config Callbacks for execution and error handling.
	 */
	export function Async<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> (
		config: AsyncConfigWithSignal<Ok, Error>
	):
		Promise<Utils.Prettify<TryReturn<Ok, Error> | _Result.Error<globalThis.Error, 'AbortError'>>>

	/**
	 * Executes the promise `config.try` and intercepts errors via `config.catch`:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 *
	 * @param config Callbacks for execution and error handling.
	 */
	export function Async<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> (
		config: AsyncConfig<Ok, Error>
	):
		Promise<Utils.Prettify<TryReturn<Ok, Error>>>

	/**
	 * Executes the callback promise and intercepts errors:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 *
	 * @param cb Callback.
	 */
	export function Async<Ok extends Utils.AllowedReturn> (cb: AsyncFunction<Ok>): Promise<Utils.Prettify<TryReturn<Ok, unknown>>>

	// Signature implementation:
	export async function Async<
		Ok extends Utils.AllowedReturn,
		Error extends Utils.AllowedReturn
	> (
		arg:
			| AsyncFunction<Ok>
			| AsyncConfig<Ok, Error>
			| AsyncConfigWithSignal<Ok, Error>
	):
		Promise<TryReturn<Ok, Error> | _Result.Error<globalThis.Error, 'AbortError'>>
	{
		const tryFunc = (typeof arg === 'object' ? arg.try : arg) as AsyncFunction<Ok, [signal?: AbortSignal]>
		const catchFunc = (typeof arg === 'object' && 'catch' in arg ? arg.catch : null) || ((data: unknown) => _Result.Error({ data, log: false }))
		const signal = typeof arg === 'object' && 'signal' in arg ? arg.signal : undefined

		try {
			const tryFuncResult = await tryFunc(signal)
			const result = _Result.IsResult(tryFuncResult) ? tryFuncResult : _Result.OkFrom(tryFuncResult)
			return result as TryReturn<Ok, Error>
		}
		catch (error) {
			const isAbortError = signal && error instanceof Error && error.name === 'AbortError'
			if (isAbortError) return _Result.Error({ data: error, tag: 'AbortError' }) as _Result.Error<globalThis.Error, 'AbortError'>

			const catchFuncResult = catchFunc(error)
			const result = _Result.IsResult(catchFuncResult) ? catchFuncResult : _Result.ErrorFrom(catchFuncResult)
			return result as TryReturn<Ok, Error>
		}
	}
}

