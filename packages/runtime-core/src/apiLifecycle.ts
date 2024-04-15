// 生命周期

import { currentInstance, setCurrentInstance } from "./component";

// 枚举
const enum Lifecycle {
  BEFOREMOUNT = "bm",
  MOUNTED = "m",
  BEFOREUPDATE = "bu",
  UPDATED = "u",
}

// 写4个生命周期
export const onBeforeMount = createHook(Lifecycle.BEFOREMOUNT);
export const onMounted = createHook(Lifecycle.MOUNTED);
export const onBeforeUpdate = createHook(Lifecycle.BEFOREUPDATE);
export const onUpdated = createHook(Lifecycle.UPDATED);

// 1. 返回值是个函数
function createHook(lifecycle) {
  // 第一个参数就是生命周期中的方法
  // 核心就是这个生命周期要和当前组件实例产生关联
  // vue 组件 父子关系采用嵌套， 父子都有实例， 都有setup和生命周期
  // 每一个组件中 setup
  // 在 setup 调用之前就会产生一个全局的实例
  // 1. 在 setup 调用全局 instance
  // 2. 执行的生命周期获取的实例就是全局的
  // 3. 在 setup 执行 全局 instace = null
  //   debugger;
  return function (hook, target = currentInstance) {
    // 获取到当前组件的实例，和生命周期产生关联
    injectHook(lifecycle, hook, target);
  };
}

function injectHook(lifecycle, hook, target) {
  // 注意 vue3 中的生命周期都是在 setup 中使用的
  // 判断
  //   console.log("target", target);
  //   console.log("hook", hook);
  if (!target) {
    return;
  }
  // 给这个实例添加生命周期
  const hooks = target[lifecycle] || (target[lifecycle] = []);

  // hook 就是生命周期中的方法
  // vue3 源码用了一个切片的思想，即函数劫持

  const rap = () => {
    setCurrentInstance(target);
    // 执行生命周期前存放一个当前实例
    hook();
    setCurrentInstance(null);
  };

  hooks.push(rap);
  //   console.log("target", target);
}

// 生命周期的执行
export function invokeArrayFns(fnArr) {
  // 遍历
  fnArr.forEach((fn) => fn());
}
