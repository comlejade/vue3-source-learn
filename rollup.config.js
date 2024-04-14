// 通过rollup打包

// 1. 引入相关依赖
import commonJS from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import json from "@rollup/plugin-json";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import alias from "@rollup/plugin-alias";
// import polyfillNode from "rollup-plugin-polyfill-node";
import nodeResolve from "@rollup/plugin-node-resolve";
// import externals from "rollup-plugin-node-externals";

// 2. 获取文件路径
import path from "path";

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const packagesDir = path.resolve(__dirname, "packages");

// 2.1 获取需要打包的包
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// console.log(packageDir, 6666);
// 2.2 获取每个包的项目配置
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve("package.json"));
// 拿到包名
const name = path.basename(packageDir);
// console.log(packageOptions, 666);

// 3 创建一个映射表
const outputOptions = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife", // 是一个立即执行的函数
  },
};

const options = pkg.buildOptions;

function createConfig(format, output) {
  // 进行打包
  output.name = options.name;
  output.sourcemap = true;

  // 生成配置
  return {
    input: resolve("src/index.ts"), // 导入
    output,
    plugins: [
      json(),
      alias({
        entries: {
          "@vue/shared": path.resolve(packagesDir, "shared/src/index.ts"),
          "@vue/runtime-core": path.resolve(
            packagesDir,
            "runtime-core/src/index.ts"
          ),
          "@vue/reactivity": path.resolve(
            packagesDir,
            "reactivity/src/index.ts"
          ),
        },
      }),
      // 解析第三方插件
      esbuild({
        // 解析ts语法
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        sourceMap: output.sourcemap,
      }),
      nodeResolve(),
      commonJS(),
    ],
  };
}

// rollup需要导出一个配置
export default options.formats.map((format) =>
  createConfig(format, outputOptions[format])
);
