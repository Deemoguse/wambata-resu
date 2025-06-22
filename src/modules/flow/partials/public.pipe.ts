import { Result } from '../../..'
import { Utils } from '../../../types/utils'
import { _Result } from '../../result'

export namespace _Pipe {
   /**
    * A synchronous pipeline that processes {@link _Result.Any `Result`} objects through a chain of functions.
    *
    * Supports early termination - if any function returns {@link _Result.Error `Result.Error`},
    * the pipeline stops and returns that error immediately.
    *
    * @template CurrentValue The current result type in the pipeline.
    * @template Errors Union of all possible error types that can occur in the pipeline.
    */
   export type Sync <
   	CurrentValue extends Utils.AllowedReturn,
		Values extends readonly _Result.Any[],
   	Errors extends _Result.AnyError = CurrentValue extends infer UValue
   		? _Result.IsError<UValue> extends true ? UValue : never
   		: never
   > = {
   	/**
   	 * Add a function to the pipeline that processes the current result.
   	 *
   	 * @template NextValue The result type returned by the function.
   	 * @param fn Function that processes the current result and returns a new result.
   	 */
   	<NextValue extends Utils.AllowedReturn>(fn: (arg: CurrentValue) => NextValue): Sync<
			NextValue,
			[...Values, _Result.OkFromUnlessError<NextValue>],
			Errors
		>
   	/**
   	 * Execute the pipeline and return the final result.
   	 */
   	(): _Result.OkFrom<CurrentValue> | Errors

		// Running chaining methods using a loop:
		[Symbol.iterator] (): Generator<Values[number], Values>
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
    * const result = Flow.Pipe.Sync(Result.Ok("hello"))
    *   (data => Result.Ok(data.toUpperCase()))
    *   (data => Result.Ok(data + "!"))
    *   ()   // -> Returns: Result.Ok("HELLO!")
    * ```
    *
    * @example Early termination on error:
    * ```typescript
    * const result = Flow.Pipe.Sync(Result.Ok(5))
    *   (x => x > 0 ? Result.Ok(x * 2) : Result.Error("negative"))
    *   (x => Result.Error("always fails"))   // -> This will stop the pipeline
    *   (x => Result.Ok(x + 1))               // -> This won't execute
    *   ()                                    // -> Returns: Result.Error("always fails")
    * ```
    */
   export function Sync<A extends Utils.AllowedReturn> (init: A | (() => A)): Sync<A, [_Result.OkFromUnlessError<A>]> {
   	const handlers: Array<(result: _Result.Any) => Utils.AllowedReturn> = []
   	const initialValue: A = typeof init === 'function' ? init(): init

		//@ts-expect-error - declaring the iterator after declaring the function:
   	const next: Sync<A> = <B extends _Result.Any>(fn?: (result: A) => B) => {
   		if (fn === undefined) {
   			let result: Result.Any = _Result.OkFromUnlessError(initialValue)
   			for (const handler of handlers) {
					result = Result.OkFromUnlessError(handler(result))
   				if (_Result.IsError(result)) return result
				}
   		}
   		else {
   			handlers.push(fn as typeof handlers[0])
   			return next
   		}
   	}
		next[Symbol.iterator] = function * () {
			const results = [ _Result.OkFromUnlessError(initialValue) ]

			for (const handler of handlers) {
				const lastResult = results.at(-1)!
				const result: _Result.Any = yield handler(lastResult)
				if (_Result.IsError(result)) return result
			}
			return results
		}

   	return next
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
    * @template CurrentValue The current result type in the pipeline.
    * @template Errors Union of all possible error types that can occur in the pipeline.
    */
   export type Async <
   	CurrentValue extends Utils.AllowedReturn,
		Values extends readonly _Result.Any[],
   	Errors extends _Result.AnyError = CurrentValue extends infer UValue
   		? _Result.IsError<UValue> extends true ? UValue : never
   		: never
   > = {
   	/**
   	 * Add a function to the pipeline that processes the current result.
   	 *
   	 * @template NextValue The result type returned by the function.
   	 * @param fn Function that processes the current result and returns a new result (sync or async).
   	 */
   	<NextValue extends Utils.AllowedReturn>(fn: (arg: CurrentValue) => NextValue | Promise<NextValue>): Async<
			NextValue,
			[...Values, _Result.OkFromUnlessError<NextValue>],
			Errors
		>
   	/**
   	 * Execute the pipeline and return the final result as a Promise.
   	 */
   	(): Promise<_Result.OkFrom<CurrentValue> | Errors>

		// Running chaining methods using a loop:
		[Symbol.iterator] (): AsyncGenerator<Values[number], Values>
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
    *   (async data => Result.Ok(data.toUpperCase()))
    *   (data => Result.Ok(data + "!"))   // -> Sync function in async pipeline
    *   ()                                // -> Returns: Promise<Result.Ok("HELLO!")>
    * ```
    *
    * @example Early termination with async functions:
    * ```typescript
    * const result = await Flow.Pipe.Async(Promise.resolve(Result.Ok(5)))
    *   (async x => x > 0 ? Result.Ok(x * 2) : Result.Error("negative"))
    *   (async x => Result.Error("always fails"))   // -> Pipeline stops here
    *   (x => Result.Ok(x + 1))                     // -> This won't execute
    *   ()                                          // -> Returns: Promise<Result.Error("always fails")>
    * ```
    */
   export function Async<A extends Utils.AllowedReturn> (init: A | Promise<A> | (() => A | Promise<A>)): Async<A, [_Result.OkFromUnlessError<A>]> {
   	const handlers: Array<(result: _Result.Any) => Utils.AllowedReturn | Promise<Utils.AllowedReturn>> = []
   	const initialValue: A | Promise<A> = (typeof init === 'function' ? init(): init)

		//@ts-expect-error - declaring the iterator after declaring the function:
   	const next: Async<A> = async <B extends _Result.Any>(fn?: (result: A) => B | Promise<B>) => {
   		if (fn === undefined) {
   			let result: Result.Any = _Result.OkFromUnlessError(await initialValue)
   			for (const handler of handlers) {
					result = Result.OkFromUnlessError(await handler(result))
   				if (_Result.IsError(result)) return result
				}
   		}
   		else {
   			handlers.push(fn as typeof handlers[0])
   			return next
   		}
   	}
		next[Symbol.iterator] = async function * () {
			const results = [ await initialValue ]

			for (const handler of handlers) {
				const lastResult = results.at(-1)!
				const result: _Result.Any = yield await handler(_Result.OkFromUnlessError(lastResult))
				if (_Result.IsError(result)) return result
			}
			return results
		}

   	return next
   }
}