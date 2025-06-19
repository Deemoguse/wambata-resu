import { _Utils } from '../../../types/utils'
import { _Result } from '../../result'

export namespace _Match
{
	/**
	 * Extracts all non-null tags from a Result union type.
	 *
	 * @template Result Any results
	 */
	type GetResultTags<Result extends _Result.Any> =
		| Result extends { tag: infer T } ? Exclude<T, null> : never

	/**
	 * Filters Result union by tag value.
	 *
	 * @template Result Any results.
	 * @template S Result status.
	 */
	type GetResultByTag<
		Result extends _Result.Any,
		Tag extends _Result.Any['tag']
	> =
		| Result extends { tag: Tag } ? Result : never

	/**
	 * Filters Result union by status value.
	 *
	 * @template Result Any results.
	 * @template Status Result status.
	 */
	type GetResultByStatus<
		Result extends _Result.Any,
		Status extends _Result.Any['status']
	> =
		| Result extends { status: Status } ? Result : never

	/**
	 * Filters Result by both tag and status, including only tagged Results.
	 *
	 * @template Result Any results.
	 * @template Status Result status.
	 */
	type GetResultWithTagByStatus<
		Result extends _Result.Any,
		Status extends _Result.Any['status']
	> =
		| GetResultByStatus<GetResultByTag<Result, GetResultTags<Result>>, Status>

	/**
	 * Filters Result by status where tag is null.
	 *
	 * @template Result Any results.
	 * @template Status Result status.
	 */
	type GetResultWithoutTagByStatus<
		Result extends _Result.Any,
		Status extends Result['status']
	> =
		| GetResultByStatus<GetResultByTag<Result, null>, Status>

	/**
	 * Filters Result union by both status and tag values.
	 *
	 * @template Result Any results.
	 * @template Status Result status.
	 * @template Tag Result tag.
	 */
	type GetResultByTagAndStatus<
		Result extends _Result.Any,
		Status extends _Result.Any['status'],
		Tag extends _Result.Any['tag']
	> =
		| Result extends { status: Status, tag: Tag } ? Result : never

	/**
	 * Callback function type that accepts a result object.
	 * @template Result Any results.
	 */
	type MatchResultCallback<Result extends _Result.Any> =
		| ((result: Result) => _Utils.AllowedReturn)

	/**
	 * Builds a map of status:tag strings to their corresponding callbacks.
	 * Includes untagged Results under just the status key.
	 *
	 * @template Result Any results.
	 * @template Status Result status.
	 */
	type BuildMatchMapByStatus<
		Result extends _Result.Any,
		Status extends _Result.Any['status']
	> = _Utils.Prettify<{
		[U in GetResultWithTagByStatus<Result, Status> as `${Status}:${U['tag']}`]?: MatchResultCallback<GetResultByTagAndStatus<Result, Status, U['tag']>>
	} &
		Pick<{
			[U in GetResultWithoutTagByStatus<Result, Status> as Status]?: MatchResultCallback<GetResultByStatus<Result, Status>>
		}, Extract<Status, Result['status']>>
	>

	/**
	 * Сreate a match map.
	 *
	 * @template Result Any results.
	 */
	export type MatchMap<Result extends _Result.Any> =
		& BuildMatchMapByStatus<Result, 'ok'>
		& BuildMatchMapByStatus<Result, 'error'>

	/**
	 * Get a status and tag object based on the match name.
	 *
	 * @template Matcher Match map.
	 */
	type GetTagAndStatusObjectFromMatchMap<Matcher> =
		| keyof Matcher extends infer K
			? K extends `${infer Status}:${infer Tag}`
				? { status: Status, tag: Tag }
				: { status: K, tag: any }
			: never

	/**
	 * Get results from the match map functions.
	 *
	 * @template Matcher Match map.
	 */
	type GetRetursResultsFromMatches<Matcher> =
		| Matcher[keyof Matcher] extends infer F extends (...args: any[]) => any
			? ReturnType<F> extends infer U
				? _Result.OkFromUnlessError<U>
				: never
			: never

	/**
	 * Resolve the match map and return the result.
	 *
	 * @template Result Any results.
	 * @template Matcher Match map.
	 */
	type ResolveMatch<
		Result extends _Result.Any,
		Matcher extends MatchMap<Result>
	> =
		| Exclude<Result, GetTagAndStatusObjectFromMatchMap<Matcher>>
		| GetRetursResultsFromMatches<Matcher>

	// ---------------------------------------------------------------------

	/**
	 * A generic match function for handling `Result` objects based on their `status` and optional `tag`.
	 *
	 * This function allows you to define a set of handlers (`matcher`) that correspond to combinations
	 * of `status` and `tag` in the given `result`.
	 *
	 * - If a matching handler is found, it is called with the `result` as its argument.
	 * - If the handler returns an error, it is propagated as-is.
	 * - If the handler returns a value, it is wrapped using `Result.OkFrom`.
	 * - If no handler is found, the original `result` is returned.
	 *
	 * @template Result Any results.
	 * @template Matcher Match map.
	 */
	export type Match<
		Result extends _Result.Any,
		Matcher extends MatchMap<Result>,
	> =
		| _Utils.Prettify<ResolveMatch<Result, Matcher>>

	/**
	 * A generic match function for handling `Result` objects based on their `status` and optional `tag`.
	 *
	 * This function allows you to define a set of handlers (`matcher`) that correspond to combinations
	 * of `status` and `tag` in the given `result`.
	 *
	 * - If a matching handler is found, it is called with the `result` as its argument.
	 * - If the handler returns an error, it is propagated as-is.
	 * - If the handler returns a value, it is wrapped using `Result.OkFrom`.
	 * - If no handler is found, the original `result` is returned.
	 *
	 * @param result - Any results.
	 * @param matcher - An object containing handlers for different `status` or `status:tag` cases.
	 */
	export function Match<
		Result extends _Result.Any,
		Matcher extends MatchMap<Result>,
	> (
		result: Result,
		matcher: Matcher
	):
		Match<Result, Matcher>

	// Signature implementation:
	export function Match<
		Result extends _Result.Any,
		Matcher extends MatchMap<Result>,
	> (
		result: Result,
		matcher: Matcher
	):
		Match<Result, Matcher>
	{
		const matchKey = result.tag ? `${result.status}:${result.tag}` : `${result.status}`
		const handler = matcher[matchKey as keyof Matcher] || matcher[result.status as keyof Matcher]
		if (!handler) return result as Match<Result, Matcher>

		const handlerResult = (handler as MatchResultCallback<Result>)(result)
		return _Result.OkFromUnlessError(handlerResult) as Match<Result, Matcher>
	}
}