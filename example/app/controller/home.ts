import { Inject } from '@artus/core';
import {
  GET,
  Controller,
  Query
} from '@npm-book/application-http/decorator';
import { Config } from '@npm-book/application';

import HomeService from '../service/home';
import { Req } from '@npm-book/application';
import RequestFormatMiddleware from '../middlewares/auth';
import { HTTPRequest } from '@npm-book/application-http';

@Controller()
export default class UserController {
  @Inject()
  homeService: HomeService;

  @Config()
  config: Record<string, any>;

  @GET('/api', {
    middlewares: [RequestFormatMiddleware]
  })
  async info(@Req() req: HTTPRequest, @Query() query) {
    const user = await this.homeService.say();
    return {
      config: this.config,
      user,
    };
  }
}
