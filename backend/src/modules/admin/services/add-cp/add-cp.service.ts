import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AdminAddCpInputDTO } from '../../admin.input';
import { CpGrantService } from '../cp-grant/cp-grant.service';

@Injectable()
export class AddCpService {
  private readonly logger = new Logger(AddCpService.name);

  public constructor(
    private readonly cpGrantService: CpGrantService,
  ) {}

  public async execute(input: AdminAddCpInputDTO, currentUser: CurrentUserDTO) {
    const username = input.username.trim().toLowerCase();
    this.logger.log(`Adding CP to account ${username} (+${input.amount}) - requested by ${currentUser.username}`);

    const { previousCp, newCp } = await this.cpGrantService.addCp({
      username,
      amount: input.amount,
      requestedByUsername: currentUser.username,
    });

    return SuccessResponse.toJson({
      code: 'ADD_CP_SUCCESS',
      message: 'CP added successfully',
      path: '/admin/account/add-cp',
      data: {
        username,
        previousCp,
        addedCp: input.amount,
        newCp,
        reason: input.reason ?? null,
      },
      successCode: HttpStatus.OK,
    });
  }
}

