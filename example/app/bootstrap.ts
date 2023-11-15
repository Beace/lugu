import path from 'path';
import { MyApplication } from '@lugu/application';


async function main() {
  const app = await MyApplication.start({
    root: path.resolve(__dirname, '.'),
    configDir: 'config',
    exclude: [],
  });

  return app;
}

if (require.main === module) {
  main();
}
