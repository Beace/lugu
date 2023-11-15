import { Inject } from '@artus/core';
import {
  GET,
  Controller
} from '@lugu/application-http/decorator';
import { Config } from '@lugu/application';

import HomeService from '../service/home';

@Controller()
export default class UserController {
  @Inject()
  homeService: HomeService;

  @Config()
  config: Record<string, any>;

  @GET('/')
  async info(ctx) {
    const user = await this.homeService.say();

    ctx.body = {
      config: this.config,
      user,
    };
  }
}
