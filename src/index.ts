import { _Result } from './modules/result'
import { _Flow } from './modules/flow'
import { _Logger } from './modules/logger'
import type { _Utils } from './types/utils'

// --- Export settings:
export * from './types/settings'

// --- Export as modules:
export type AllowedReturn = _Utils.AllowedReturn

export import Result = _Result
export import Flow = _Flow
export import Logger = _Logger

// --- Export as NS:
export namespace Resu
{
	export type AllowedReturn = _Utils.AllowedReturn

	export import Result = _Result
	export import Flow = _Flow
	export import Logger = _Logger
}


const res1 = Flow.Pipe.Sync
	(() => {
		if (Math.random() > 1) return Result.OkFrom(1 as number)
		return Result.ErrorFrom('1 as number' as const)
	})
	(r => {
		return Result.Error({ data: '1', tag: 'test2'})
	})
	()