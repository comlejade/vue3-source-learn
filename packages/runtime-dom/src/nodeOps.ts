// 操作节点 增删改查

export const nodeOps = {
  // 元素操作
  // 创建 createElement vue runtime-dom
  // 平台不同操作dom不同
  createElement: (tagName) => {
    const dom = document.createElement(tagName);
    return dom;
  },
  // 删除
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  // 插入
  insert: (child, parent, ancher = null) => {
    // ancher 参照物，如果没有，就相当于追加 appendChild
    parent.insertBefore(child, ancher);
  },
  // 查
  querySelector: (selector) => {
    return document.querySelector(selector);
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  // 节点，文本操作
  createText: (text) => {
    return document.createTextNode(text);
  },
  setText: (node, text) => {
    node.nodeValue = text;
  },
};
