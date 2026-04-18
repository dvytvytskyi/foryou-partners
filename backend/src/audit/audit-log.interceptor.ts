import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const method = (req?.method as string) ?? 'UNKNOWN';
    const path = (req?.path as string) ?? '';
    const routePath = (req?.route?.path as string | undefined) ?? path;

    if (!this.shouldLog(method, path)) {
      return next.handle();
    }

    const startedAt = Date.now();
    let errorMessage: string | null = null;

    return next.handle().pipe(
      catchError((err) => {
        errorMessage = err instanceof Error ? err.message : 'unknown_error';
        return throwError(() => err);
      }),
      finalize(() => {
        const requestId = (req?.requestId as string | undefined) ?? 'n/a';
        const actorUserId = (req?.user?.id as string | undefined) ?? null;
        const actorRole = (req?.user?.role as string | undefined) ?? null;
        const statusCode = (res?.statusCode as number | undefined) ?? 500;

        const entityType = this.detectEntityType(path);
        const action = `${method}:${routePath}`;
        const entityId = typeof req?.params?.id === 'string' ? req.params.id : null;

        void this.prisma.auditLog.create({
          data: {
            requestId,
            actorUserId,
            actorRole,
            action,
            entityType,
            entityId,
            metadata: {
              method,
              path,
              status_code: statusCode,
              duration_ms: Date.now() - startedAt,
              ip: req?.ip,
              user_agent: req?.headers?.['user-agent'],
              error: errorMessage,
            },
          },
        }).catch(() => undefined);
      }),
    );
  }

  private shouldLog(method: string, path: string): boolean {
    if (path.startsWith('/api/v1/health')) return false;
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  private detectEntityType(path: string): string {
    if (path.includes('/auth/')) return 'auth';
    if (path.includes('/admin/partners')) return 'partner';
    if (path.includes('/webhook/')) return 'webhook';
    if (path.includes('/leads')) return 'lead';
    return 'unknown';
  }
}
