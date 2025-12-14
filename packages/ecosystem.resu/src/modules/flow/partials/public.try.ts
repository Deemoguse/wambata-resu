import { _Result } from '../../result'
import { _Utils } from '../../../types/utils'

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
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> =
		| (Ok extends _Result.Any ? Ok : _Result.Ok<Ok>)
		| (Error extends _Result.Any ? Error : _Result.Error<Error>)

	// ---------------------------------------------------------------------

	/**
	 * A function that returns a result tagged as success.
	 *
	 * @template Ok Result data or `Result`.
	 */
	type SyncFunction<Ok extends _Utils.AllowedReturn> =
		| (() => Ok)

	/**
	 * Configuration for executing a function and handling errors.
	 *
	 * @template Ok Result data or `Result` tagged as success.
	 * @template Error Result data or `Result` tagged as error.
	 */
	type SyncConfig<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
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
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> (
		config: SyncConfig<Ok, Error>
	):
		_Utils.Prettify<TryReturn<Ok, Error>>

	/**
	/**
	 * Executes a callback and, if an error occurs, returns {@link _Result.Error `Result.Error`} without a tag.
	 *
	 * @param cb Callback.
	 */
	export function Sync<Ok extends _Utils.AllowedReturn> (cb: SyncFunction<Ok>): _Utils.Prettify<TryReturn<Ok, unknown>>

	// Signature implementation:
	export function Sync<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
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

	type ABORT_OPERATION_NAME = typeof ABORT_OPERATION_NAME
	const ABORT_OPERATION_NAME = 'AbortOperation'

	// Abort operation error:
	type AbortOperationResult = _Result.Error<globalThis.Error, ABORT_OPERATION_NAME>

	// Abort operation class:
	export class AbortOperationError extends Error {
		name = ABORT_OPERATION_NAME
		message = 'Operation aborted'
	}

	/**
	 * Executes a promise and catches errors.
	 *
	 * @template Ok Result data or `Result`.
	 */
	type AsyncFunction<
		Ok extends _Utils.AllowedReturn,
	> =
		| (() => Promise<Ok>)

	/**
	 * Configuration for executing a promise and handling errors.
	 *
	 * @template Ok Result data or `Result` tagged as success.
	 * @template Error Result data or `Result` tagged as error.
	 */
	type AsyncConfig<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
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
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> = {
		signal: AbortSignal
		try: AsyncFunction<Ok>
	} | {
		signal: AbortSignal
		try: AsyncFunction<Ok>
		catch: (error: unknown) => Error
	}

	/**
	 * Executes the promise `config.try` and intercepts errors via `config.catch`:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 * - `signal` is a cancellation signal. If `abort` is called, it returns {@link _Result.Error `Result.Error<Error, 'AbortOperation'>`}.
	 *
	 * @param config Callbacks for execution and error handling.
	 */
	export function Async<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> (
		config: AsyncConfigWithSignal<Ok, Error>
	):
		Promise<_Utils.Prettify<TryReturn<Ok, Error> | AbortOperationResult>>

	/**
	 * Executes the promise `config.try` and intercepts errors via `config.catch`:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 *
	 * @param config Callbacks for execution and error handling.
	 */
	export function Async<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> (
		config: AsyncConfig<Ok, Error>
	):
		Promise<_Utils.Prettify<TryReturn<Ok, Error>>>

	/**
	 * Executes the callback promise and intercepts errors:
	 *
	 * - `try` may return {@link _Result.Ok `Result.Ok`} to set the tag and result data.
	 * - `catch` may return {@link _Result.Error `Result.Error`} to set the tag and error data.
	 *
	 * @param cb Callback.
	 */
	export function Async<Ok extends _Utils.AllowedReturn> (cb: AsyncFunction<Ok>): Promise<_Utils.Prettify<TryReturn<Ok, unknown>>>

	// Signature implementation:
	export async function Async<
		Ok extends _Utils.AllowedReturn,
		Error extends unknown | _Utils.AllowedReturn = _Result.Error<unknown>
	> (
		arg:
			| AsyncFunction<Ok>
			| AsyncConfig<Ok, Error>
			| AsyncConfigWithSignal<Ok, Error>
	):
		Promise<TryReturn<Ok, Error> | AbortOperationResult>
	{
		const tryFunc = (typeof arg === 'object' ? arg.try : arg) as AsyncFunction<Ok>
		const catchFunc = (typeof arg === 'object' && 'catch' in arg ? arg.catch : null) || ((data: unknown) => _Result.Error({ data, log: false }))
		const signal = typeof arg === 'object' && 'signal' in arg ? arg.signal : undefined

		// Проверяем, не отменена ли операция еще до начала:
		if (signal?.aborted) return <AbortOperationResult> _Result.Error({
			data: new AbortOperationError(),
			tag: ABORT_OPERATION_NAME,
		})

		try {
			const tryPromise = tryFunc()
			const abortPromise = !signal ? null : new Promise((_, rej) => {
				signal.addEventListener('abort', () => {
					rej(new AbortOperationError())
				}, { once: true })
			})

			// Гонка между выполнением и отменой:
			const tryFuncResult = abortPromise
				? await Promise.race([tryPromise, abortPromise])
				: await tryPromise

			const result = _Result.IsResult(tryFuncResult) ? tryFuncResult : _Result.OkFrom(tryFuncResult)
			return result as TryReturn<Ok, Error>
		}
		catch (error) {
			const isAbortedOperation = error instanceof Error && error.name === ABORT_OPERATION_NAME
			if (isAbortedOperation) return _Result.ErrorFrom(error, ABORT_OPERATION_NAME) as any as AbortOperationResult

			const catchFuncResult = catchFunc(error)
			const result = _Result.IsResult(catchFuncResult)
				? catchFuncResult
				: _Result.ErrorFrom(catchFuncResult)

			return result as TryReturn<Ok, Error>
		}
	}
}