import type { VNode } from 'vue'
import type { Flow, Result } from '@wambata/resu'

export namespace MatchTypes {
	// Components props:
	export type Props <Result extends Result.Any> = {
		/** Inpute result */
		result: Result
	}

	// Component slots:
	export type Slots <Result extends Result.Any> =
		| Flow.MatchMap<Result>
		& { default: (r: Result) => VNode }

	// ---------------------------------------------------------------------

	/**
	 * Extract slots names.
	 *
	 * @template Result Input result.
	 */
	export type SlotsName <Result extends Result.Any> =
		| keyof Slots<Result>
}