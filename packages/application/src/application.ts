import { existsSync } from 'fs';
import path from 'path';
import { ArtusApplication, Manifest, ArtusScanner } from '@artus/core';

interface ApplicationOptions {
  root?: string;
  name?: string;
  configDir?: string;
  exclude?: string[];
}

export class MyApplication extends ArtusApplication {
  public manifest: Manifest;
  public options: ApplicationOptions;
  public env: string;

  constructor(options: ApplicationOptions = {
    root: process.cwd(),
    name: 'app',
    configDir: 'config',
    exclude: [],
  }) {
    super();
    this.options = options;
    this.env = process.env.ARTUS_SERVER_ENV ?? 'default';
    this._init();
  }

  private _init() {
    this.registerHook('configDidLoad', () => {
      this.container.registerHandler(
        'config',
        key => key === 'config' ? this.config : this.config[key]
      );
    });
  }

  public static async start(options?: ApplicationOptions) {
    const app = new MyApplication(options);
    const manifestMap = await app.scan();
    await app.load(manifestMap, app.options.root);
    await app.run();
    return app;
  }

  public async load(manifest: Manifest, root?: string) {
    await super.load(manifest as Manifest, root ?? this.options.root);
    return this;
  }

  public async scan() {
    const manifestFilePath = path.resolve(this.options.root!, 'manifest.json');
    if (existsSync(manifestFilePath)) {
      return require(manifestFilePath);
    }

    const scanner = new ArtusScanner({
      configDir: this.options.configDir,
      needWriteFile: false,
      useRelativePath: true,
      extensions: ['.js', '.json', '.node', '.ts'],
      exclude: this.options.exclude?.concat(['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json', 'test']),
      app: this,
    });
    return await scanner.scan(this.options.root!);
  }

  public async run() {
    await this.lifecycleManager.emitHook('createServer');
    await this.lifecycleManager.emitHook('willReady');
    await this.lifecycleManager.emitHook('initServer');
    await this.lifecycleManager.emitHook('beforeStartServer');
    await this.lifecycleManager.emitHook('startServer');
    await this.lifecycleManager.emitHook('didReady');
  }

  public loadDefaultClass(): void {
    super.loadDefaultClass()
    this.container.set({
      id: MyApplication,
      value: this,
    });
  }
}
