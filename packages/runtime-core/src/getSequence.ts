// 最长递增子序列
// const arr = [1, 8, 5, 3, 4, 9, 7, 6];

export function getSequence(arr) {
  let len = arr.length;
  // 最长递增子序列的索引
  const result = [0];
  let start;
  let end;
  let mid;
  let p = arr.slice(0);

  for (let i = 0; i < len; i++) {
    // 当前遍历到的值
    const arrI = arr[i];

    // 当前的值如果是 0，对于vue3的diff算法来说是需要新增的值
    // 不在这个处理范围内
    if (arrI != 0) {
      let resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        // 当前值比result中的最后一个值大，说明是递增的

        p[i] = resultLastIndex; // 记住前面的兄弟元素的索引

        // 把当前的索引记录下来
        result.push(i);
        // 记录下一轮循环
        continue;
      }

      // 二分查找 将大的值进行替换
      // 这里的 start 和 end 是result的索引
      start = 0;
      end = result.length - 1;
      while (start < end) {
        mid = Math.trunc((start + end) / 2);

        // 这里的目的是找到大于等于arrI的值
        if (arr[result[mid]] < arrI) {
          start = mid + 1;
        } else {
          end = mid;
        }
      }

      // 找到对应的位置, 然后用当前的索引替换掉原来的索引
      if (arrI < arr[result[start]]) {
        if (start > 0) {
          // 替换时前面的兄弟索引也记录下来
          p[i] = result[start - 1];
        }
        result[start] = i;
      }
    }
  }

  // 循环获取数据
  let len1 = result.length;
  let last = result[len1 - 1]; // 获取最后一个
  while (len1-- > 0) {
    result[len1] = last;
    last = p[last];
  }

  return result;
}
