
import { Inject, Injectable, ScopeEnum } from '@artus/core';
import type { Request, Middleware as MiddlewareType } from 'koa';
import { NPMBookMiddleware, Req } from '@npm-book/application';


@Injectable({ scope: ScopeEnum.SINGLETON })
export default class MyRouterMiddleware extends NPMBookMiddleware {
  private routerMiddleware: MiddlewareType;

  constructor(@Inject('router') router) {
    super();
    this.routerMiddleware = router.routes();
  }

  public async use(@Req() req: Request, next) {
    const koaCtx: any = req.ctx;
    await this.routerMiddleware(koaCtx, next);
  }
}
