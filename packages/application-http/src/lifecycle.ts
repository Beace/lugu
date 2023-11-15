import path from 'path';
import http from 'http';
import Koa from 'koa';
import KoaRouter from 'koa-router';

import { Inject, ApplicationLifecycle, LifecycleHook, LifecycleHookUnit, Container } from '@artus/core';

import { CONTROLLER_METADATA, ROUTER_METADATA, WEB_CONTROLLER_TAG } from './decorator';
import { MyApplication } from '@lugu/application';

@LifecycleHookUnit()
export default class Lifecycle implements ApplicationLifecycle {
  @Inject()
  private readonly container: Container

  private router: KoaRouter;
  private koaApp: Koa;
  private app: InstanceType<typeof MyApplication>;
  private server: http.Server;

  constructor(@Inject(MyApplication) app: InstanceType<typeof MyApplication>,) {
    this.app = app;
    this.createKoaApp();
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
    // create router
    const options = this.app.config?.applicationHttp;
    this.router = new KoaRouter(options);
    this.app.container.set({ id: 'ROUTER', value: this.router });
    this.koaApp.use(this.router.routes())
  }

  @LifecycleHook('createServer')
  public async createServer() {
    this.server = http.createServer(this.koaApp.callback());
  }

  @LifecycleHook('startServer')
  public async bootstrap() {
    const port = process.env.PORT || 3000;
    this.server.listen(port, () => {
      console.log(`Server listening on: http://localhost:${port}`);
    });
  }

  @LifecycleHook('initServer')
  public async initServer() {
    const controllerClazzList = this.container.getInjectableByTag(WEB_CONTROLLER_TAG);
    for (const controllerClazz of controllerClazzList) {
      const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA, controllerClazz);
      const controller = this.container.get(controllerClazz) as any;

      const handlerDescriptorList = Object.getOwnPropertyDescriptors(controllerClazz.prototype);
      for (const key of Object.keys(handlerDescriptorList)) {
        const handlerDescriptor = handlerDescriptorList[key];
        const routeMetadataList = Reflect.getMetadata(ROUTER_METADATA, handlerDescriptor.value) ?? [];
        if (routeMetadataList.length === 0) continue;
        this._registerRoute(controllerMetadata, routeMetadataList, controller[key].bind(controller));
      }
    }
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

  private _registerRoute(controllerMetadata, routeMetadataList, handler) {
    for (const routeMetadata of routeMetadataList) {
      const routePath = path.normalize(controllerMetadata.prefix ?? '/' + routeMetadata.path);
      this.router[routeMetadata.method.toLowerCase()](routePath, handler);
    }
  }
}
