export function isObject(target) {
  return typeof target === "object" && target !== null;
}

export const extend = Object.assign;
export const isArray = Array.isArray;
export const isFunction = (val) => typeof val === "function";
export const isNumber = (val) => typeof val === "number";
export const isString = (val) => typeof val === "string";

// 判断数组的key是不是整数值
export const isIntegerKey = (key) => {
  return parseInt(key) + "" === key;
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key);

export const hasChange = (value, oldValue) => value !== oldValue;

export { ShapeFlags } from "./shapeFlags";
