import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { Injectable, Logger } from '@nestjs/common';
import { expandProductsForApi, normalizeProducts } from '../../../utils/product-quantity.util';

@Injectable()
export class ItemBundleDispatchService {
  private readonly logger = new Logger(ItemBundleDispatchService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async dispatch(params: {
    requestedByUsername: string;
    targetUsername: string;
    cpCost: number;
    products: unknown;
  }) {
    const requestedByUsername = params.requestedByUsername.trim().toLowerCase();
    const targetUsername = params.targetUsername.trim().toLowerCase();

    const normalized = normalizeProducts(params.products);
    const expanded = expandProductsForApi(normalized);

    const session = await this.compHackAuthService.getSession(requestedByUsername);

    this.logger.log(
      `Dispatching bundle to ${targetUsername} (${expanded.length} items, cpCost=${params.cpCost}) - requested by ${requestedByUsername}`,
    );

    return this.imagineService.postItems({
      ...session,
      username: targetUsername,
      cp: params.cpCost,
      products: expanded,
    });
  }
}

