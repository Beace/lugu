import path from 'path';
import http from 'http';
import Koa, { DefaultContext } from 'koa';
import KoaRouter from 'koa-router';

import { Inject, ApplicationLifecycle, LifecycleHook, LifecycleHookUnit, Container } from '@artus/core';
import { MiddlewareConstructable, NPMBookApplication, NPMBookLogger, getParamValues, getParamMetadata } from '@npm-book/application';

import { CONTROLLER_METADATA, ROUTER_METADATA, WEB_CONTROLLER_TAG } from './decorator';
import { getMiddlewareInstance } from './utils';
import MyRouterMiddleware from './router';
import { HANDLE_METHOD, KOA_APP, KOA_CTX, PARAM_HANDLER } from './constant';

@LifecycleHookUnit()
export default class Lifecycle implements ApplicationLifecycle {
  @Inject()
  private readonly container: Container

  private router: KoaRouter;
  private koaApp: Koa;
  private app: InstanceType<typeof NPMBookApplication>;
  private server: http.Server;
  private logger: NPMBookLogger;

  constructor(
    @Inject(NPMBookApplication) app: InstanceType<typeof NPMBookApplication>,
    @Inject(NPMBookLogger) logger: InstanceType<typeof NPMBookLogger>
  ) {
    this.app = app;
    this.createKoaApp();
    this.app.container.set({ id: KOA_APP, value: this.koaApp });
    this.logger = logger;
  }

  private createKoaApp() {
    const { proxy, proxyIpHeader, subdomainOffset, maxIpsCount } = this.app.config?.applicationHttp ?? {};
    this.koaApp = new Koa({
      proxy: proxy ?? true,
      proxyIpHeader,
      subdomainOffset,
      maxIpsCount,
    })
  }

  @LifecycleHook()
  public async configWillLoad() {}

  @LifecycleHook()
  public async configDidLoad() {
    const options = this.app.config?.applicationHttp;
    this.router = new KoaRouter(options);
    this.app.container.set({ id: 'router', value: this.router });
    this.koaApp.use(this.handleRequest.bind(this));
  }

  @LifecycleHook('createServer')
  public async createServer() {
    this.server = http.createServer(this.koaApp.callback());
  }

  @LifecycleHook('startServer')
  public async bootstrap() {
    const port = process.env.PORT || 3000;
    this.server.listen(port, () => {
      this.logger.info(`Server listening on: http://localhost:${port}`);
    });
  }

  @LifecycleHook('initServer')
  public async initServer() {
    const controllerClazzList = this.container.getInjectableByTag(WEB_CONTROLLER_TAG);
    for (const controllerClazz of controllerClazzList) {
      const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, controllerClazz);
      const handlerDescriptorList = Object.getOwnPropertyDescriptors(controllerClazz.prototype);
      for (const key of Object.keys(handlerDescriptorList)) {
        const handlerDescriptor = handlerDescriptorList[key];
        const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, handlerDescriptor.value) ?? [];
        if (routeMetadataList.length === 0) continue;
        this._registerRoute(controllerClazz, controllerMetadata, routeMetadataList);
      }
    }
    this.app.use(MyRouterMiddleware)
  }

  @LifecycleHook('stopServer')
  public async stopServer() {
    return new Promise<void>((resolve, reject) => {
      if (!this.server) {
        return resolve();
      }
      this.server.close(err => (err ? reject(err) : resolve()));
    });
  }

  private _registerRoute(controllerClass, controllerDecoInfo, routeMetadataList) {
    for (const routeMetadata of routeMetadataList) {
      const { middlewares, key, method } = routeMetadata;
      const methodMiddlewares = middlewares ?? [];
      const routePath = path.normalize(controllerDecoInfo.path + routeMetadata.path);
      const koaMiddlewares = this._methodToKoaMiddlewares({
        controllerClass,
        key,
        middlewares: controllerDecoInfo.middlewares.concat(methodMiddlewares),
        routePath,
      });
      koaMiddlewares[koaMiddlewares.length - 1][HANDLE_METHOD].route = routePath;
      this.router.register(routePath, [method.toLowerCase()], koaMiddlewares);
    }
  }

  private _methodToKoaMiddlewares({
    controllerClass,
    key,
    middlewares,
    routePath,
  }: {
    controllerClass: any;
    key: string;
      middlewares: MiddlewareConstructable[];
    routePath: string;
  }) {
    const memberName = key;
    const paramMetadataList = getParamMetadata(controllerClass.prototype, memberName);
    const handler = async (koaCtx: DefaultContext) => {
      const { triggerCtx } = koaCtx;
      koaCtx.request.routePath = routePath;
      const instancedParams = getParamValues(triggerCtx, paramMetadataList);
      const controller = triggerCtx.container.get(controllerClass);
      const rawResult = await controller[key](...instancedParams);
      triggerCtx.output.data = rawResult === void 0 ? triggerCtx.output.data : rawResult;
      if (triggerCtx.output.data !== void 0) {
        koaCtx.body = triggerCtx.output.data;
      }
    };

    handler[HANDLE_METHOD] = { method: `${controllerClass.name}_${key}` };
    return [...getMiddlewareInstance(middlewares), handler];
  }

  private async handleRequest(koaCtx) {
    koaCtx.request.body = koaCtx.request.body || {};
    const triggerCtx = this.app.trigger.initContext(
      {
        req: koaCtx.request as any,
        res: koaCtx.response as any,
      },
      { data: undefined }
    );

    triggerCtx.container.set({ id: KOA_CTX, value: koaCtx });
    triggerCtx.container.registerHandler(PARAM_HANDLER, (name: string, key?: string) =>
      key === undefined ? koaCtx.request[name] : koaCtx.request[name][key]
    );
    koaCtx.triggerCtx = triggerCtx;
    await this.app.trigger.startPipeline(koaCtx.triggerCtx);
  }
}
