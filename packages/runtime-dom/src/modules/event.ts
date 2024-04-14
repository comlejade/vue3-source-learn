// 事件
// div @click='fn' @click='fn1'
// 一个元素的绑定事件 addEventListener
// 缓存 {click: fn}

export const patchEvent = (el, key, value) => {
  // 对函数缓存
  const invokers = el._vei || (el._vei = {});
  const exists = invokers[key];
  if (exists && value) {
    exists.value = value;
  } else {
    // 获取事件名称
    // 新的有 新的没有
    const eventName = key.slice(2).toLowerCase();
    if (value) {
      let invoker = (invokers[eventName] = createInvoker(value));
      el.addEventListener(eventName, invoker);
    } else {
      // 新的没有事件，把老的删除
      el.removeEventListener(eventName, exists);
      // 清除缓存
      invokers[eventName] = undefined;
    }
  }
};

function createInvoker(value) {
  const fn = (e) => {
    fn.value(e);
  };

  fn.value = value;

  return fn;
}

// 事件的处理
// 1.给元素缓存一个绑定的事件列表
// 2.如果缓存中没有值，并且value有值，需要绑定方法并缓存
// 3.以前绑定过，现在没绑定，需要解绑，并删除缓存
// 4.两个都有，直接改变invoker中的value，指向最新的事件
