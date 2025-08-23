import { describe, test, expect } from 'bun:test';
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error';

describe('Ok and Error Functions', () => {

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

		test('Passes data and a tag. `Falsy` values for `data`, except for `undefined` and `void`, should not be converted to `null`', () => {
			const data = { code: 100 }

			const res1 = method({ data, tag: 'SomeTag' })
			expect(res1.status).toBe(status)
			expect(res1.tag).toBe('SomeTag')
			expect(res1.data).toBe(data)
			expect(res1[symbol]).toBeSymbol()

			const res2 = method({ data, tag: '' })
			expect(res2.status).toBe(status)
			expect(res2.tag).toBeNull()
			expect(res2.data).toBe(data)
			expect(res2[symbol]).toBeSymbol()

			const positiveFalsy = [ 0, '', false, null ]
			positiveFalsy.forEach((data) => {
				const res = method({ data })
				expect(res.status).toBe(status)
				expect(res.tag).toBeNull()
				expect(res.data).not.toBeNull()
				expect(res[symbol]).toBeSymbol()
			})

			const negativeFalsy = [ undefined, void(0) ]
			negativeFalsy.forEach((data) => {
				const res = method({ data })
				expect(res.status).toBe(status)
				expect(res.tag).toBeNull()
				expect(res.data).toBeNull()
				expect(res[symbol]).toBeSymbol()
			})
		})
	})
})