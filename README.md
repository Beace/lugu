# 一个基于 artus.js 实现的 http 框架

## 使用

初始化依赖

- [相关依赖](https://github.com/npm-book/framework/blob/main/example/app/package.json)
- [tsconfig.json](https://github.com/npm-book/framework/blob/main/example/app/tsconfig.json)
  
创建入口文件

```ts
// main.ts
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

开启 HTTP 插件

```ts
// config/plugin.default.ts
export default {
  'application-http': {
    enable: true,
    package: '@npm-book/application-http',
  },
};
```

添加一个路由

```ts
import {
  GET,
  Controller,
} from '@npm-book/application-http/decorator';

@Controller()
export default class UserController {
  @GET('/')
  async greet() {
    return {
      hello: 'world'
    };
  }
}
```

package.json npm scripts 中添加

```json
{
  "scripts": {
    "start": "nodemon --ignore 'typings/auto-generated/*' --exec 'ts-node' main.ts"
  }
}
```

最后 

```bash
$ npm start
```

<img width="652" alt="image" src="https://github.com/npm-book/framework/assets/13284978/774c29ce-c65b-43a0-8d1a-2f5816468003">


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
