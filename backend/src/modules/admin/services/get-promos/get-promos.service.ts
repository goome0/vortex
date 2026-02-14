import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger } from '@nestjs/common';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { AdminListPromosQueryDTO } from '../../admin.input';

@Injectable()
export class GetPromosService {
  private readonly logger = new Logger(GetPromosService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO, query: AdminListPromosQueryDTO) {
    this.logger.log(`Getting promos - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getPromos(session);

    const q = query.q?.trim().toLowerCase();
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const all = Array.isArray(response.promos) ? response.promos : [];
    const filtered = q ? all.filter((p) => String(p.code ?? '').toLowerCase().includes(q)) : all;
    const total = filtered.length;
    const items = filtered.slice(skip, skip + limit);

    return SuccessResponse.toJson({
      code: 'GET_PROMOS_SUCCESS',
      message: 'Promos retrieved successfully',
      path: '/admin/promos',
      data: {
        items,
        total,
        page,
        limit,
      },
    });
  }
}
