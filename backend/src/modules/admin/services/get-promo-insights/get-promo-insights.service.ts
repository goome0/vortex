import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { SuccessResponse } from '@/common/responses/success-response';
import { CompHackEntities } from '@/database/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminListPromosQueryDTO } from '../../admin.input';

type PromoInsightDTO = {
  code: string;
  startTime: number;
  endTime: number;
  useLimit: number;
  limitType: string;
  items: number[];
  status: 'scheduled' | 'active' | 'expired';
  variants: number;
  exchangesTotal: number;
  lastExchangeAtSec?: number;
};

@Injectable()
export class GetPromoInsightsService {
  private readonly logger = new Logger(GetPromoInsightsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
    @InjectRepository(CompHackEntities.Promo)
    private readonly promoRepository: Repository<CompHackEntities.Promo>,
    @InjectRepository(CompHackEntities.PromoExchange)
    private readonly promoExchangeRepository: Repository<CompHackEntities.PromoExchange>,
  ) {}

  private toInt(value: unknown, fallback = 0): number {
    const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
    return Number.isFinite(n) ? n : fallback;
  }

  private computeStatus(nowSec: number, startTime: number, endTime: number): 'scheduled' | 'active' | 'expired' {
    if (startTime > 0 && nowSec < startTime) return 'scheduled';
    if (endTime > 0 && nowSec > endTime) return 'expired';
    return 'active';
  }

  public async execute(currentUser: CurrentUserDTO, query: AdminListPromosQueryDTO) {
    this.logger.log(`Getting promo insights - requested by ${currentUser.username}`);

    const nowSec = Math.floor(Date.now() / 1000);
    const session = await this.compHackAuthService.getSession(currentUser.username);
    const response = await this.imagineService.getPromos(session);

    const promos = (response.promos ?? []).map((p) => ({
      code: String(p.code ?? '').trim(),
      startTime: this.toInt(p.startTime),
      endTime: this.toInt(p.endTime),
      useLimit: this.toInt(p.useLimit),
      limitType: String(p.limitType ?? 'account'),
      items: Array.isArray(p.items) ? p.items.map((i) => this.toInt(i)).filter((n) => Number.isFinite(n)) : [],
    })).filter((p) => !!p.code);

    const insights: PromoInsightDTO[] = [];

    for (const promo of promos) {
      const variants = await this.promoRepository
        .createQueryBuilder('p')
        .select(['p.uid'])
        .where('LOWER(p.code) = LOWER(:code)', { code: promo.code })
        .getMany();

      const uids = variants.map((v) => v.uid).filter(Boolean);

      let exchangesTotal = 0;
      let lastExchangeAtSec: number | undefined;

      if (uids.length > 0) {
        const rows = await this.promoExchangeRepository
          .createQueryBuilder('e')
          .select('COUNT(*)', 'count')
          .addSelect('MAX(e.timestamp)', 'lastTimestamp')
          .where('e.promo IN (:...uids)', { uids })
          .getRawOne<{ count?: string; lastTimestamp?: string }>();

        exchangesTotal = this.toInt(rows?.count);
        const lastTs = this.toInt(rows?.lastTimestamp);
        if (lastTs > 0) lastExchangeAtSec = lastTs;
      }

      insights.push({
        ...promo,
        status: this.computeStatus(nowSec, promo.startTime, promo.endTime),
        variants: uids.length,
        exchangesTotal,
        ...(lastExchangeAtSec ? { lastExchangeAtSec } : {}),
      });
    }

    // Sort: active first, then scheduled, then expired; within group, newest endTime first.
    const order = { active: 0, scheduled: 1, expired: 2 } as const;
    insights.sort((a, b) => {
      const da = order[a.status] - order[b.status];
      if (da !== 0) return da;
      return (b.endTime || 0) - (a.endTime || 0);
    });

    const q = query.q?.trim().toLowerCase();
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const filtered = q ? insights.filter((p) => p.code.toLowerCase().includes(q)) : insights;
    const total = filtered.length;
    const items = filtered.slice(skip, skip + limit);

    return SuccessResponse.toJson({
      code: 'GET_PROMO_INSIGHTS_SUCCESS',
      message: 'Promo insights retrieved successfully',
      path: '/admin/promos/insights',
      data: {
        items,
        total,
        page,
        limit,
      },
    });
  }
}
