// @vitest-environment happy-dom

import { describe, expect, test, vi } from 'vitest'
import { effect, reactive } from '../index.mjs'

describe('effect', () => {
  test('cb run when effect run', () => {
    const effectCbSpy = vi.fn(() => console.log('effect run'))
    effect(effectCbSpy)
    expect(effectCbSpy).toHaveBeenCalledTimes(1)
  })

  test('deps run reactively', () => {
    let dummy
    const obj = reactive({ num: 1 })
    effect(() => {
      dummy = obj.num
    })
    expect(dummy).toBe(1)

    obj.num = 3
    expect(dummy).toBe(3)
  })

  test('nested effect', () => {
    const obj = reactive({
      outerCounter: 0,
      innerCounter: 0,
    })

    let temp1, temp2

    const innerSpy = vi.fn(() => {
      temp2 = obj.innerCounter
    })
    const outerSpy = vi.fn((fn: Function) => {
      fn()
      temp1 = obj.outerCounter
    })

    effect(() => outerSpy(() => effect(innerSpy)))

    expect(outerSpy).toHaveBeenCalledTimes(1)
    expect(innerSpy).toHaveBeenCalledTimes(1)
    expect(temp1).toBe(0)
    expect(temp2).toBe(0)

    obj.outerCounter = 1
    expect(temp1).toBe(1)
    expect(temp2).toBe(0)
    expect(outerSpy).toHaveBeenCalledTimes(2)
    expect(innerSpy).toHaveBeenCalledTimes(2)

    obj.innerCounter = 1
    expect(temp1).toBe(1)
    expect(temp2).toBe(1)

    expect(outerSpy).toHaveBeenCalledTimes(2)
    expect(innerSpy).toHaveBeenCalledTimes(3) // TODO: received 4 expect to 3
  })
})
