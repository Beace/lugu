# 一个基于 artus.js 实现的 http 框架

## 使用

安装相关依赖

```
npm init -y
npm i @npm-book/application
npm i @npm-book/application-http
```

创建入口文件

```ts
import path from 'path';
import { NPMBookApplication } from '@npm-book/application';


async function main() {
  const app = await NPMBookApplication.start({
    root: path.resolve(__dirname, '.'),
    configDir: 'config',
    exclude: [],
  });

  return app;
}

if (require.main === module) {
  main();
}
```

更多示例查看 example.

## 开发

### 组织结构

整体采用 npm workspaces，`packages/` 下存放协议实现，`example/` 下存放 HTTP Server 示例。

```
$ tree -L 2
.
├── README.md
├── example
│   └── app
├── package.json
└── packages
    ├── application
    └── application-http

5 directories, 2 files
```


```bash
$ npm i
$ npm run build
```

运行 example 下的示例

```bash
$ cd example/app && npm start
```
