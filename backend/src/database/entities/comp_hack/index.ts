import { Account } from './account.entity';
import { Migrations } from './migrations.entity';
import { PostItem } from './post-item.entity';
import { Promo } from './promo.entity';
import { PromoExchange } from './promo-exchange.entity';
import { RegisteredWorld } from './registered-world.entity';

export { Account, Migrations, PostItem, Promo, PromoExchange, RegisteredWorld };

export const COMP_HACK_ENTITIES = [
  Account,
  Migrations,
  PostItem,
  Promo,
  PromoExchange,
  RegisteredWorld,
] as const;
