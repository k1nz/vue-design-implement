/**
 * *数据结构
 * targetObject
 *    key1
 *      effect1
 *      effect2
 *    key2
 *      effect3
 *      effect4
 * WeakMap(targetObject, Map(key, Set([effect1, effect2])))
 */

class Reactive<T extends Record<string, unknown>> {
  public data: T | undefined = undefined
  private bucket = new WeakMap<
    Record<string, unknown>,
    Map<string, Set<() => void>>
  >()
  private activeEffect: (() => void) | undefined = undefined
  constructor(data: T) {
    const that = this
    this.data = new Proxy(data, {
      // proxy中this指向proxy实例
      get(target, key: string) {
        // 将副作用函数加入"桶"中
        that.track(target, key)
        // 返回属性值
        return target[key]
      },
      set(target, key: string, newVal) {
        // 设置属性值
        ;(target as Record<string, unknown>)[key] = newVal
        // 从"桶"中取出副作用函数并执行
        that.trigger(target, key)
        return true
      },
    })
  }
  // 副作用函数注册器
  effect(fn: () => void) {
    // 将注册器中的函数作为激活中的副作用函数
    this.activeEffect = fn
    // 执行一次
    fn()
  }
  // get拦截函数调用track追踪变化
  private track(target: T, key: string) {
    // 当没有副作用函数时，直接return
    if (!this.activeEffect) return
    // 根据target从"桶"中获取相应的depsMap，depsMap为一个Map类型: Map.set(key, effects) new Map([key, effects])即 key --> effects
    let depsMap = this.bucket.get(target)
    // 如果depsMap不存在，则将新建一个Map与target关联
    if (!depsMap) {
      this.bucket.set(target, (depsMap = new Map()))
    }
    // 根据key从depsMap中获取effects，effects是一个Set类型: new Set([effect1, effect2])
    let effects = depsMap.get(key)
    // 如果effects不存在，则新建一个Set与key关联
    if (!effects) {
      depsMap.set(key, (effects = new Set()))
    }
    // 将当前激活的副作用函数加入"桶"中
    effects.add(this.activeEffect)
  }
  // set拦截函数内调用trigger函数触发变化
  private trigger(target: T, key: string) {
    // 根据target从"桶"中获取depsMap
    const depsMap = this.bucket.get(target)
    // 如果depsMap不存在，直接return
    if (!depsMap) return false
    // 根据key获取所有副作用函数effects
    const effects = depsMap.get(key)
    // 判断副作用函数是否存在，存在则遍历运行
    effects && effects.forEach((effect) => effect())
  }
}

const data = { text: 'hello world' }
const reactiveObj = new Reactive(data)
reactiveObj.effect(() => {
  if (!reactiveObj.data) return
  const text = reactiveObj.data.text
  console.log(text)
  document.body.innerHTML = text
})

setTimeout(() => {
  if (!reactiveObj.data) return
  reactiveObj.data.text = 'hello reactive!!!!!'
}, 1000)
