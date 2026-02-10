import { AccountWorldData } from './account-world-data.entity';
import { BazaarData } from './bazaar-data.entity';
import { BazaarItem } from './bazaar-item.entity';
import { Character } from './character.entity';
import { CharacterProgress } from './character-progress.entity';
import { Clan } from './clan.entity';
import { ClanMember } from './clan-member.entity';
import { CultureData } from './culture-data.entity';
import { Demon } from './demon.entity';
import { DemonBox } from './demon-box.entity';
import { DemonQuest } from './demon-quest.entity';
import { EntityStats } from './entity-stats.entity';
import { EventCounter } from './event-counter.entity';
import { Expertise } from './expertise.entity';
import { FriendSettings } from './friend-settings.entity';
import { Hotbar } from './hotbar.entity';
import { InheritedSkill } from './inherited-skill.entity';
import { Item } from './item.entity';
import { ItemBox } from './item-box.entity';
import { Migrations } from './migrations.entity';
import { PentalphaEntry } from './pentalpha-entry.entity';
import { PentalphaMatch } from './pentalpha-match.entity';
import { PvPData } from './pv-p-data.entity';
import { Quest } from './quest.entity';
import { RegisteredChannel } from './registered-channel.entity';
import { ReportedPlayer } from './reported-player.entity';
import { StatusEffect } from './status-effect.entity';
import { UbResult } from './ub-result.entity';
import { UbTournament } from './ub-tournament.entity';

export {
  AccountWorldData,
  BazaarData,
  BazaarItem,
  Character,
  CharacterProgress,
  Clan,
  ClanMember,
  CultureData,
  Demon,
  DemonBox,
  DemonQuest,
  EntityStats,
  EventCounter,
  Expertise,
  FriendSettings,
  Hotbar,
  InheritedSkill,
  Item,
  ItemBox,
  Migrations,
  PentalphaEntry,
  PentalphaMatch,
  PvPData,
  Quest,
  RegisteredChannel,
  ReportedPlayer,
  StatusEffect,
  UbResult,
  UbTournament,
};

export const WORLD_ENTITIES = [
  AccountWorldData,
  BazaarData,
  BazaarItem,
  Character,
  CharacterProgress,
  Clan,
  ClanMember,
  CultureData,
  Demon,
  DemonBox,
  DemonQuest,
  EntityStats,
  EventCounter,
  Expertise,
  FriendSettings,
  Hotbar,
  InheritedSkill,
  Item,
  ItemBox,
  Migrations,
  PentalphaEntry,
  PentalphaMatch,
  PvPData,
  Quest,
  RegisteredChannel,
  ReportedPlayer,
  StatusEffect,
  UbResult,
  UbTournament,
] as const;
