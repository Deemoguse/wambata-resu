import { describe, test, expect } from 'bun:test';
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error';

describe('Result Pattern - IsOk and IsError Functions', () => {

	const cases = <const>[
		[
			'_Ok.IsOk (identification of the success object)',
			{ status: 'ok', identificationMethod: _Ok.IsOk, creatingResultMethod: _Ok.Ok }
		],
		[
			'_Error.IsError (identification of the error object)',
			{ status: 'error', identificationMethod: _Error.IsError, creatingResultMethod: _Error.Error }
		],
	]

	describe.each(cases)('%s', (_, { status, identificationMethod, creatingResultMethod }) => {
		test('Distinguishes the result object from any other data types', () => {
			const res = creatingResultMethod()
			expect(identificationMethod(res)).toBeTrue()

			const otherDataTypes = [
				true, false, null, undefined, void(0),
				1, 1.0, 1n,
				'string',
				[], {}, class {}, new class {}, function () {},
				Symbol()
			]
			otherDataTypes.forEach((data) => expect(identificationMethod(data)).toBeFalse())
		})

		test('Distinguishes a fake result from a result created by the `Result` functions', () => {
			const fakeRes = { status, tag: 'SomeTag' }
			expect(identificationMethod(fakeRes)).toBeFalse()
		})
	})
})