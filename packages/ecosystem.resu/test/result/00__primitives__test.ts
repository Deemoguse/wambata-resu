import { describe, test, expect } from 'bun:test';
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error';

describe('Result Pattern - Ok and Error Functions', () => {

	const cases = <const>[
		[
			'_Ok.Ok (success result creation)',
			{ status: 'ok', method: _Ok.Ok, symbol: _Ok.OK_SYMBOL }
		],
		[
			'_Error.Error (error result creation)',
			{ status: 'error', method: _Error.Error, symbol: _Error.ERROR_SYMBOL }
		],
	]

	describe.each(cases)('%s', (_, { status, method, symbol }) => {
		test('Creating a result with the "ok" status without data or a tag', () => {
			const res = method()
			expect(res.status).toBe(status)
			expect(res.tag).toBeNull()
			expect(res.data).toBeNull()
			expect(res[symbol]).toBeSymbol()
		})

		test('Passes the data and tag. `Falsy` values, except for `undefined` and `void`, should not be converted to `null`', () => {
			const data = { code: 100 }

			const res1 = method({ data, tag: 'SomeTag' })
			expect(res1.status).toBe(status)
			expect(res1.tag).toBe('SomeTag')
			expect(res1.data).toBe(data)
			expect(res1[symbol]).toBeSymbol()

			const res2 = method({ data, tag: '' })
			expect(res2.status).toBe(status)
			expect(res2.tag).not.toBeNull()
			expect(res2.data).toBe(data)
			expect(res2[symbol]).toBeSymbol()

			const res3 = method({ data: 0 })
			expect(res3.status).toBe(status)
			expect(res3.tag).toBeNull()
			expect(res3.data).not.toBeNull()
			expect(res3[symbol]).toBeSymbol()

			const res5 = method({ data: '' })
			expect(res5.status).toBe(status)
			expect(res5.tag).toBeNull()
			expect(res5.data).not.toBeNull()
			expect(res5[symbol]).toBeSymbol()

			const res6 = method({ data: undefined })
			expect(res6.status).toBe(status)
			expect(res6.tag).toBeNull()
			expect(res6.data).toBeNull()
			expect(res6[symbol]).toBeSymbol()

			const res7 = method({ data: void(0) })
			expect(res7.status).toBe(status)
			expect(res7.tag).toBeNull()
			expect(res7.data).toBeNull()
			expect(res7[symbol]).toBeSymbol()
		})
	})
})