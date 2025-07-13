import { _Utils } from "../../../types/utils"
import { _Result } from "../../result"
import { _Match } from "./public.match"

export namespace _Pipe
{
	type ResultTyple <
		NextResult extends _Utils.AllowedReturn = never,
		PrevResultTuple extends _Result.AnyOk[] = []
	> =
		| [NextResult] extends [never]
			? [ ...PrevResultTuple ]
			: [ ...PrevResultTuple, _Result.ExtractOk<NextResult> ]

	// ---------------------------------------------------------------------

	/**
	 * Add a function to the pipeline that processes the current result.
	 *
	 * @template NextValue The result type returned by the function.
	 * @param fn Function that processes the current result and returns a new result.
	 */
	export type Sync <
		PrevResult extends _Utils.AllowedReturn,
		PrevErrorResult extends _Result.AnyError = _Result.ExtractError<PrevResult>,
		PrevResultTuple extends _Result.AnyOk[] = []
	> = {
   	/**
   	 * Add a function to the pipeline that processes the current result.
   	 *
   	 * @template NextResult The result type returned by the function.
   	 * @param transformer Function that processes the current result and returns a new result.
   	 */
		<
			NextResult extends _Utils.AllowedReturn = never,
			NextErrorResult extends _Result.AnyError = PrevErrorResult | _Result.ExtractError<NextResult>,
			NextResultTuple extends _Result.AnyOk[] = ResultTyple<NextResult, PrevResultTuple>
		> (
			transformer: [_Result.ExtractOk<_Result.OkFromUnlessError<PrevResult>>] extends [never]
				? never
				: ((res: _Result.ExtractOk<_Result.OkFromUnlessError<PrevResult>>) => NextResult)
		):
			Sync<
				NextResult,
				NextErrorResult,
				NextResultTuple
			>

   	/**
   	 * Execute the pipeline and return the final result.
   	 */
   	(): _Result.OkFrom<PrevResult> | PrevErrorResult

		// Running chaining methods using a loop:
		[Symbol.iterator] (): Generator<PrevResultTuple[number], PrevResultTuple>
	}

   /**
    * Creates a synchronous pipeline for processing {@link _Result.Any `Result`} objects.
    *
    * The pipeline executes functions sequentially and stops immediately if any function
    * returns {@link _Result.Error `Result.Error`} (early termination).
    *
    * @template A The initial result type.
    * @param init Initial value for the pipeline. Can be a {@link _Result.Any `Result`} or a function that returns one.
    *
    * @example
    * ```typescript
    * const result = Flow.Pipe.Sync(Result.OkFrom("hello"))
    *   (data => Result.OkFrom(data.toUpperCase()))
    *   (data => Result.OkFrom(data + "!"))
    *   ()   // -> Returns: Result.OkFrom("HELLO!")
    * ```
    *
    * @example Early termination on error:
    * ```typescript
    * const result = Flow.Pipe.Sync(Result.Ok(5))
    *   (x => x > 0 ? Result.OkFrom(x * 2) : Result.ErrorFrom("negative"))
    *   (x => Result.ErrorFrom("always fails"))   // -> This will stop the pipeline
    *   (x => Result.Ok(x + 1))                   // -> This won't execute
    *   ()                                        // -> Returns: Result.ErrorFrom("always fails")
    * ```
    */
	export function Sync <Result extends _Utils.AllowedReturn> (result: Result | (() => Result)): Sync<Result> {
		// Массив содержащий все шаги цепочки:
		const transformers: Array<(res: _Result.Any) => _Utils.AllowedReturn> = []

		// Начальное значение:
		let lastResult: _Result.Any = typeof result === 'function'
			? _Result.OkFromUnlessError(result())
			: _Result.OkFromUnlessError(result)

		// Замкнутая функция которая будет вызывать цепочку, или обновлять ее:
		const next = (transformer?: (res?: _Result.Any) => typeof transformers[number]) => {
			// Обновляем цепочку действий, если передали аргумент:
			if (transformer) {
				transformers.push(transformer)
				return next
			}

			// Выполнение цепочки действий, если при вызове небыло передано аргумента:
			else {
				// Проверка начального значения:
				const lastResultIsError = _Result.IsError(lastResult)
				if (lastResultIsError) return lastResult

				// Итерируем шаги цепочки и формируем финальный результат:
				for (const transformer of transformers) {
					const result = transformer(lastResult)

					const resultIsError = _Result.IsError(result)
					if (resultIsError) return result

					const resultAsOk = _Result.OkFrom(result)
					lastResult = resultAsOk
				}
				return lastResult
			}
		}
		// @ts-expect-error
		next[Symbol.iterator] = function * () {
			// Проверка начального значения:
			const lastResultIsError = _Result.IsError(lastResult)
			if (lastResultIsError) return [lastResult]

			// Формирование массива результатов:
			const results = [ _Result.OkFromUnlessError(lastResult) ]
			for (const transformer of transformers) {
				const result = transformer(lastResult)

				const resultIsError = _Result.IsError(result)
				if (resultIsError) return result

				const resultAsOk = _Result.OkFrom(result)
				lastResult = resultAsOk
			}
			return results
		}

		return next as Sync<Result>
	}

	// ---------------------------------------------------------------------

   /**
    * An asynchronous pipeline that processes {@link _Result.Any `Result`} objects through a chain of functions.
    *
    * Supports early termination - if any function returns {@link _Result.Error `Result.Error`},
    * the pipeline stops and returns that error immediately.
    *
    * Functions in the pipeline can be synchronous or asynchronous.
    *
    * @template PrevResult The current result type in the pipeline.
    * @template PrevErrorResult Union of all possible error types that can occur in the pipeline.
    */
	export type Async <
		PrevResult extends _Utils.AllowedReturn,
		PrevErrorResult extends _Result.AnyError = _Result.ExtractError<PrevResult>,
		PrevResultTuple extends _Result.AnyOk[] = []
	> = {
   	/**
   	 * Add a function to the pipeline that processes the current result.
   	 *
   	 * @template NextResult The result type returned by the function.
   	 * @param transformer Function that processes the current result and returns a new result (sync or async).
   	 */
		<
			NextResult extends _Utils.AllowedReturn = never,
			NextErrorResult extends _Result.AnyError = PrevErrorResult | _Result.ExtractError<NextResult>,
			NextResultTuple extends _Result.AnyOk[] = ResultTyple<NextResult, PrevResultTuple>
		> (
			transformer: [_Result.ExtractOk<_Result.OkFromUnlessError<PrevResult>>] extends [never]
				? never
				: ((res: _Result.ExtractOk<_Result.OkFromUnlessError<PrevResult>>) => NextResult | Promise<NextResult>)
		):
			Async<
				NextResult,
				NextErrorResult,
				NextResultTuple
			>

   	/**
   	 * Execute the pipeline and return the final result.
   	 */
		(): Promise<_Result.OkFrom<PrevResult> | PrevErrorResult>

		// Running chaining methods using a loop:
		[Symbol.asyncIterator] (): AsyncGenerator<PrevResultTuple[number], PrevResultTuple>
	}

   /**
    * Creates an asynchronous pipeline for processing {@link _Result.Any `Result`} objects.
    *
    * The pipeline executes functions sequentially (awaiting each async function) and stops
    * immediately if any function returns {@link _Result.Error `Result.Error`} (early termination).
    *
    * Functions can be synchronous or asynchronous - the pipeline will handle both correctly.
    *
    * @template A The initial result type.
    * @param init Initial value for the pipeline. Can be a {@link _Result.Any `Result`}, a Promise of one,
    *             or a function that returns either.
    *
    * @example
    * ```typescript
    * const result = await Flow.Pipe.Async(Result.Ok("hello"))
    *   (async data => Result.OkFrom(data.toUpperCase()))
    *   (data => Result.OkFrom(data + "!"))   // -> Sync function in async pipeline
    *   ()                                    // -> Returns: Promise<Result.OkFrom("HELLO!")>
    * ```
    *
    * @example Early termination with async functions:
    * ```typescript
    * const result = await Flow.Pipe.Async(Promise.resolve(Result.Ok(5)))
    *   (async x => x > 0 ? Result.OkFrom(x * 2) : Result.ErrorFrom("negative"))
    *   (async x => Result.ErrorFrom("always fails"))   // -> Pipeline stops here
    *   (x => Result.OkFrom(x + 1))                     // -> This won't execute
    *   ()                                              // -> Returns: Promise<Result.ErrorFrom("always fails")>
    * ```
    */
	export function Async <
		Result extends _Utils.AllowedReturn
	> (
		result: Result | Promise<Result> | (() => Result | Promise<Result>)
	):
		Async<Result>
	{
		// Массив содержащий все шаги цепочки:
		const transformers: Array<(res: _Result.Any) => _Utils.AllowedReturn | Promise<_Utils.AllowedReturn>> = []


		// Начальное значение:
		let lastResult: _Result.Any = typeof result === 'function'
			? _Result.OkFromUnlessError(result())
			: _Result.OkFromUnlessError(result)

		// Замкнутая функция которая будет вызывать цепочку, или обновлять ее:
		const next = async (transformer?: (res?: _Result.Any) => typeof transformers[number]) => {
			// Обновляем цепочку действий, если передали аргумент:
			if (transformer) {
				transformers.push(transformer)
				return next
			}

			// Выполнение цепочки действий, если при вызове небыло передано аргумента:
			else {
				// Проверка начального значения:
				const lastResultIsError = _Result.IsError(lastResult)
				if (lastResultIsError) return lastResult

				// Итерируем шаги цепочки и формируем финальный результат:
				for await (const transformer of transformers) {
					const result = await transformer(lastResult)

					const resultIsError = _Result.IsError(result)
					if (resultIsError) return result

					const resultAsOk = _Result.OkFrom(result)
					lastResult = resultAsOk
				}
				return lastResult
			}
		}
		// @ts-expect-error
		next[Symbol.asyncIterator] = async function * () {
			// Проверка начального значения:
			const lastResultIsError = _Result.IsError(lastResult)
			if (lastResultIsError) return [lastResult]

			// Формирование массива результатов:
			const results = [ _Result.OkFromUnlessError(lastResult) ]
			for await (const transformer of transformers) {
				const result = await transformer(lastResult)

				const resultIsError = _Result.IsError(result)
				if (resultIsError) return result

				const resultAsOk = _Result.OkFrom(result)
				lastResult = resultAsOk
			}
			return results
		}

		return next as Async<Result>
	}
}