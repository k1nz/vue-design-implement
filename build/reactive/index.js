let activeEffect = undefined;
function cleanup(effectFn) {
    effectFn.deps.forEach((deps) => {
        deps.delete(effectFn);
    });
    effectFn.deps = new Set();
}
export function effect(fn) {
    const effectFn = () => {
        cleanup(effectFn);
        activeEffect = effectFn;
        fn?.();
    };
    effectFn.deps = new Set();
    effectFn();
}
export function reactive(target) {
    const proxyMap = new WeakMap();
    function track(target, key) {
        if (!activeEffect)
            return;
        let depsMap = proxyMap.get(target);
        if (!depsMap)
            proxyMap.set(target, (depsMap = new Map()));
        let deps = depsMap.get(key);
        if (!deps)
            depsMap.set(key, (deps = new Set()));
        deps.add(activeEffect);
        activeEffect.deps.add(deps);
    }
    function trigger(target, key) {
        const depsMap = proxyMap.get(target);
        if (!depsMap)
            return;
        const effects = depsMap.get(key);
        const effectsToRun = new Set(effects);
        effectsToRun.forEach((effect) => effect());
    }
    const proxyHandler = {
        get(target, key) {
            track(target, key);
            return Reflect.get(target, key);
        },
        set(target, key, newValue) {
            Reflect.set(target, key, newValue);
            trigger(target, key);
            return true;
        },
    };
    return new Proxy(target, proxyHandler);
}
const data = { text: 'hello world', times: 0 };
const reactiveObj = reactive(data);
effect(() => {
    const text = reactiveObj.text;
    console.log(text);
    document.body.innerHTML = text;
});
effect(() => {
    const times = reactiveObj.times;
    document.body.innerHTML = `${times}`;
    console.log(times);
});
const timer = setInterval(() => {
    if (reactiveObj.times < 5) {
        reactiveObj.times++;
    }
    else {
        clearInterval(timer);
        reactiveObj.text = 'hello reactive!!!!!';
    }
}, 1000);
