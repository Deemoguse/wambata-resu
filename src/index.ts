import { _Result } from './modules/result'
import { _Flow } from './modules/flow'
import { _Logger } from './modules/logger'
import type { Utils } from './types/utils'

// --- Export as modules:
export type Truthy = Utils.AllowedReturn

export import Result = _Result
export import Flow = _Flow
export import Logger = _Logger

// --- Export as NS:
export namespace Resu
{
	export type Truthy = Utils.AllowedReturn

	export import Result = _Result
	export import Flow = _Flow
	export import Logger = _Logger
}

declare module './types/settings' {
	interface Settings {
		strict: false
	}
}

const pipe1 = Flow.Pipe.Sync
	(Result.OkFrom(1 as const))
	(() => 1)()

const a = Flow.Match(pipe1, {
	ok: () => 1
})