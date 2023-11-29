import { Request, Response } from "@npm-book/application";
import type { Request as KoaRequest, Response as KoaResponse, Context as KoaContext } from 'koa';

export type CookieType = KoaContext['cookies'];

export interface HTTPRequest extends Request, Omit<KoaRequest, 'header' | 'body' | 'ctx'> {
  params: Record<string, any>;
  get cookies(): CookieType;
  get requestId(): string;
  get realIp(): string;
  routePath?: string;
  get handleRoute(): string;
}

export interface HTTPResponse extends Response, Omit<KoaResponse, 'ctx'> { }
