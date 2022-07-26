let activeEffect = undefined;
const effectStack = [];
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
        effectStack.push(effectFn);
        fn?.();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
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
