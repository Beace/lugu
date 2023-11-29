export enum ParamDecoratorType {
  QUERY = 'query',
  QUERY_STRING = 'querystring',
  PARAM = 'params',
  HOST = 'host',
  HREF = 'href',
  SEARCH = 'search',
  COOKIE = 'cookies',
  FILES = 'files',
}

export const PARAM_HANDLER = 'param_handler';
export const KOA_CTX = 'koa_ctx';
export const KOA_APP = 'koa_app';
export const HANDLE_METHOD =  'handle_method';