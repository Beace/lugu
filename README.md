# 一个基于 artus.js 实现的 http 框架

## 组织结构

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

## 开发

```bash
$ npm i
$ npm run build
```

运行 example 下的示例

```bash
$ cd example/app && npm start
```

## TODO

完成以下就结束，不搞花活。

- ✅ 可以扫描
- ✅ 可以加载插件、配置
- ✅ 可以启动一个 HTTP Server，并能处理 GET/POST/... 等常用请求
- ✅ 有一些基础的装饰器可以用 `@Get` `@Controller`
- ✅ 基于 `KoaRouter`，可以处理简单路由
- ⏳ 支持中间件 middlewares
- ⏳ 支持 `@Req` `@Res` 等