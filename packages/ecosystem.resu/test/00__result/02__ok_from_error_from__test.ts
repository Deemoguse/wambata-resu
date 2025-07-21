import { describe, test, expect } from 'bun:test'
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error'

describe('OkFrom and ErrorFrom Functions', () => {

	const cases = <const>[
		[
			'_Ok.OkFrom (Conditional transformation of values)',
			{ status: 'ok', transformMethod: _Ok.OkFrom, creatingResultMethod: _Ok.Ok, symbol: _Ok.OK_SYMBOL }
		],
		[
			'_Error.ErrorFrom (Conditional transformation of values)',
			{ status: 'error', transformMethod: _Error.ErrorFrom, creatingResultMethod: _Error.Error, symbol: _Error.ERROR_SYMBOL }
		],
	]

	describe.each(cases)('%s', (_, { status, transformMethod, creatingResultMethod, symbol }) => {
		test('Non-results are converted to a result with an optional tag', () => {
			const anyData = [1, 'string', { code: 200 }]
			anyData.forEach((data) => {
				const res1 = transformMethod(data)
				expect(res1.status).toBe(status)
				expect(res1.tag).toBeNull()
				expect(res1.data).toBe(data)
				expect(res1[symbol]).toBeSymbol()

				const res2 = transformMethod(data, 'SomeTag')
				expect(res2.status).toBe(status)
				expect(res2.tag).toBe('SomeTag')
				expect(res2.data).toBe(data)
				expect(res2[symbol]).toBeSymbol()
			})
		})

		test('Data and a tag are extracted from the result. The tag can be redefined', () => {
			const data = { code: 200 }
			const anyRes = cases.map((el) => el[1].creatingResultMethod({ data, tag: 'InitialTag' }))
			anyRes.forEach((el) => {
				const res1 = transformMethod(el)
				expect(res1.status).toBe(status)
				expect(res1.tag).toBeNull()
				expect(res1.data).toBe(data)
				expect(res1[symbol]).toBeSymbol()

				const res2 = transformMethod(el, 'SomeTag')
				expect(res2.status).toBe(status)
				expect(res2.tag).toBe('SomeTag')
				expect(res2.data).toBe(data)
				expect(res2[symbol]).toBeSymbol()
			})
		})

		test('The result created from the result is not the same object', () => {
			const res1 = creatingResultMethod()
			const res2 = transformMethod(res1)
			expect(res2).not.toBe(res1)
		})
	})
})