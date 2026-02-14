import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import {
  EVtxCaseAuthorRole,
  VtxSupportCaseMessageEntity,
} from '@/database/entities/vtx-support-case-message.entity';
import {
  EVtxCasePriority,
  EVtxCaseStatus,
  VtxSupportCaseEntity,
} from '@/database/entities/vtx-support-case.entity';
import {
  AddCaseMessageInputDTO,
  AdminListCasesQueryDTO,
  CreateCaseInputDTO,
  ListMyCasesQueryDTO,
  ResolveCaseInputDTO,
} from './cases.input';

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  public constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(VtxSupportCaseEntity)
    private readonly casesRepository: Repository<VtxSupportCaseEntity>,
    @InjectRepository(VtxSupportCaseMessageEntity)
    private readonly messagesRepository: Repository<VtxSupportCaseMessageEntity>,
  ) {}

  private async ensureCasesSchema(): Promise<void> {
    const g = globalThis as typeof globalThis & { __vortexCasesSchemaEnsured?: boolean };
    if (g.__vortexCasesSchemaEnsured) return;

    // Ensure only one concurrent creator runs.
    g.__vortexCasesSchemaEnsured = true;

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    try {
      // If an older deployment created the legacy `tickets` tables, migrate them to `cases` (once).
      const existing = await runner.query(
        `
          SELECT TABLE_NAME as name
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME IN (
              'vtx_support_tickets',
              'vtx_support_ticket_messages',
              'vtx_support_cases',
              'vtx_support_case_messages'
            )
        `
      );
      const names = new Set<string>(
        Array.isArray(existing) ? existing.map((r: any) => String(r?.name ?? r?.TABLE_NAME ?? '')) : []
      );
      const hasLegacy = names.has('vtx_support_tickets') || names.has('vtx_support_ticket_messages');
      const hasNew = names.has('vtx_support_cases') || names.has('vtx_support_case_messages');

      if (hasLegacy && !hasNew) {
        await runner.query(
          `RENAME TABLE vtx_support_tickets TO vtx_support_cases, vtx_support_ticket_messages TO vtx_support_case_messages`
        );
      }

      await runner.query(`
        CREATE TABLE IF NOT EXISTS vtx_support_cases (
          id varchar(36) NOT NULL,
          createdByUsername varchar(32) NOT NULL,
          assignedToUsername varchar(32) NULL,
          resolvedByUsername varchar(32) NULL,
          subject varchar(140) NOT NULL,
          category varchar(32) NULL,
          priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
          status enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
          resolvedAt datetime(3) NULL,
          closedAt datetime(3) NULL,
          lastMessageAt datetime(3) NOT NULL,
          createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await runner.query(`
        CREATE TABLE IF NOT EXISTS vtx_support_case_messages (
          id varchar(36) NOT NULL,
          caseId varchar(36) NOT NULL,
          authorUsername varchar(32) NULL,
          authorRole enum('USER','ADMIN','SYSTEM') NOT NULL,
          body text NOT NULL,
          createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          CONSTRAINT fk_vtx_case_messages_caseId
            FOREIGN KEY (caseId) REFERENCES vtx_support_cases(id)
            ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } finally {
      await runner.release();
    }

    this.logger.log('Ensured cases schema (vtx_support_cases / vtx_support_case_messages)');
  }

  private isMissingCasesSchemaError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const anyErr = error as unknown as { code?: unknown; errno?: unknown; message?: unknown };
    const code = typeof anyErr.code === 'string' ? anyErr.code : '';
    const errno = typeof anyErr.errno === 'number' ? anyErr.errno : NaN;
    const message = String(anyErr.message ?? '');

    return (
      code === 'ER_NO_SUCH_TABLE' ||
      errno === 1146 ||
      message.includes('vtx_support_cases') ||
      message.includes('vtx_support_case_messages')
    );
  }

  private async withCasesSchema<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      if (!this.isMissingCasesSchemaError(error)) throw error;
      await this.ensureCasesSchema();
      return await fn();
    }
  }

  private now(): Date {
    return new Date();
  }

  private sanitizeCategory(category: string | null): string | null {
    // Do not allow legacy/invalid categories to leak via API responses.
    if (!category) return null;
    if (category === 'PAYMENT') return null;
    return category;
  }

  private sanitizeCase<T extends { category: string | null }>(c: T): T {
    return { ...c, category: this.sanitizeCategory(c.category) };
  }

  private notFound(): never {
    throw ErrorResponse.toHttpException({
      message: 'Case not found',
      statusCode: HttpStatus.NOT_FOUND,
      code: 'CASE_NOT_FOUND',
    });
  }

  private forbidden(): never {
    throw ErrorResponse.toHttpException({
      message: 'You do not have permission to access this case',
      statusCode: HttpStatus.FORBIDDEN,
      code: 'CASE_FORBIDDEN',
    });
  }

  public async create(input: CreateCaseInputDTO, currentUser: CurrentUserDTO) {
    return this.withCasesSchema(async () => {
      const createdAt = this.now();
      const c = this.casesRepository.create({
        createdByUsername: currentUser.username,
        assignedToUsername: null,
        resolvedByUsername: null,
        subject: input.subject,
        category: input.category ?? null,
        priority: input.priority ?? EVtxCasePriority.MEDIUM,
        status: EVtxCaseStatus.OPEN,
        resolvedAt: null,
        closedAt: null,
        lastMessageAt: createdAt,
      });

      const savedCase = await this.casesRepository.save(c);

      const message = this.messagesRepository.create({
        caseId: savedCase.id,
        supportCase: savedCase,
        authorUsername: currentUser.username,
        authorRole: EVtxCaseAuthorRole.USER,
        body: input.message,
      });
      await this.messagesRepository.save(message);

      return SuccessResponse.toJson({
        code: 'CASE_CREATED',
        message: 'Case created successfully',
        path: '/cases',
        data: { id: savedCase.id },
        successCode: HttpStatus.CREATED,
      });
    });
  }

  public async listMyCases(currentUser: CurrentUserDTO, query: ListMyCasesQueryDTO) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const q = query.q?.trim();
    const status = query.status;

    const [cases, total] = await this.withCasesSchema(() => {
      const qb = this.casesRepository.createQueryBuilder('c');
      qb.where('c.createdByUsername = :username', { username: currentUser.username });
      if (status) qb.andWhere('c.status = :status', { status });

      if (q) {
        const like = `%${q}%`;
        qb.andWhere(
          '(' +
            'c.subject LIKE :like OR ' +
            'c.category LIKE :like OR ' +
            'c.status LIKE :like OR ' +
            'c.priority LIKE :like' +
          ')',
          { like },
        );
      }

      qb.orderBy('c.lastMessageAt', 'DESC').skip(skip).take(limit);
      return qb.getManyAndCount();
    });

    return SuccessResponse.toJson({
      code: 'MY_CASES_SUCCESS',
      message: 'Cases retrieved successfully',
      path: '/cases/my',
      data: {
        items: cases.map((t) => this.sanitizeCase(t)),
        total,
        page,
        limit,
      },
      successCode: HttpStatus.OK,
    });
  }

  public async getMyCase(id: string, currentUser: CurrentUserDTO) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();
    if (c.createdByUsername !== currentUser.username) this.forbidden();

    const messages = await this.withCasesSchema(() =>
      this.messagesRepository.find({
        where: { caseId: c.id },
        order: { createdAt: 'ASC' },
      })
    );

    return SuccessResponse.toJson({
      code: 'CASE_GET_SUCCESS',
      message: 'Case retrieved successfully',
      path: `/cases/${id}`,
      data: { ...this.sanitizeCase(c), messages },
      successCode: HttpStatus.OK,
    });
  }

  public async addUserMessage(
    id: string,
    input: AddCaseMessageInputDTO,
    currentUser: CurrentUserDTO,
  ) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();
    if (c.createdByUsername !== currentUser.username) this.forbidden();

    if (c.status === EVtxCaseStatus.CLOSED) {
      throw ErrorResponse.toHttpException({
        message: 'Case is closed',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'CASE_CLOSED',
      });
    }

    await this.withCasesSchema(async () => {
      const msg = this.messagesRepository.create({
        caseId: c.id,
        supportCase: c,
        authorUsername: currentUser.username,
        authorRole: EVtxCaseAuthorRole.USER,
        body: input.message,
      });
      await this.messagesRepository.save(msg);

      await this.casesRepository.update(
        { id: c.id },
        {
          lastMessageAt: this.now(),
          status:
            c.status === EVtxCaseStatus.RESOLVED ? EVtxCaseStatus.IN_PROGRESS : c.status,
        },
      );
    });

    return SuccessResponse.toJson({
      code: 'CASE_MESSAGE_ADDED',
      message: 'Message added successfully',
      path: `/cases/${id}/messages`,
      successCode: HttpStatus.CREATED,
    });
  }

  public async closeByUser(id: string, currentUser: CurrentUserDTO) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();
    if (c.createdByUsername !== currentUser.username) this.forbidden();

    if (c.status === EVtxCaseStatus.CLOSED) {
      return SuccessResponse.toJson({
        code: 'CASE_ALREADY_CLOSED',
        message: 'Case already closed',
        path: `/cases/${id}/close`,
        successCode: HttpStatus.OK,
      });
    }

    const closedAt = this.now();
    await this.withCasesSchema(() =>
      this.casesRepository.update(
        { id: c.id },
        { status: EVtxCaseStatus.CLOSED, closedAt, lastMessageAt: closedAt },
      )
    );

    return SuccessResponse.toJson({
      code: 'CASE_CLOSED',
      message: 'Case closed successfully',
      path: `/cases/${id}/close`,
      successCode: HttpStatus.OK,
    });
  }

  // --- Admin ---

  public async listAll(currentUser: CurrentUserDTO, query: AdminListCasesQueryDTO) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const q = query.q?.trim();
    const status = query.status;

    const [cases, total] = await this.withCasesSchema(() => {
      const qb = this.casesRepository.createQueryBuilder('c');
      if (status) qb.where('c.status = :status', { status });

      if (q) {
        const like = `%${q}%`;
        qb.andWhere(
          '(' +
            'c.subject LIKE :like OR ' +
            'c.category LIKE :like OR ' +
            'c.createdByUsername LIKE :like OR ' +
            'c.assignedToUsername LIKE :like OR ' +
            'c.status LIKE :like OR ' +
            'c.priority LIKE :like' +
          ')',
          { like },
        );
      }

      qb.orderBy('c.lastMessageAt', 'DESC').skip(skip).take(limit);
      return qb.getManyAndCount();
    });

    return SuccessResponse.toJson({
      code: 'CASES_LIST_SUCCESS',
      message: 'Cases retrieved successfully',
      path: '/admin/cases',
      data: {
        items: cases.map((t) => this.sanitizeCase(t)),
        total,
        page,
        limit,
      },
      successCode: HttpStatus.OK,
    });
  }

  public async getByAdmin(id: string, currentUser: CurrentUserDTO) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();

    const messages = await this.withCasesSchema(() =>
      this.messagesRepository.find({
        where: { caseId: c.id },
        order: { createdAt: 'ASC' },
      })
    );

    return SuccessResponse.toJson({
      code: 'CASE_GET_SUCCESS',
      message: 'Case retrieved successfully',
      path: `/admin/cases/${id}`,
      data: { ...this.sanitizeCase(c), messages },
      successCode: HttpStatus.OK,
    });
  }

  public async addAdminMessage(
    id: string,
    input: AddCaseMessageInputDTO,
    currentUser: CurrentUserDTO,
  ) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();

    if (c.status === EVtxCaseStatus.CLOSED) {
      throw ErrorResponse.toHttpException({
        message: 'Case is closed',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'CASE_CLOSED',
      });
    }

    await this.withCasesSchema(async () => {
      const msg = this.messagesRepository.create({
        caseId: c.id,
        supportCase: c,
        authorUsername: currentUser.username,
        authorRole: EVtxCaseAuthorRole.ADMIN,
        body: input.message,
      });
      await this.messagesRepository.save(msg);

      const updatedAt = this.now();
      const status = c.status === EVtxCaseStatus.OPEN ? EVtxCaseStatus.IN_PROGRESS : c.status;
      await this.casesRepository.update(
        { id: c.id },
        { lastMessageAt: updatedAt, status, assignedToUsername: c.assignedToUsername ?? currentUser.username },
      );
    });

    return SuccessResponse.toJson({
      code: 'CASE_MESSAGE_ADDED',
      message: 'Message added successfully',
      path: `/admin/cases/${id}/messages`,
      successCode: HttpStatus.CREATED,
    });
  }

  public async resolve(id: string, input: ResolveCaseInputDTO, currentUser: CurrentUserDTO) {
    const c = await this.withCasesSchema(() => this.casesRepository.findOne({ where: { id } }));
    if (!c) this.notFound();

    const resolvedAt = this.now();
    await this.withCasesSchema(() =>
      this.casesRepository.update(
        { id: c.id },
        {
          status: EVtxCaseStatus.RESOLVED,
          resolvedAt,
          resolvedByUsername: currentUser.username,
          assignedToUsername: c.assignedToUsername ?? currentUser.username,
          lastMessageAt: resolvedAt,
        },
      )
    );

    const resolutionBody = input.message?.trim();
    const shouldWrite = typeof resolutionBody === 'string' && resolutionBody.length > 0;

    if (shouldWrite) {
      await this.withCasesSchema(async () => {
        const msg = this.messagesRepository.create({
          caseId: c.id,
          supportCase: c,
          authorUsername: currentUser.username,
          authorRole: EVtxCaseAuthorRole.ADMIN,
          body: resolutionBody,
        });
        await this.messagesRepository.save(msg);
      });
    }

    return SuccessResponse.toJson({
      code: 'CASE_RESOLVED',
      message: 'Case resolved successfully',
      path: `/admin/cases/${id}/resolve`,
      successCode: HttpStatus.OK,
    });
  }
}
