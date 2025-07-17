import { spawn } from 'child_process';
import { resolve } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Logger {
  private static readonly logger = spawn(
    'node',
    [resolve(__dirname, '../../../logger-processor.mts')],
    {
      stdio: ['pipe', 'ignore', 'ignore'],
    },
  );

  static log(msg: string): void {
    const formatted = `[${new Date().toISOString()}] ${msg}\n`;

    if (this.logger.stdin.writableLength < 1024 * 10) {
      this.logger.stdin.write(formatted);
    }
  }

  static error(msg: string): void {
    const formatted = `[${new Date().toISOString()}][ERROR] ${msg}\n`;

    if (this.logger.stdin.writableLength < 1024 * 10) {
      this.logger.stdin.write(formatted);
    }
  }
}
