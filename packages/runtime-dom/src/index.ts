import { extend } from "@vue/shared";

import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { createRender } from "@vue/runtime-core";

// vue3 dom全部操作

const renderOptionDOM = extend({ patchProp }, nodeOps);

export const createApp = (rootComponent, rootProps) => {
  // 不同的平台，创建不同的 createRender 渲染器
  let app: any = createRender(renderOptionDOM).createApp(
    rootComponent,
    rootProps
  );
  let { mount } = app;
  app.mount = function (container) {
    // 挂载组件
    // 清空
    container = document.querySelector(container);
    container.innerHTML = "";
    // 将组件渲染的DOM元素进行挂载
    mount(container);
  };
  return app;
};

export { renderOptionDOM };

export * from "@vue/runtime-core";
export * from "@vue/reactivity";
