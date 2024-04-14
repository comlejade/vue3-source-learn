// 生成 vnode
// h函数的写法较多，需要判断参数
// h('div', {})
// h('div', 'span')
// h('div', h('span'))
// h('div', {}, 'span')
// h('div', {}, ['span'])

import { isObject } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

// h('div', {}, [h('span')])
export function h(type, propsOrChildren?, children?) {
  // 参数
  const i = arguments.length; // 参数个数

  if (i === 2) {
    // 元素 + 属性
    // 元素 + children
    if (isObject(propsOrChildren)) {
      // 如果是对象，又分两种情况，是props 或者 h函数
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren]);
      }

      // 有props没有children
      return createVnode(type, propsOrChildren);
    } else {
      // 不是对象，就是children
      return createVnode(type, null, propsOrChildren);
    }
  } else {
    if (i > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (i === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
}
