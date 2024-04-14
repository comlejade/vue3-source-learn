// 创建vnode
// createVnode = h('div' {style: {color: red}})

import { ShapeFlags, isArray, isObject, isString } from "@vue/shared";

export const createVnode = (type, props, children = null) => {
  //   console.log(rootComponent, rootProps);
  // 区分是组件还是元素
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;

  let vnode = {
    _v_isVnode: true, // 是一个虚拟节点
    type,
    props,
    children,
    key: props && props.key, // diff 会用到
    el: null, // 和真实的元素对应
    shapeFlag,
    component: {},
  };

  // children 标识
  normalizeChildren(vnode, children);

  return vnode;
};

function normalizeChildren(vnode, children) {
  let type = 0;

  if (children == null) {
  } else if (isArray(children)) {
    // 数组
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    // 文本
    type = ShapeFlags.TEXT_CHILDREN;
  }

  // 这里是按位或的操作，将子节点的类型和当前节点的类型合并
  // 让他能够标识chilren节点的类型
  vnode.shapeFlag = vnode.shapeFlag | type;
}

export function isVnode(vnode) {
  return vnode._v_isVnode;
}

export const TEXT = Symbol("text");

// 元素的 children 变成 vnode
export function cVnode(child) {
  // 元素 ['text'] [h()]
  if (isObject(child)) {
    return child;
  }

  // 处理文本类型
  return createVnode(TEXT, null, String(child));
}
