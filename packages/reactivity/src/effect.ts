import { isArray, isIntegerKey } from "@vue/shared";
import { TriggerOpTypes } from "./operations";

// effect 收集依赖，更新视图
export function effect(fn, options: any = {}) {
  const effect = createReactEffect(fn, options);
  // 判断一下
  if (!options.lazy) {
    effect(); // 默认执行
  }

  return effect;
}

let uid = 0;
let activeEffect;
const effectStack = [];
function createReactEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        // 入栈
        // console.log("入栈effect", effect);
        effectStack.push(effect);
        activeEffect = effect;
        return fn(); // 执行用户的方法
      } finally {
        //出栈
        // console.log("effectStack", effectStack);
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };

  // 区别effect
  effect.id = uid++;
  // 是否是响应式
  effect._isEffect = true;
  // 保存用户方法
  effect.raw = fn;
  // 保存用户的属性
  effect.options = options;

  return effect;
}

// 创建依赖收集表
let targetMap = new WeakMap();
// 3 收集effect，获取数据 get 时收集
export function track(target, type, key) {
  // console.log("收集依赖", target);
  // console.log("activeEffect", activeEffect);
  if (activeEffect === undefined) {
    // 没有在effect中使用
    return;
  }

  // 获取effect
  let depMap = targetMap.get(target);
  if (!depMap) {
    targetMap.set(target, (depMap = new Map())); // 添加值
  }

  // 有
  let dep = depMap.get(key);
  if (!dep) {
    depMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }

  // console.log("targetMap", targetMap);
}
// 属性嵌套结构，用栈处理
// effect(() => {   //收集effect1
//     state.name
//     effect(() => {   //收集effect2
//         state.age
//     })
//     state.a  //收集effect1
// })

export function trigger(target, type, key?, newValue?, oldValue?) {
  // console.log(target, type, key, newValue, oldValue);
  // 触发依赖
  const depsMap = targetMap.get(target);
  // console.log("depsMap", depsMap); // name => set[]
  if (!depsMap) {
    return;
  }
  // const effects = depsMap.get(key);
  // console.log(effects);
  // 如果有多个同时修改一个值，并且相同，set过滤一下
  let effectSet = new Set();
  const add = (effectAdd) => {
    if (effectAdd) {
      effectAdd.forEach((effect) => {
        effectSet.add(effect);
      });
    }
  };

  // 获取当前属性的 effect
  add(depsMap.get(key));
  // console.log(effectSet);
  // console.log(key);
  // 处理数组 key === length
  if (key === "length" && isArray(target)) {
    // console.log("key length", depsMap);
    depsMap.forEach((dep, key) => {
      console.log(dep, key, newValue);
      if (key === "length" || key >= newValue) {
        add(dep);
      }
    });
  } else {
    // 可能是对象
    if (key !== undefined) {
      // 获取当前属性的 effect
      add(depsMap.get(key));
    }
    // console.log("key else", depsMap);
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get("length"));
        }
    }
  }

  // 执行依赖
  // console.log("执行依赖", effectSet);
  effectSet.forEach((effect: any) => {
    if (effect.options.sch) {
      // 处理 computed 中的 sch
      // 当computed 依赖的数据发生改变的时候，
      // 改变 dirty的状态
      effect.options.sch(effect);
    } else {
      effect();
    }
  });
}
