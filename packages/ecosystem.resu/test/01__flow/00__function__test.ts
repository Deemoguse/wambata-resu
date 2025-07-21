import { describe, test, expect } from 'bun:test';
import { _Function } from '../../src/modules/flow/partials/public.function'
import { _Ok } from '../../src/modules/result/partials/public.ok';
import { _Error } from '../../src/modules/result/partials/public.error';

describe('Sync and Async in Flow.Function', () => {

	const anyData = [1, '', { code: 200 }]

	test('Flow.Function.Sync. Non-results are always returned as `Result.Ok`, any results are returned as is', () => {
		anyData.forEach((data) => {
			const syncFn = _Function.Sync(() => data)
			const syncFnRes = syncFn()
			expect(syncFnRes.status).pass
			expect(syncFnRes.tag).toBeNull()
			expect(syncFnRes.data).toBe(data)
		})

		const anyRes = [
			_Ok.Ok({ data: anyData, tag: 'SomeTag' }),
			_Error.Error({ data: anyData, tag: 'SomeTag' }),
		]
		anyRes.forEach((res) => {
			const syncFn = _Function.Sync(() => res)
			const syncFnRes = syncFn()
			expect(syncFnRes.status).toMatch(/^(ok|error)$/m)
			expect(syncFnRes.tag).toBe('SomeTag')
			expect(syncFnRes.data).toBe(anyData)
		})
	})

	test('Flow.Function.Async.The function always returns a Promise. Non-results are always returned as `Result.Ok`, any results are returned as is', async () => {
		anyData.forEach(async (data) => {
			const asyncFn = _Function.Async(async () => data)
			const asyncFnRes = asyncFn()
			expect(asyncFnRes).toBeInstanceOf(Promise)

			const resolvedAsyncFnRes = await asyncFnRes
			expect(resolvedAsyncFnRes.status).pass
			expect(resolvedAsyncFnRes.tag).toBeNull()
			expect(resolvedAsyncFnRes.data).toBe(data)
		})

		const anyRes = [
			_Ok.Ok({ data: anyData, tag: 'SomeTag' }),
			_Error.Error({ data: anyData, tag: 'SomeTag' }),
		]
		anyRes.forEach(async (res) => {
			const asyncFn = _Function.Async(async () => res)
			const asyncFnRes = asyncFn()
			expect(asyncFnRes).toBeInstanceOf(Promise)

			const resolvedAsyncFnRes = await asyncFnRes
			expect(resolvedAsyncFnRes.status).toMatch(/^(ok|error)$/m)
			expect(resolvedAsyncFnRes.tag).toBe('SomeTag')
			expect(resolvedAsyncFnRes.data).toBe(anyData)
		})
	})
})