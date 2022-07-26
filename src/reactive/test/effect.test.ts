// @vitest-environment happy-dom

import { describe, expect, test, vi } from 'vitest'
import { effect, reactive } from '../index'

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
})
