import { EAdminRole, EAdminStatus } from '@lbss9/vortex-packages';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { IS_PUBLIC_KEY } from '../decorators/is-public-route.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { CurrentUserDTO } from '../dto/current-user.dto';
import { PermissionGuard } from './permission.guard';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user?: CurrentUserDTO) => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    return context;
  };

  const createMockUser = (role: EAdminRole, permissions: string[] = []): CurrentUserDTO => {
    const user = new CurrentUserDTO();
    user.id = '123';
    user.email = 'test@test.com';
    user.status = EAdminStatus.ACTIVE;
    user.role = role;
    user.permissions = permissions;
    return user;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('Public routes', () => {
    it('should allow access to public routes', () => {
      const context = mockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Routes without permission requirements', () => {
    it('should allow access when no permissions are required', () => {
      const user = createMockUser(EAdminRole.MANAGER);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return undefined;
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when permissions array is empty', () => {
      const user = createMockUser(EAdminRole.MANAGER);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return [];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('SUPER_ADMIN access', () => {
    it('should allow SUPER_ADMIN to access any route', () => {
      const user = createMockUser(EAdminRole.SUPER_ADMIN, []);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.admin', 'delete.admin'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Permission validation', () => {
    it('should allow access when user has all required permissions', () => {
      const user = createMockUser(EAdminRole.PLATFORM_ADMIN, ['create.manager', 'update.manager']);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks some permissions', () => {
      const user = createMockUser(EAdminRole.MANAGER, ['read.order']);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager', 'update.manager'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Você não tem permissão para acessar este recurso. Permissões faltantes: create.manager, update.manager',
      );
    });

    it('should deny access when user has no permissions', () => {
      const user = createMockUser(EAdminRole.MANAGER, []);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user is not authenticated', () => {
      const context = mockExecutionContext(undefined);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Você não tem permissão para acessar este recurso');
    });

    it('should allow access when user has exactly the required permissions', () => {
      const user = createMockUser(EAdminRole.PLATFORM_ADMIN, ['create.manager']);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has more permissions than required', () => {
      const user = createMockUser(EAdminRole.PLATFORM_ADMIN, [
        'create.manager',
        'update.manager',
        'delete.manager',
        'read.manager',
      ]);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('Multiple permission requirements', () => {
    it('should allow access when user has all multiple required permissions', () => {
      const user = createMockUser(EAdminRole.PLATFORM_ADMIN, ['create.manager', 'update.manager', 'delete.manager']);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager', 'update.manager'];
        return undefined;
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user is missing one of multiple required permissions', () => {
      const user = createMockUser(EAdminRole.PLATFORM_ADMIN, ['create.manager']);
      const context = mockExecutionContext(user);

      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return false;
        if (key === PERMISSIONS_KEY) return ['create.manager', 'update.manager'];
        return undefined;
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Permissões faltantes: update.manager');
    });
  });
});
