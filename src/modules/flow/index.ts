import { _Match } from './partials/public.match'
import { _Try } from './partials/public.try'
import { _Function } from './partials/public.function'

export namespace _Flow
{
	// Aliasing `Match` namspace:
	export import Match = _Match.Match

	// Aliasing `Try` namspace:
	export import Try = _Try

	// Aliasing `Function` namspace:
	export import Function = _Function
}