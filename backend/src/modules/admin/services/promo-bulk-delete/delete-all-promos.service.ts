import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AdminDeleteAllPromosInputDTO } from '../../admin.input';

type DeleteAllResultDTO = {
  totalCodes: number;
  deleted: number;
  failed: Array<{ code: string; error: string }>;
};

@Injectable()
export class DeleteAllPromosService {
  private readonly logger = new Logger(DeleteAllPromosService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(input: AdminDeleteAllPromosInputDTO, currentUser: CurrentUserDTO) {
    if (!input.confirm) throw new BadRequestException('confirm must be true');

    this.logger.log(`Deleting ALL promos - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const promosResponse = await this.imagineService.getPromos(session);
    const codes = [...new Set((promosResponse.promos ?? []).map((p: any) => String(p?.code ?? '').trim()).filter(Boolean))];

    const failed: DeleteAllResultDTO['failed'] = [];
    let deleted = 0;

    for (const code of codes) {
      try {
        const response = await this.imagineService.deletePromo({ ...session, code });
        const err = String((response as any)?.error ?? '').trim();
        if (err) failed.push({ code, error: err });
        else deleted += 1;
      } catch (e: any) {
        failed.push({ code, error: String(e?.message ?? e) });
      }
    }

    const data: DeleteAllResultDTO = { totalCodes: codes.length, deleted, failed };

    return SuccessResponse.toJson({
      code: 'DELETE_ALL_PROMOS_SUCCESS',
      message: 'All promos deleted',
      path: '/admin/promo/delete-all',
      data,
    });
  }
}

