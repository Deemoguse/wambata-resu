import { _Result } from './modules/result'
import { _Flow } from './modules/flow'
import { _Logger } from './modules/logger'
import type { Utils } from './types/utils'

// --- Export as modules:
export type Truthy = Utils.Truthy

export import Result = _Result
export import Logger = _Logger
export import Flow = _Flow

// --- Export as NS:
export namespace Resu
{
	export type Truthy = Utils.Truthy

	export import Result = _Result
	export import Flow = _Flow
	export import Logger = _Logger
}
