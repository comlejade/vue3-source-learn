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

  function mountElement(vnode, container, ancher) {
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
    hostInsert(el, container, ancher);
  }

  function patchElement(n1, n2, container, ancher) {
    // 同一个元素比对属性
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 获取真实节点
    let el = (n2.el = n1.el);
    // 处理属性
    patchProps(el, oldProps, newProps);
    // 处理 children
    patchChild(n1, n2, el);
  }

  // 比对children
  function patchChild(n1, n2, el) {
    const c1 = n1.children;
    const c2 = n2.children;
    // 儿子之间 4种
    // 1旧有新没有 2.新有旧没有 3. 儿子都是文本 4. 都有儿子，都是数组
    const prevShapeFlag = n1.shapeFlag; // 旧的标识
    const nextShapeFlag = n2.shapeFlag; // 新的标识

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本的情况
      hostSetElementText(el, c2);
    } else {
      // 不是文本 就是数组

      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 都有儿子，且都是数组
        patchKeyChild(c1, c2, el);
      } else {
        hostSetElementText(el, ""); // 删除文本
        // 添加新数组
        // console.log(c2);
        mountChildren(el, c2);
      }
    }
  }

  // 儿子都是数组的情况
  function patchKeyChild(c1, c2, el) {
    //vue2: 双指针 vue3: 头部比对
    // sync from start
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 从头开始一一对比
    // 同一位置对比，两个元素不同，停止
    // 数组遍历完，停止
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        // 嵌套，递归
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    // sync from end
    // 尾部比对
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        // 嵌套，递归
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    console.log(i, e1, e2);
    // 更新特殊是情况
    // 1. 旧的数据少，新的数据多
    // 2. 新的数据多，旧的数据少
    if (i > e1) {
      // 旧的少，新的多
      // 添加数据
      // nextPos 就是插入的位置
      const nextPos = e2 + 1;
      //如果是前追加 e2 + 1 < c2
      console.log("追加");
      // 参照物
      const ancher = nextPos < c2.length ? c2[nextPos].el : null;
      while (i <= e2) {
        patch(null, c2[i++], el, ancher);
      }
    } else if (i > e2) {
      // 旧的多，新的少
      // 删除
      console.log("删除");
      while (i <= e1) {
        unmount(c1[i++]);
      }
    } else {
      // 乱序
      // 1. 以新的乱序个数创建一个映射表
      // 2. 在用旧的乱序数据，去新的表中找
      // 3. 如果有就复用
      // 4. 没有就删除
      let s1 = i;
      let s2 = i;

      // 创建没有的新元素
      const toBePatched = e2 - s2 + 1; // 乱序的个数

      // 创建数组
      // 存储新数据在旧数据中的索引
      const newIndexToPatchMap = new Array(toBePatched).fill(0);
      // console.log(newIndexToPatchMap);

      // 创建表
      let keyIndexMap = new Map();

      // 用新的乱序数据创建表
      for (let i = s2; i <= e2; i++) {
        // 乱序的 vnode
        const childVnode = c2[i];
        keyIndexMap.set(childVnode.key, i);
      }

      // 去老的里面找
      for (let i = s1; i <= e1; i++) {
        const oldChildVnode = c1[i];
        let newIndex = keyIndexMap.get(oldChildVnode.key);
        if (newIndex === undefined) {
          // 旧的数据在新表中没有，删除
          unmount(oldChildVnode);
        } else {
          // 新的数据在老的数据中索引的位置
          newIndexToPatchMap[newIndex - s2] = i + 1;
          // 有 比对
          patch(oldChildVnode, c2[newIndex], el);
          // 1 新添加的数据没有创建
          // 2 位置不对
          // 旧和新的关系，索引的关系
        }
      }
      console.log(newIndexToPatchMap);
      // 移动节点并且添加新增的元素
      // 倒序循环
      for (let i = toBePatched - 1; i >= 0; i--) {
        let currentIndex = i + s2; // 新增 h 元素的索引
        let child = c2[currentIndex];
        // 添加位置
        let ancher =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
        if (newIndexToPatchMap[i] === 0) {
          // 0 标识原来不存在的
          // 将 child 就是要新增的元素插入到相应位置
          patch(null, child, el, ancher);
        } else {
          // 对于已经存在的元素，逐个插入到对应的位置
          hostInsert(child.el, el, ancher);
        }
      }
    }
  }

  function patchProps(el, oldProps, newProps) {
    // 循环 新的
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        // console.log(el, prev, next);
        if (prev != next) {
          // 不同进行替换
          hostPatchProp(el, key, prev, next);
        }
      }
    }

    // 循环旧的
    // 如果旧的属性，在新的中没有，删除这个属性
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  function processElement(n1, n2, container, ancher) {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container, ancher);
    } else {
      // 更新
      // console.log("同一个元素比对");
      patchElement(n1, n2, container, ancher);
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

  function patch(n1, n2, container, ancher = null) {
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
          processElement(n1, n2, container, ancher);
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
