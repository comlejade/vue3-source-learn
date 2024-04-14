// 懒执行，只有使用的时候才执行
// 缓存机制，数据不变只执行一次

import { isFunction } from "@vue/shared";
import { effect } from "./effect";

class ComputedRefImpl {
  public _dirty = true; // 默认获取执行
  public _value;
  public effect; // 收集依赖
  constructor(getter, public setter) {
    this.effect = effect(getter, {
      lazy: true,
      sch: () => {
        // 修改数据的时候执行
        if (!this._dirty) {
          this._dirty = true;
        }
      },
    });
  }

  // 获取 myAge.value => getter 方法中的值
  get value() {
    if (this._dirty) {
      this._value = this.effect(); // 获取用户的值
      this._dirty = false;
    }
    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}

export function computed(getterOrOptions) {
  // 函数或对象
  // 处理数据
  let getter;
  let setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("computed value must be readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}
