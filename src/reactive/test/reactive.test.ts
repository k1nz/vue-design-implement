import { describe, expect, test } from 'vitest'
import { reactive } from '../index.mjs'

describe('reactive', () => {
  test('copy', () => {
    const data = { text: 'hello world', times: 0 }
    const reactiveObj = reactive(data)
    expect(reactiveObj).not.toBe(data)
    expect(reactiveObj.text).toMatch(data.text)
    expect(reactiveObj.times).toBe(data.times)
  })
})
