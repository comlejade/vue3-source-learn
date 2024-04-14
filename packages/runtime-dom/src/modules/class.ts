// 处理class
export const patchClass = (el, value) => {
  if (value == null) {
    value = "";
  }
  // 对这个标签的class赋值，如果没有赋值为空，有新的覆盖
  el.className = value;
};
