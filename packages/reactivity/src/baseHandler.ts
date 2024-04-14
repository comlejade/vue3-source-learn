import {
  extend,
  hasChange,
  hasOwn,
  isArray,
  isIntegerKey,
  isObject,
} from "@vue/shared";
import { reactive, readonly } from "./reactive";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { track, trigger } from "./effect";

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

// 柯里化，根据不同的参数来处理逻辑
// 1. 是否 只读  2. 是否 深

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    // proxy + reflect
    const res = Reflect.get(target, key, receiver);

    if (!isReadonly) {
      // 不是只读，收集依赖
      track(target, TrackOpTypes.GET, key);
    }

    if (isShallow) {
      // 是否是浅代理，如果是直接返回，只代理第一层
      return res;
    }

    // 如果是对象，递归处理
    // 懒代理，不进行取值操作不会处理代理逻辑
    // 提升性能
    if (isObject(res)) {
      // 递归
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

// set 是否 深
const set = createSetter();
const shallowSet = createSetter(true);

function createSetter(isShallow = false) {
  return function set(target, key, value, receiver) {
    // 取旧值

    const oldValue = target[key];
    // console.log("oldValue", oldValue);
    // 2 判断是否有这个属性
    const hasKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);

    const result = Reflect.set(target, key, value, receiver);
    // 处理新增还是修改
    if (!hasKey) {
      // 新增
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else {
      // 修改
      // 如果新值和旧值一样，不需要触发
      // 只有改变才触发
      // console.log("触发修改", value, oldValue);
      if (hasChange(value, oldValue)) {
        // console.log("进入修改");
        trigger(target, TriggerOpTypes.SET, key, value, oldValue);
      }
    }

    return result;
  };
}

export const reactiveHanlder = {
  get,
  set,
};

export const shallowReactiveHandler = {
  get: shallowGet,
  set: shallowSet,
};

let readonlyObj = {
  set: (target, key, value, receiver) => {
    console.warn(`set ${target} on ${key} failed`);
  },
};

export const readonlyHandler = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);

export const shallowReadonlyHandler = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
);
