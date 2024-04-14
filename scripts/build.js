// monorepo打包
// 1. 获取打包文件 目录
import { execa } from "execa";
import fs from "fs";

const dirs = fs.readdirSync("packages").filter((p) => {
  // 过滤，只保留文件夹
  if (!fs.statSync(`packages/${p}`).isDirectory) {
    return false;
  }
  return true;
});
// 2. 文件夹才进行打包
// 并行打包
// 打包
async function build(target) {
  // execa -c 执行rollup配置，环境变量 -env
  // 子进程的输出在父包中输出
  await execa("rollup", ["-c", "--environment", [`TARGET:${target}`]], {
    stdio: "inherit",
  });
}
// 并行执行
async function runParaller(dirs, itemFn) {
  let result = [];
  // 遍历
  for (let item of dirs) {
    result.push(itemFn(item));
  }
  // 存放打包的promise
  // 打包执行完毕，调用成功
  return Promise.all(result);
}

runParaller(dirs, build).then(() => {
  console.log("成功");
});

console.log(dirs);
