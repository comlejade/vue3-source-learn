import { ShapeFlags } from "@vue/shared";
import { effect } from "@vue/reactivity";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { TEXT, cVnode } from "./vnode";

export const createRender = (renderOptionDOM) => {
  // 获取全部的DOM操作
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
  } = renderOptionDOM;

  function setupRenderEffect(instance, container) {
    // 创建 effect
    effect(function componentEffect() {
      // 需要创建一个 effect 在effect中调用render
      // 这样render方法中获取数去会收集这个effect
      // 属性改变重新执行r
      if (!instance.isMounted) {
        // 第一次加载
        // 获取到 render 的返回值
        // 组件实例
        // console.log("挂载");
        let proxy = instance.proxy;
        // 执行 render
        // 得到了需要渲染的节点vnode
        let subTree = (instance.subTree = instance.render.call(proxy, proxy));
        // console.log(subTree);
        // 渲染子树
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // console.log("更新");
        // 更新操作
        // 比对 旧和新
        let proxy = instance.proxy;
        // 旧的 vnode
        const prevTree = instance.subTree;
        // 新的 vnode
        const nextTree = instance.render.call(proxy, proxy);

        patch(prevTree, nextTree, container);
      }
    });
  }

  function mountComponent(initialVnode, container) {
    // 组件渲染流程
    // 核心
    // 1. 先有一个组件的实例对象
    const instance = (initialVnode.component =
      createComponentInstance(initialVnode));
    // 2. 解析数据到实例对象中
    setupComponent(instance);
    // 3. 创建一个 effect
    setupRenderEffect(instance, container);
  }

  // 组件的创建
  function processComponent(n1, n2, container) {
    if (n1 == null) {
      // 第一次
      mountComponent(n2, container);
    } else {
      // 不是第一次，更新
    }
  }

  // 处理文本
  function processText(n1, n2, container) {
    if (n1 == null) {
      // 创建文本 渲染到页面中
      // 先把vnode 转成真实的dom，再插入
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    }
  }

  // 处理元素

  function mountChildren(el, children) {
    // 循环
    for (let i = 0; i < children.length; i++) {
      // ['zs']
      let child = cVnode(children[i]);
      // 创建文本 或 创建元素
      // 递归的调用 patch
      patch(null, child, el);
    }
  }

  function mountElement(vnode, container) {
    // 递归渲染，h('div', {}, [h('div')])
    // dom 操作
    // 放到对应的页面
    const { props, shapeFlag, type, children } = vnode;
    /// 创建元素
    const el = (vnode.el = hostCreateElement(type));
    // 添加属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    // 处理 children
    // h('div', {style:{color :'red'}}, 'text')
    // h('div', {style:{color :'red'}}, ['text'])
    // h('div', {style:{color :'red'}}, [h()])
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 创建文本元素
        hostSetElementText(el, children);
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 数组 递归 patch
        mountChildren(el, children);
      }
    }

    // 放到对应的位置
    hostInsert(el, container);
  }

  function processElement(n1, n2, container) {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container);
    } else {
      // 更新
      console.log("同一个元素比对");
    }
  }

  // 比对，渲染
  // n1 旧节点
  // n2 新节点
  //  container 位置
  function isSameVnode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }

  function unmount(vnode) {
    hostRemove(vnode.el);
  }

  function patch(n1, n2, container) {
    // 比对n1 n2
    // 判断是不是同一个元素
    // 不一样直接替换
    // 一样就要比对 props children
    // console.log(n1, n2);
    if (n1 && !isSameVnode(n1, n2)) {
      // 不是同一个元素
      // console.log("不是同一个元素");
      // 删除元素
      unmount(n1);
      // 置空，置空之后才会走 mount
      n1 = null;
    }

    let { shapeFlag, type } = n2;

    switch (type) {
      case TEXT:
        // 处理文本
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // console.log("元素");
          processElement(n1, n2, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 组件初始化
          processComponent(n1, n2, container);
        }
    }
  }

  let render = (vnode, container) => {
    // 得到虚拟dom，开始渲染
    // 组件初始化
    // 渲染 第一次
    // 第一次旧节点没有，是null
    // console.log("进入render");
    patch(null, vnode, container);
  };

  return {
    createApp: apiCreateApp(render), // 创建虚拟dom vnode
  };
};
