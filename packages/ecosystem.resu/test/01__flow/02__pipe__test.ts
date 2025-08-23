import { describe, test, expect } from 'bun:test'
import { _Pipe } from '../../src/modules/flow/partials/public.pipe'
import { _Result } from '../../src/modules/result'
import { _Ok } from '../../src/modules/result/partials/public.ok'
import { _Error } from '../../src/modules/result/partials/public.error'

// ЧЕКЛИСТ:
// - [X] Pipe создает цепочку дествий без вызова.
// - [X] Результат Pipe это всегда `Result`.
// - [X] Pipe корректно обрабатывает цепечку действий.
// - [X] Pipe не сохраняет результат предыдущего вызовы в внутреннем состоянии.
// - [X] Pipe завершает цепочку выполнений и возвращает результат, если одно из действий вернуло `Result.Error`.
// - [X] Pipe итерируется с помощью `for of`.
// - [X] Итерация Pipe прерывается если одно из действий вернет `Result.Error`. Последний `Result.Error` должен вернуться как значение.

// CHECKLIST:
// - [X] Pipe creates a chain of actions without calling.
// - [X] The result of Pipe is always a `Result`.
// - [X] Pipe correctly handles a chain of actions.
// - [X] Pipe does not store the result of the previous call in its internal state.
// - [X] Pipe completes the chain of actions and returns the result if one of the actions returns a `Result.Error`.
// - [X] Pipe can be iterated using `for of`.
// - [X] The Pipe iteration is interrupted if one of the actions returns `Result.Error`. The last `Result.Error` must be returned as a value.

describe('Pipe (Processing along the chain)', () => {

	test('Pipe creates a chain of actions without calling', () => {
		const syncPipe = _Pipe.Sync(1)(x => x.data * 2)
		expect(syncPipe).toBeFunction()

		const asyncPipe = _Pipe.Async(1)(x => x.data * 2)
		expect(asyncPipe).toBeFunction()
	})

	test('The result of Pipe is always a `Result`', async () => {
		const syncPipeRes = _Pipe.Sync(1)(x => x.data * 2)()
		expect(_Result.IsResult(syncPipeRes)).toBeTrue()

		const asyncPipeRes = _Pipe.Async(1)(x => x.data * 2)()
		expect(asyncPipeRes).toBeInstanceOf(Promise)
		expect(_Result.IsResult(await asyncPipeRes)).toBeTrue()
	})

	test('Pipe correctly handles a chain of actions', async () => {
		const syncPipeRes = _Pipe.Sync(1)(x => _Result.OkFrom(x.data * 2))(x => x.data * 2)()
		expect(_Result.IsResult(syncPipeRes)).toBeTrue()
		expect(syncPipeRes.data).toBe(4)

		const asyncPipeRes = _Pipe.Async(1)(x => _Result.OkFrom(x.data * 2))(x => x.data * 2)()
		expect(asyncPipeRes).toBeInstanceOf(Promise)
		expect(_Result.IsResult(await asyncPipeRes)).toBeTrue()
		expect((await asyncPipeRes).data).toBe(4)
	})

	test('Pipe does not store the result of the previous call in its internal state', () => {
		const syncPipe = _Pipe.Sync(1)(x => _Result.OkFrom(x.data * 2))(x => x.data * 2)

		const syncPipeRes1 = syncPipe()
		const syncPipeRes2 = syncPipe()
		;[syncPipeRes1, syncPipeRes2].forEach((res) => {
			expect(_Result.IsResult(res)).toBeTrue()
			expect(res.data).toBe(4)
		})

		const asyncPipe = _Pipe.Async(1)(x => _Result.OkFrom(x.data * 2))(x => x.data * 2)

		const asyncPipe1 = asyncPipe()
		const asyncPipe2 = asyncPipe()
		;[asyncPipe1, asyncPipe2].forEach(async (res) => {
			expect(res).toBeInstanceOf(Promise)
			expect(_Result.IsResult(await res)).toBeTrue()
			expect((await res).data).toBe(4)
		})
	})

	test('Pipe completes the chain of actions and returns the result if one of the actions returns a `Result.Error`', async () => {
		const syncPipe = _Pipe.Sync(1)
			(x => _Result.OkFrom(x.data * 2))
			(_ => _Result.Error({ tag: 'Error' }))
			((x: any) => x.data * 2)

		const syncPipeRes = syncPipe()
		expect(_Result.IsError(syncPipeRes)).toBeTrue()
		expect(syncPipeRes.tag).toBe('Error')

		const asyncPipe = _Pipe.Async(1)
			(x => _Result.OkFrom(x.data * 2))
			(_ => _Result.Error({ tag: 'Error' }))
			((x: any) => x.data * 2)

		const asyncPipeRes = asyncPipe()
		expect(asyncPipeRes).toBeInstanceOf(Promise)
		expect(_Result.IsError(await asyncPipeRes)).toBeTrue()
		expect((await asyncPipeRes).tag).toBe('Error')
	})


	test('Pipe can be iterated using `for of`', async () => {
		const syncPipe = _Pipe.Sync(1)
			(x => _Result.OkFrom(x.data * 2 as 2))
			(x => x.data * 2 as 4)
			(x => x.data * 2 as 8)

		for (const res of syncPipe) {
			expect(_Result.IsResult(res)).toBeTrue()
			expect(res.data).toBeNumber()
		}

		const asyncPipe = _Pipe.Async(1)
			(x => _Result.OkFrom(x.data * 2 as 2))
			(x => x.data * 2 as 4)
			(x => x.data * 2 as 8)

		for await (const res of asyncPipe) {
			expect(_Result.IsResult(res)).toBeTrue()
			expect(res.data).toBeNumber()
		}
	})

	test('Pipe can be iterated using `for of`', async () => {
		const syncPipe = _Pipe.Sync(1)
			(x => _Result.OkFrom(x.data * 2))
			(_ => _Result.Error({ tag: 'Error' }))
			((x: any) => x.data * 2)

		let syncStep = 0
		let syncLastRes!: _Result.Any
		for (const res of syncPipe) {
			syncStep += 1
			syncLastRes = res
			expect(_Result.IsResult(res)).toBeTrue()
		}
		expect(_Result.IsError(syncLastRes)).toBeTrue()
		expect(syncLastRes.tag).toBe('Error')


		const asyncPipe = _Pipe.Async(1)
			(x => _Result.OkFrom(x.data * 2))
			(_ => _Result.Error({ tag: 'Error' }))
			((x: any) => x.data * 2)

		let asyncStep = 0
		let asyncLastRes!: _Result.Any
		for await (const res of asyncPipe) {
			asyncStep += 1
			asyncLastRes = res
			expect(_Result.IsResult(res)).toBeTrue()
		}
		expect(_Result.IsError(asyncLastRes)).toBeTrue()
		expect(asyncLastRes.tag).toBe('Error')
	})
})