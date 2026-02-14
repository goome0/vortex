import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AdminDeleteManyPromosInputDTO } from '../../admin.input';

type DeleteManyResultDTO = {
  requested: number;
  deleted: number;
  failed: Array<{ code: string; error: string }>;
};

@Injectable()
export class DeleteManyPromosService {
  private readonly logger = new Logger(DeleteManyPromosService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  private normalizeCodes(codes: string[]): string[] {
    const normalized = (codes ?? [])
      .map((c) => String(c ?? '').trim())
      .filter(Boolean);
    return [...new Set(normalized)];
  }

  public async execute(input: AdminDeleteManyPromosInputDTO, currentUser: CurrentUserDTO) {
    const codes = this.normalizeCodes(input.codes);
    if (codes.length === 0) throw new BadRequestException('No promo codes provided');

    this.logger.log(`Deleting ${codes.length} promos - requested by ${currentUser.username}`);

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const failed: DeleteManyResultDTO['failed'] = [];
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

    const data: DeleteManyResultDTO = { requested: codes.length, deleted, failed };

    return SuccessResponse.toJson({
      code: 'DELETE_MANY_PROMOS_SUCCESS',
      message: 'Promos deleted',
      path: '/admin/promo/delete-many',
      data,
    });
  }
}

