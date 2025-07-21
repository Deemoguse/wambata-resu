import { describe, test, expect } from 'bun:test'
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error'
import { _Result } from '../../src/modules/result/index'
import { _Match } from '../../src/modules/flow/partials/public.match'

// CHECKLIST:
// - [X] The matcher checks for a match by `tag:status` and processes the result in the specified way.
// - [X] If the matcher does not find a match by `tag:status`, it attempts to find a match by `status` and processes the result in the specified way.
// - [X] If the result contains a tag, then processing by `tag:status` takes precedence over processing by `status`.
// - [X] The Matcher handler should only receive data that relates to the specified result.
// - [X] If the matcher does not find a match by `tag` or `status`, the result is returned as is.
// - [X] Matcher handlers always wraps non-results in `Result.Ok`
// - [X] Matcher handlers always returns results as they are.

describe('Match (Processing the result according to the pattern)', () => {
	const okRes0    = _Ok.Ok()
	const okRes1    = _Ok.Ok({ tag: 'Success' })
	const okRes2    = _Ok.Ok({ data: 201, tag: 'Created' })
	const errorRes0 = _Error.Error()
	const errorRes1 = _Error.Error({ tag: 'NotFound' })
	const errorRes2 = _Error.Error({ data: 500, tag: 'InternalErrorTag' })

	test('The matcher checks for a match by `tag:status` and processes the result in the specified way', () => {
		const testSymbol1 = Symbol()
		const res1 = _Match.Match(okRes1, { "ok:Success": () => testSymbol1 })
		expect(_Result.IsResult(res1)).toBeTrue()
		expect(res1.status).toBe('ok')
		expect(res1.tag).toBeNull()
		expect(res1.data).toBeSymbol()
		expect(res1.data).toBe(testSymbol1)

		const testSymbol2 = Symbol()
		const res2 = _Match.Match(errorRes1, { "error:NotFound": () => testSymbol2 })
		expect(_Result.IsResult(res2)).toBeTrue()
		expect(res2.status).toBe('ok')
		expect(res2.tag).toBeNull()
		expect(res2.data).toBeSymbol()
		expect(res2.data).toBe(testSymbol2)
	})

	test('If the matcher does not find a match by `tag:status`, it attempts to find a match by `status` and processes the result in the specified way', () => {
		const cases = [
			okRes0 as _Result.Any as typeof okRes1 | typeof okRes2,
			errorRes0 as _Result.Any as typeof errorRes1 | typeof errorRes2,
		]

		cases.forEach((res) => {
			const unreachableSymbol = Symbol()
			const res1 = _Match.Match(res, {
				'error:InternalErrorTag': () => unreachableSymbol,
				'error:NotFound': () => unreachableSymbol,
				'ok:Created': () => unreachableSymbol,
				'ok:Success': () => unreachableSymbol,
				'error': () => null,
				'ok': () => null,
			})

			expect(res1.data).not.toBeSymbol()
			expect(res1.data).not.toBe(unreachableSymbol)

			expect(res1.status).toBe('ok')
			expect(res1.tag).toBeNull()
			expect(res1.data).toBeNull()
		})
	})

	test('If the result contains a tag, then processing by `tag:status` takes precedence over processing by `status`', () => {
		const res = _Match.Match(okRes1, {
			'ok:Success': () => 1,
			'ok': () => 1,
		})
		expect(res.data).toBe(1)
	})

	test('The Matcher handler should only receive data that relates to the specified result', () => {
		_Match.Match(okRes1, {
			"ok:Success": (handlerArg) => {
				expect(handlerArg.status).toBe(okRes1.status)
				expect(handlerArg.tag).toBe(okRes1.tag)
				expect(handlerArg.data).toBe(okRes1.data)
				return null
			}
		})
		_Match.Match(errorRes1, {
			"error:NotFound": (handlerArg) => {
				expect(handlerArg.status).toBe(errorRes1.status)
				expect(handlerArg.tag).toBe(errorRes1.tag)
				expect(handlerArg.data).toBe(errorRes1.data)
				return null
			}
		})
	})

	test('If the matcher does not find a match by `tag` or `status`, the result is returned as is', () => {
		const res = _Match.Match(okRes2, {})
		expect(res.status).toBe(okRes2.status)
		expect(res.tag).toBe(okRes2.tag)
		expect(res.data).toBe(okRes2.data)
		expect(res).toBe(okRes2)
	})

	test('Matcher handlers always wraps non-results in `Result.Ok`', () => {
		const otherDataTypes = [
			true, false, null, undefined, void 0,
			1, 1.0, 1n,
			'string',
			[], {}, class {}, new class {}, function () {},
			Symbol()
		]
		otherDataTypes.forEach((data) => {
			const res = _Match.Match(okRes0, {
				'ok': () => data === undefined ? null : data
			})
			expect(_Ok.IsOk(res)).toBeTrue()
			expect(res.status).toBe('ok')
			expect(res.tag).toBeNull()
			expect(otherDataTypes.includes(res.data)).toBeTrue()
		})
	})

	test('Matcher handlers always returns results as they are', () => {
		const res = _Match.Match(okRes0, {
			'ok': () => errorRes2
		})
		expect(_Error.IsError(res)).toBeTrue()
		expect(res).toBe(res)
	})
})