import { _Match } from './partials/public.match'
import { _Try } from './partials/public.try'
import { _Function } from './partials/public.function'
import { _Pipe } from './partials/public.pipe'

export namespace _Flow
{
	// Aliasing `Match` namespace:
	export import Match = _Match.Match
	export import MatchMap = _Match.MatchMap

	// Aliasing `Try` namespace:
	export import Try = _Try

	// Aliasing `Function` namespace:
	export import Function = _Function

	// Aliasing `Function` namespace:
	export import Pipe = _Pipe
}