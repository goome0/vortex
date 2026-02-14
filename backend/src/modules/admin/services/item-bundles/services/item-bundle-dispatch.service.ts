import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { Injectable, Logger } from '@nestjs/common';

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
    products: number[];
  }) {
    const requestedByUsername = params.requestedByUsername.trim().toLowerCase();
    const targetUsername = params.targetUsername.trim().toLowerCase();

    const session = await this.compHackAuthService.getSession(requestedByUsername);

    this.logger.log(
      `Dispatching bundle to ${targetUsername} (${params.products.length} items, cpCost=${params.cpCost}) - requested by ${requestedByUsername}`,
    );

    return this.imagineService.postItems({
      ...session,
      username: targetUsername,
      cp: params.cpCost,
      products: params.products,
    });
  }
}

