import { createVnode } from "./vnode";

export function apiCreateApp(render) {
  return function createApp(rootComponent, rootProps) {
    let app = {
      // 添加相关属性
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      mount(container) {
        // 告诉他是哪个组件的属性
        //   console.log(container, rootComponent, rootProps, renderOptionDOM);
        // 创建vnode 根据组件创建vnode节点
        let vnode = createVnode(rootComponent, rootProps);
        // console.log(vnode);
        // 渲染到指定的位置 render(vnode, container)
        render(vnode, container);
        app._container = container;
      },
    };
    return app;
  };
}
