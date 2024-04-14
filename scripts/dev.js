// monorepo打包

import { execa } from "execa";

async function build(target) {
  // execa -c 执行rollup配置，环境变量 -env
  // -w 自动检测
  // 子进程的输出在父包中输出
  await execa("rollup", ["-cw", "--environment", [`TARGET:${target}`]], {
    stdio: "inherit",
  });
}

build("runtime-dom");
