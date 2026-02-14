import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { AdminListAccountsQueryDTO } from '../../admin.input';

@Injectable()
export class GetAccountsService {
  private readonly logger = new Logger(GetAccountsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO, query: AdminListAccountsQueryDTO) {
    this.logger.log(`Getting accounts - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getAccounts(session);

    const q = query.q?.trim().toLowerCase();
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const all = Array.isArray(response.accounts) ? response.accounts : [];
    const filtered = q
      ? all.filter((a) => {
          const username = String(a.username ?? '').toLowerCase();
          const email = String(a.email ?? '').toLowerCase();
          const disp = String((a as any).disp_name ?? '').toLowerCase();
          return username.includes(q) || email.includes(q) || disp.includes(q);
        })
      : all;

    const total = filtered.length;
    const items = filtered.slice(skip, skip + limit);

    return SuccessResponse.toJson({
      code: 'GET_ACCOUNTS_SUCCESS',
      message: 'Accounts retrieved successfully',
      path: '/admin/accounts',
      data: {
        items,
        total,
        page,
        limit,
      },
    });
  }
}
