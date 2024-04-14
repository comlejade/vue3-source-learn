// 二进制 一个字符由8为组成
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1, // 00000010 2   1 * 2 ^ 1
  STATEFUL_COMPONENT = 1 << 2, // 00000100 4     1 * 2 ^2
  TEXT_CHILDREN = 1 << 3, // 00001000 8    1 * 2 ^ 3
  ARRAY_CHILDREN = 1 << 4, // 16    1 * 2 ^ 4
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

// 按位与运算，类型不同，得到 0，相同会得到 非0
// 0b00000010 & 0b000000100
