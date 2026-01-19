import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, _, next: NextFunction) {
    const logger = new Logger();
    logger.log(`Request... ${req.method} ${req.baseUrl}`);
    next();
  }
}
