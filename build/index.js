"use strict";
class Reactive {
    constructor(data) {
        this.data = undefined;
        this.bucket = new WeakMap();
        this.activeEffect = undefined;
        const that = this;
        this.data = new Proxy(data, {
            get(target, key) {
                that.track(target, key);
                return target[key];
            },
            set(target, key, newVal) {
                ;
                target[key] = newVal;
                that.trigger(target, key);
                return true;
            },
        });
    }
    effect(fn) {
        this.activeEffect = fn;
        fn();
    }
    track(target, key) {
        if (!this.activeEffect)
            return;
        let depsMap = this.bucket.get(target);
        if (!depsMap) {
            this.bucket.set(target, (depsMap = new Map()));
        }
        let effects = depsMap.get(key);
        if (!effects) {
            depsMap.set(key, (effects = new Set()));
        }
        effects.add(this.activeEffect);
    }
    trigger(target, key) {
        const depsMap = this.bucket.get(target);
        if (!depsMap)
            return false;
        const effects = depsMap.get(key);
        effects && effects.forEach((effect) => effect());
    }
}
const data = { text: 'hello world' };
const reactiveObj = new Reactive(data);
reactiveObj.effect(() => {
    const text = reactiveObj.data.text;
    console.log(text);
    document.body.innerHTML = text;
});
setTimeout(() => {
    reactiveObj.data.text = 'hello reactive!!!!!';
}, 1000);
