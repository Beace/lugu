import { Injectable } from '@artus/core';

@Injectable()
export default class HomeService {
  async say() {
    return {
      hello: 'world',
    };
  }
}
