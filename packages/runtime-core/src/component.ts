import { ShapeFlags, isFunction, isObject } from "@vue/shared";
import { componentPublicInstance } from "./componentPublicInstance";

export const getCurrentInstance = () => {
  // 获取当前实例
  return currentInstance;
};

export const setCurrentInstance = (target) => {
  // 设置当前实例
  currentInstance = target;
};

// 创建组件实例
export const createComponentInstance = (vnode) => {
  // console.log(vnode);
  const instance = {
    vnode,
    type: vnode.type, // 组件类型
    props: {}, // 组件的属性
    attrs: {}, // 所有的属性
    setupState: {}, // setup 返回值
    ctx: {}, // 代理
    proxy: {},
    data: {}, // 兼容vue2
    isMounted: false, // 是否挂载
    render: false,
  };
  instance.ctx = { _: instance };
  return instance;
};

// 解析数据到组件实例上
export const setupComponent = (instance) => {
  // 将上述的 props attrs setupState 等属性的值填上
  const { props, children } = instance.vnode;
  // 根据这个 props 解析到组件实例上
  instance.props = props; // initProps
  instance.children = children; // slots插槽
  // 看一下这个组件有没有 setup
  let shapeFlag = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (shapeFlag) {
    // 有状态组件
    setUpStateComponent(instance);
  } else {
    // 没有
  }
};

export let currentInstance;
function setUpStateComponent(instance) {
  // setup 返回值可以是对象或函数
  // 对象 -> state，函数 -> render
  // setup返回值是 render函数的参数

  // 代理
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance as any);

  // 获取组件类型，拿到组件的setup方法
  // console.log(instance);
  let Component = instance.type;
  let { setup } = Component;
  // 看一下有没有 setup render
  if (setup) {
    // 处理参数
    // 在 setup 之前，创建全局的 currentInstance
    currentInstance = instance;
    // console.log("currentInstance", currentInstance);
    let setupContext = createContext(instance);
    let setupResult = setup(instance.props, setupContext);
    // setup执行完毕，
    currentInstance = null;
    // setup 返回值可能是对象或者函数
    // 如果是对象就是值，如果是函数就是render
    handlerSetupResult(instance, setupResult);
  } else {
    // 没有 setup
    // 调用 render
    finishComponentSetup(instance);
    if (Component.render) {
      Component.render(instance.proxy);
    }
  }
  // 处理render
  // 代理
  //   instance.render()
}

// 处理setup的返回结果
function handlerSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    // render
    // 将 setup 返回的函数保存到实例上
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  /// 走 render 方法
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  let Component = instance.type;
  // 判断组件中有没有 render
  if (!instance.render) {
    // 如果组件实例上没有render
    if (!Component.render && Component.template) {
      // 将模板编译成 render
    }

    instance.render = Component.render;
  }

  // setup有render
  //   console.log(instance.render.toString());
}

function createContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  };
}
