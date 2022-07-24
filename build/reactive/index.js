let activeEffect = undefined;
export function effect(fn) {
    activeEffect = fn;
    fn?.();
}
export function reactive(target) {
    const proxyMap = new WeakMap();
    console.log(proxyMap);
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
    }
    function trigger(target, key) {
        const depsMap = proxyMap.get(target);
        if (!depsMap)
            return;
        const effects = depsMap.get(key);
        effects?.forEach((effect) => effect());
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
