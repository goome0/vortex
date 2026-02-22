import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VtxLauncherConfigEntity } from '@/database/entities/vtx-launcher-config.entity';
import { UpdateLauncherConfigInputDTO } from './update-launcher-config.input';

@Injectable()
export class UpdateLauncherConfigService {
  private readonly configId = 1;

  public constructor(
    @InjectRepository(VtxLauncherConfigEntity)
    private readonly configRepository: Repository<VtxLauncherConfigEntity>,
  ) {}

  public async execute(input: UpdateLauncherConfigInputDTO) {
    let row = await this.configRepository.findOne({ where: { id: this.configId } });

    if (!row) {
      row = this.configRepository.create({
        id: this.configId,
        heroSubtitle: input.heroSubtitle?.trim() ?? null,
        heroSubtitleColor: input.heroSubtitleColor?.trim() ?? null,
        heroTitle: input.heroTitle?.trim() ?? null,
        heroDescription: input.heroDescription?.trim() ?? null,
        playButtonBackground: input.playButtonBackground?.trim() ?? null,
        playButtonHoverBackground: input.playButtonHoverBackground?.trim() ?? null,
        playButtonTextColor: input.playButtonTextColor?.trim() ?? null,
        backgroundUrl: input.backgroundUrl?.trim() ?? null,
        backgroundAlt: input.backgroundAlt?.trim() ?? null,
      });
    } else {
      if (input.heroSubtitle !== undefined) row.heroSubtitle = input.heroSubtitle?.trim() ?? null;
      if (input.heroSubtitleColor !== undefined)
        row.heroSubtitleColor = input.heroSubtitleColor?.trim() ?? null;
      if (input.heroTitle !== undefined) row.heroTitle = input.heroTitle?.trim() ?? null;
      if (input.heroDescription !== undefined)
        row.heroDescription = input.heroDescription?.trim() ?? null;
      if (input.playButtonBackground !== undefined)
        row.playButtonBackground = input.playButtonBackground?.trim() ?? null;
      if (input.playButtonHoverBackground !== undefined)
        row.playButtonHoverBackground = input.playButtonHoverBackground?.trim() ?? null;
      if (input.playButtonTextColor !== undefined)
        row.playButtonTextColor = input.playButtonTextColor?.trim() ?? null;
      if (input.backgroundUrl !== undefined) row.backgroundUrl = input.backgroundUrl?.trim() ?? null;
      if (input.backgroundAlt !== undefined) row.backgroundAlt = input.backgroundAlt?.trim() ?? null;
    }

    const updated = await this.configRepository.save(row);

    return SuccessResponse.toJson({
      code: 'ADMIN_LAUNCHER_CONFIG_UPDATE_SUCCESS',
      message: 'Launcher config updated successfully',
      path: '/admin/launcher/config',
      data: updated,
      successCode: 200,
    });
  }
}
