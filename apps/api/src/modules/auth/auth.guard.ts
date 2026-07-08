import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuthUser {
  id: string;
  firebaseUid: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const devAuthEnabled = process.env.DEV_AUTH_ENABLED === 'true';

    if (devAuthEnabled) {
      const devUserId = request.headers['x-dev-user-id'] as string | undefined;
      const devFirebaseUid = request.headers['x-dev-firebase-uid'] as string | undefined;

      let user = devUserId
        ? await this.prisma.user.findUnique({ where: { id: devUserId } })
        : devFirebaseUid
          ? await this.prisma.user.findUnique({ where: { firebaseUid: devFirebaseUid } })
          : await this.prisma.user.findFirst({ where: { role: 'student' } });

      if (!user) {
        throw new UnauthorizedException('No dev user found. Run db:seed first.');
      }

      request.user = user;
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    // Firebase token verification will be wired in production
    throw new UnauthorizedException('Firebase auth not configured in this environment');
  }
}
