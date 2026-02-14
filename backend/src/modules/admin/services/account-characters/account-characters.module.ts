import { Module } from '@nestjs/common';
import { ListAccountCharactersService } from './list-account-characters.service';
import { UpdateAccountCharacterService } from './update-account-character.service';

@Module({
  providers: [ListAccountCharactersService, UpdateAccountCharacterService],
  exports: [ListAccountCharactersService, UpdateAccountCharacterService],
})
export class AccountCharactersModule {}
