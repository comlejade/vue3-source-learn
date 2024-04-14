import { isObject } from "@vue/shared";
import {
  reactiveHanlder,
  shallowReactiveHandler,
  readonlyHandler,
  shallowReadonlyHandler,
} from "./baseHandler";

// 核心是 proxy， 源码中 柯里化，根据不同的参数处理
// 4个方法 是否只读，是否是深度

// 高阶函数，即使用函数作为参数或者返回一个函数的函数
export function reactive(target) {
  return createReactiveObj(target, false, reactiveHanlder);
}

export function shallowReactive(target) {
  return createReactiveObj(target, false, shallowReactiveHandler);
}

export function readonly(target) {
  return createReactiveObj(target, true, readonlyHandler);
}

export function shallowReadonly(target) {
  return createReactiveObj(target, true, shallowReadonlyHandler);
}

// 实现代理
// key 必须是对象
// 自动垃圾回收
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

function createReactiveObj(target, isReadonly, baseHandler) {
  // proxy() 对象
  if (!isObject(target)) {
    return target;
  }

  // 优化
  // 防止多次代理
  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const proxyExisit = proxyMap.get(target);

  if (proxyExisit) {
    return proxyExisit;
  }

  const proxy = new Proxy(target, baseHandler);
  proxyMap.set(target, proxy);

  return proxy;
}
