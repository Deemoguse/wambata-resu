import { _Result } from '../../result';

export namespace _Engine
{
	export type Engine = null | ((result: _Result.Any) => Promise<any>)
	export let Engine: Engine = null
}