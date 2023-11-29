
import { Inject } from '@artus/core';
import { Req, Middleware, Next, NextFunction, NPMBookLogger } from '@npm-book/application';
import { HTTPRequest } from '@npm-book/application-http';

@Middleware()
export default class RequestFormatMiddleware {
  @Inject()
  logger: NPMBookLogger;

  public async use(@Req() req: HTTPRequest, @Next() next: NextFunction) {
    this.logger.info('before', Date.now())
    await next();
    this.logger.info('after', Date.now())
  }
}