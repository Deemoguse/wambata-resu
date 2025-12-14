import { describe, test, expect } from 'bun:test';
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error';

describe('OkFromUnlessError and ErrorFromUnlessOk Functions', () => {

	const cases = <const>[
		[
			'_Ok.OkFromUnlessError (Conditional transformation of values)',
			{
				status: 'ok',
				transformMethod: _Ok.OkFromUnlessError,
				creatingResultMethod: _Ok.Ok,
			}
		],
		[
			'_Error.ErrorFromUnlessOk (Conditional transformation of values)',
			{
				status: 'error',
				transformMethod: _Error.ErrorFromUnlessOk,
				creatingResultMethod: _Error.Error,
			}
		],
	]

	describe.each(cases)('%s', (_, { status, transformMethod, creatingResultMethod }) => {
		test('Non-results are converted to a result with an optional tag', () => {
			const anyData = [1, 'string', { code: 200 }]
			anyData.forEach((data) => {
				const res1 = transformMethod(data)
				expect(res1.status).toBe(status)
				expect(res1.tag).toBeNull()
				expect(res1.data).toBe(data)

				const res2 = transformMethod(data, 'SomeTag')
				expect(res2.status).toBe(status)
				expect(res2.tag).toBe('SomeTag')
				expect(res2.data).toBe(data)
			})
		})

		test('The result created from the result is not the same object', () => {
			const res1 = creatingResultMethod()
			const res2 = transformMethod(res1)
			expect(res2).not.toBe(res1)
		})
	})


	describe('Data and a tag are extracted from the result. The tag can be redefined. A result with a different status is returned as it is', () => {
		const okRes = _Ok.Ok({ data: 'ok', tag: 'OkTag' })
		const errorRes = _Error.Error({ data: 'error', tag: 'ErrorTag' })

		test('`Result.Ok` is returned as is when passed to `Result.ErrorFromUnlessOk` and vice versa', () => {
			const errorFromOk = _Error.ErrorFromUnlessOk(okRes)
			expect(errorFromOk).toBe(okRes)
			const errorFromOkWithTag = _Error.ErrorFromUnlessOk(okRes, 'OverrideOkTag')
			expect(errorFromOkWithTag.tag).toBe('OkTag')

			const okFromError = _Ok.OkFromUnlessError(errorRes)
			expect(okFromError).toBe(errorRes)
			const okFromErrorWithTag = _Ok.OkFromUnlessError(errorRes, 'OverrideErrorTag')
			expect(okFromErrorWithTag.tag).toBe('ErrorTag')
		})
	})
})