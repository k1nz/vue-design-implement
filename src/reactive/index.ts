/**
 * Effect(function Effect1() {
 *   targetObject.key1
 *   targetObject.key2
 * })
 * Effect(function Effect2() {
 *   targetObject.key1
 * })
 * Effect(function Effect3() {
 *   targetObject.key2
 * })
 *
 * *数据结构
 * targetObject
 *   |- key1
 *   |    |- effect1
 *   |    |- effect2
 *   |- key2
 *        |- effect1
 *        |- effect3
 * WeakMap(targetObject, Map(key, Set([effect1, effect2])))
 */

type Effect = Function | undefined
let activeEffect: Effect = undefined

export function effect(fn) {
  activeEffect = fn
  fn?.()
}

export function reactive<T extends Record<string, unknown>>(target: T): T {
  const proxyMap = new WeakMap<Record<string, unknown>, Map<string, Set<Effect>>>()
  console.log(proxyMap)

  // get拦截函数调用track追踪变化
  function track(target: T, key: string) {
    // 当没有副作用函数时，直接return
    if (!activeEffect) return

    // 根据target从"桶"中获取相应的depsMap，depsMap为一个Map类型: Map.set(key, effects) new Map([key, effects])即 key --> effects
    let depsMap = proxyMap.get(target)
    // 如果depsMap不存在，则将新建一个Map与target关联
    if (!depsMap) proxyMap.set(target, (depsMap = new Map()))

    // 根据key从depsMap中获取effects，effects是一个Set类型: new Set([effect1, effect2])
    let deps = depsMap.get(key)
    // 如果effects不存在，则新建一个Set与key关联
    if (!deps) depsMap.set(key, (deps = new Set()))

    // 将当前激活的副作用函数加入"桶"中
    deps.add(activeEffect)
  }

  // 判断副作用函数是否存在，存在则遍历运行
  function trigger(target: T, key: string) {
    // get拦截函数调用track追踪变化
    const depsMap = proxyMap.get(target)
    // 当没有副作用函数时，直接return
    if (!depsMap) return
    // 根据key获取所有副作用函数effects
    const effects = depsMap.get(key)
    // 判断副作用函数是否存在，存在则遍历运行
    effects?.forEach((effect) => effect())
  }

  const proxyHandler: ProxyHandler<T> = {
    get(target, key: string) {
      track(target, key)
      return Reflect.get(target, key)
    },
    set(target, key: string, newValue) {
      Reflect.set(target, key, newValue)
      trigger(target, key)
      return true
    },
  }

  return new Proxy(target, proxyHandler)
}

const data = { text: 'hello world', times: 0 }
const reactiveObj = reactive(data)
effect(() => {
  const text = reactiveObj.text
  console.log(text)
  document.body.innerHTML = text
})

effect(() => {
  const times = reactiveObj.times
  document.body.innerHTML = `${times}`
  console.log(times)
})

const timer = setInterval(() => {
  if (reactiveObj.times < 5) {
    reactiveObj.times++
  } else {
    clearInterval(timer)
    reactiveObj.text = 'hello reactive!!!!!'
  }
}, 1000)
