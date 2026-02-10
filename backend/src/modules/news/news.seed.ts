import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EVtxNewsBadgeVariant, VtxNewsEntity } from '@/database/entities/vtx-news.entity';

@Injectable()
export class NewsSeedService implements OnModuleInit {
  private readonly logger = new Logger(NewsSeedService.name);

  public constructor(
    @InjectRepository(VtxNewsEntity)
    private readonly newsRepository: Repository<VtxNewsEntity>,
  ) {}

  private nowMinusDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  public async onModuleInit() {
    // Seed only if table is empty (safe for prod/dev).
    const count = await this.newsRepository.count();
    if (count > 0) return;

    const seed: Array<Partial<VtxNewsEntity>> = [
      {
        slug: 'season-4-the-dark-convergence',
        title: 'Season 4: The Dark Convergence is Here!',
        excerpt:
          'Experience the biggest content update yet with new dungeons, raids, and a complete story arc...',
        content:
          'Welcome to Season 4!\n\n- New dungeons and raids\n- New legendary loot\n- Story arc expansion\n\nSee you in-game.',
        category: 'Major Update',
        badgeVariant: EVtxNewsBadgeVariant.DANGER,
        featured: true,
        readTime: '5 min',
        imageUrl: null,
        isPublished: true,
        publishedAt: this.nowMinusDays(1),
        createdByUsername: 'system',
        updatedByUsername: 'system',
      },
      {
        slug: 'double-xp-weekend-event',
        title: 'Double XP Weekend Event',
        excerpt: 'Level up faster this weekend! Earn double experience points in all activities...',
        content:
          'Double XP is live from Friday to Sunday.\n\nAll activities grant double experience points. Party up and enjoy!',
        category: 'Event',
        badgeVariant: EVtxNewsBadgeVariant.WARNING,
        featured: false,
        readTime: '2 min',
        imageUrl: null,
        isPublished: true,
        publishedAt: this.nowMinusDays(3),
        createdByUsername: 'system',
        updatedByUsername: 'system',
      },
      {
        slug: 'new-legendary-weapons-released',
        title: 'New Legendary Weapons Released',
        excerpt: 'Discover the power of the Chaos Blade series. Available through the new raid content...',
        content:
          'The Chaos Blade series is now available.\n\nDrop sources:\n- New raid bosses\n- Seasonal rewards\n\nGood luck!',
        category: 'Content',
        badgeVariant: EVtxNewsBadgeVariant.INFO,
        featured: false,
        readTime: '3 min',
        imageUrl: null,
        isPublished: true,
        publishedAt: this.nowMinusDays(5),
        createdByUsername: 'system',
        updatedByUsername: 'system',
      },
      {
        slug: 'server-maintenance-scheduled',
        title: 'Server Maintenance Scheduled',
        excerpt: 'We will be performing scheduled maintenance to improve stability and performance...',
        content:
          'Maintenance window:\n- 04:00 → 08:00 UTC\n\nDuring this time the servers will be offline.',
        category: 'Maintenance',
        badgeVariant: EVtxNewsBadgeVariant.DEFAULT,
        featured: false,
        readTime: '1 min',
        imageUrl: null,
        isPublished: true,
        publishedAt: this.nowMinusDays(6),
        createdByUsername: 'system',
        updatedByUsername: 'system',
      },
      {
        slug: 'balance-patch-notes-v4-1-5',
        title: 'Balance Patch Notes v4.1.5',
        excerpt: 'We have made several balance adjustments to improve class diversity in PvP and PvE...',
        content:
          'Patch v4.1.5\n\n- Balance tweaks\n- Bug fixes\n- QoL improvements\n\nFull patch notes inside.',
        category: 'Patch Notes',
        badgeVariant: EVtxNewsBadgeVariant.INFO,
        featured: false,
        readTime: '8 min',
        imageUrl: null,
        isPublished: true,
        publishedAt: this.nowMinusDays(9),
        createdByUsername: 'system',
        updatedByUsername: 'system',
      },
    ];

    await this.newsRepository.save(seed.map((s) => this.newsRepository.create(s)));
    this.logger.log(`Seeded ${seed.length} news items`);
  }
}

