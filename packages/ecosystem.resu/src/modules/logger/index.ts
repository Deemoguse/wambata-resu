import { _Engine } from './partials/public.engine'

export namespace _Logger {
	export let LogOkResult = false
	export let LogErrorResult = false

	export import Engine = _Engine.Engine
}