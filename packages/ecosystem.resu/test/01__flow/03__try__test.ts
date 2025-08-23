import { describe, test, expect } from 'bun:test'
import { _Try } from '../../src/modules/flow/partials/public.try'
import { _Result } from '../../src/modules/result'

// - [X] `Try` correctly catches errors and wraps them in `Result.Error`
// - [X] `Try` correctly handles the return cases of a custom `Result.Error` in `try` and `catch`
// - [X] `Try` and `Try->arg.try` wraps an unsuccessful result in `Result.Ok`
// - [X] `Try` and `Try->arg.try` returns the result as it is.
// - [X] `Try->arg.catch` wraps an unsuccessful result in `Result.Error`
// - [X] `Try->arg.catch' returns the result as it is.
// - [X] `Try.Async` correctly handles `abort` if `signal` is passed

describe('Try (Error Interception)', () => {
	const okRes = _Result.Ok({ data: 1, tag: 'SomeOk' })
	const errorRes = _Result.Error({ data: 1, tag: 'SomeError' })

	test('`Try` correctly catches errors and wraps them in `Result.Error`', async () => {
		const syncTryRes = _Try.Sync(() => {
			if (1) throw new Error()
			return 1
		})
		expect(_Result.IsResult(syncTryRes)).toBeTrue()
		expect(syncTryRes.status).toBe('error')
		expect(syncTryRes.tag).toBeNull()
		expect(syncTryRes.data).toBeInstanceOf(Error)

		const asyncTryRes = _Try.Async(async () => {
			if (1) throw new Error()
			return 1
		})
		expect(asyncTryRes).toBeInstanceOf(Promise)
		expect(_Result.IsResult(await asyncTryRes)).toBeTrue()
		expect((await asyncTryRes).status).toBe('error')
		expect((await asyncTryRes).tag).toBeNull()
		expect((await asyncTryRes).data).toBeInstanceOf(Error)
	})

	test('`Try` correctly handles the return cases of a custom `Result.Error` in `try` and `catch`', async () => {
		[
			_Try.Sync(() => errorRes),
			_Try.Sync({ try: () => errorRes }),
			_Try.Sync({ try: () => { throw new Error() }, catch: () => errorRes }),
			await _Try.Async(async () => errorRes),
			await _Try.Async({ try: async () => errorRes }),
			await _Try.Async({ try: async() => { throw new Error() }, catch: () => errorRes })
		].forEach((res) => {
			expect(res).toBe(errorRes)
		})
	})

	test('`Try` and `Try->arg.try` wraps an unsuccessful result in `Result.Ok`', async () => {
		const syncRes1 = _Try.Sync(() => 1)
		expect(_Result.IsOk(syncRes1)).toBeTrue()
		expect(syncRes1.status).toBe('ok')
		expect(syncRes1.tag).toBeNull()
		expect(syncRes1.data).toBe(1)

		const syncRes2 = _Try.Sync({ try: () => 1 })
		expect(_Result.IsOk(syncRes2)).toBeTrue()
		expect(syncRes2.status).toBe('ok')
		expect(syncRes2.tag).toBeNull()
		expect(syncRes2.data).toBe(1)

		const asyncRes1 = _Try.Async(async () => 1)
		expect(asyncRes1).toBeInstanceOf(Promise)
		expect(_Result.IsOk(await asyncRes1)).toBeTrue()
		expect((await asyncRes1).status).toBe('ok')
		expect((await asyncRes1).tag).toBeNull()
		expect((await asyncRes1).data).toBe(1)

		const asyncRes2 = _Try.Async({ try: async () => 1 })
		expect(asyncRes2).toBeInstanceOf(Promise)
		expect(_Result.IsOk(await asyncRes2)).toBeTrue()
		expect((await asyncRes2).status).toBe('ok')
		expect((await asyncRes2).tag).toBeNull()
		expect((await asyncRes2).data).toBe(1)
	})

	test('`Try` and `Try->arg.try` returns the result as it is.`', async () => {
		const syncRes1 = _Try.Sync(() => okRes)
		expect(syncRes1).toBe(okRes)
		const syncRes2 = _Try.Sync({ try: () => okRes })
		expect(syncRes2).toBe(okRes)

		const asyncRes1 = _Try.Async( async () => okRes)
		expect(asyncRes1).toBeInstanceOf(Promise)
		expect(await asyncRes1).toBe(okRes)
		const asyncRes2 = _Try.Async({ try: async () => okRes })
		expect(asyncRes2).toBeInstanceOf(Promise)
		expect(await asyncRes2).toBe(okRes)
	})

	test('`Try` and `Try->arg.catch` wraps an unsuccessful result in `Result.Error`', async () => {
		const syncRes = _Try.Sync({
			try: () => { throw null },
			catch: () => 1
		})
		expect(_Result.IsOk(syncRes)).toBeTrue()
		expect(syncRes.status).toBe('error')
		expect(syncRes.tag).toBeNull()
		expect(syncRes.data).toBe(1)

		const asyncRes = _Try.Async({
			try: async () => { throw null },
			catch: () => 1
		})
		expect(asyncRes).toBeInstanceOf(Promise)
		expect(_Result.IsOk(await asyncRes)).toBeTrue()
		expect((await asyncRes).status).toBe('error')
		expect((await asyncRes).tag).toBeNull()
		expect((await asyncRes).data).toBe(1)
	})

	test('`Try` and `Try->arg.catch` returns the result as it is', async () => {
		const syncRes = _Try.Sync({
			try: () => { throw null },
			catch: () => errorRes
		})
		expect(_Result.IsOk(syncRes)).toBeTrue()
		expect(syncRes).toBe(errorRes)

		const asyncRes = _Try.Async({
			try: async () => { throw null },
			catch: () => errorRes
		})
		expect(asyncRes).toBeInstanceOf(Promise)
		expect(_Result.IsOk(await asyncRes)).toBeTrue()
		expect(await asyncRes).toBe(errorRes)
	})

	test('`Try.Async` correctly handles `abort` if `signal` is passed', async () => {
		const ctrl = new AbortController()
		setTimeout(() => ctrl.abort(), 5_000)

		const res = await _Try.Async({
			signal: ctrl.signal,
			try: (signal) => new Promise<1>((res, rej) => {
				setTimeout(() => res(1), 10_000)
				signal.addEventListener('abort', () => rej(1))
			}),
			catch: () => errorRes,
		})

		expect(_Result.IsError(res)).toBeTrue()
		expect(res.data).toBe(1)
		expect(res.tag).toBe('AbortError')
	})
})