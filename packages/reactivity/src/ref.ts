import { hasChange, isArray } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

// 使用 toRefs
export function ref(target) {
  return createRef(target);
}

export function shallowRef(target) {
  return createRef(target, true);
}

class RefImpl {
  public __v_isRef = true; // 标识是ref代理
  public _value; // 声明

  constructor(public rawValue, public shallow) {
    this._value = rawValue; // 用户传进来的值
  }

  // 类的属性访问器
  // 实现响应式，收集依赖 track 触发更新 trigger
  get value() {
    track(this, TrackOpTypes.GET, "value");
    return this._value;
  }

  set value(newValue) {
    // console.log(newValue, this._value);
    if (hasChange(newValue, this._value)) {
      this._value = newValue;
      this.rawValue = newValue;
      trigger(this, TriggerOpTypes.SET, "value", newValue, this._value);
    }
  }
}

function createRef(rawValue, shallow = false) {
  // 创建 ref 实例对象
  return new RefImpl(rawValue, shallow);
}

class ObjectRefImpl {
  public __v_isRef;

  constructor(public target, public key) {}

  // 获取 myAge.value
  get value() {
    return this.target[this.key];
  }

  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

// 实现 toRef
// 将对象的某个属性转成 ref 对象
// 可以是不存在的属性
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

// 实现toRefs
// 可以将一个响应式对象转成普通对象，但是这个普通对象的每个属性都是ref对象
// 可以防止响应式对象结构的时候发生响应式丢失的情况
// 但是它只能处理对象本身已存在的属性
// 不能添加属性
export function toRefs(target) {
  // 遍历所有的属性，变成ref实例
  let ret = isArray(target) ? new Array(target.length) : {};
  for (let key in target) {
    ret[key] = toRef(target, key);
  }
  return ret;
}
