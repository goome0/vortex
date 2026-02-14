import { Module } from '@nestjs/common';
import { ListAccountCharactersService } from './list-account-characters.service';
import { UpdateAccountCharacterService } from './update-account-character.service';
import { LookupAccountByCharacterNameService } from './lookup-account-by-character-name.service';

@Module({
  providers: [
    ListAccountCharactersService,
    UpdateAccountCharacterService,
    LookupAccountByCharacterNameService,
  ],
  exports: [
    ListAccountCharactersService,
    UpdateAccountCharacterService,
    LookupAccountByCharacterNameService,
  ],
})
export class AccountCharactersModule {}
