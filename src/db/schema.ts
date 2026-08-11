import { relations } from 'drizzle-orm';
import {
  pgTable,
  integer,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { ProjectDraftFields } from './draft-types';

export const projectTagEnum = pgEnum('project_tag', ['SECURITY', 'WEB2', 'WEB3']);
export const schemaTypeEnum = pgEnum('schema_type', ['CreativeWork', 'SoftwareApplication']);

export const projects = pgTable(
  'projects',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    tag: projectTagEnum('tag').notNull(),
    schemaType: schemaTypeEnum('schema_type').notNull().default('CreativeWork'),
    flagship: boolean('flagship').notNull().default(false),
    summary: text('summary').notNull(),
    bodyMarkdown: text('body_markdown').notNull(),
    stack: jsonb('stack').$type<string[]>().notNull().default([]),
    liveUrl: text('live_url'),
    repoUrl: text('repo_url'),
    coverImagePath: text('cover_image_path'),
    coverImagePublicId: text('cover_image_public_id'),
    displayOrder: integer('display_order').notNull().default(0),
    published: boolean('published').notNull().default(true),
    draftData: jsonb('draft_data').$type<ProjectDraftFields | null>(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('projects_published_display_order_idx').on(table.published, table.displayOrder.desc())],
);

export const certifications = pgTable(
  'certifications',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: text('name').notNull(),
    issuer: text('issuer').notNull(),
    issueDate: timestamp('issue_date', { withTimezone: true }).notNull(),
    expiryDate: timestamp('expiry_date', { withTimezone: true }),
    credentialId: text('credential_id'),
    verificationUrl: text('verification_url'),
    assetPublicId: text('asset_public_id'),
    assetFormat: text('asset_format'),
    displayOrder: integer('display_order').notNull().default(0),
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('certifications_published_display_order_idx').on(table.published, table.displayOrder.desc()),
  ],
);

export const siteProfile = pgTable('site_profile', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  photoPublicId: text('photo_public_id'),
  cvPublicId: text('cv_public_id'),
  cvUpdatedAt: timestamp('cv_updated_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const auditAction = pgEnum('audit_action', ['create', 'update', 'delete']);
export const auditEntityType = pgEnum('audit_entity_type', [
  'project',
  'certification',
  'profile',
]);

export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  actorEmail: text('actor_email').notNull(),
  action: auditAction('action').notNull(),
  entityType: auditEntityType('entity_type').notNull(),
  entityId: text('entity_id'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const deviceTypeEnum = pgEnum('device_type', ['desktop', 'mobile', 'tablet']);

export const pageViews = pgTable(
  'page_views',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    path: text('path').notNull(),
    referrer: text('referrer'),
    country: text('country'),
    deviceType: deviceTypeEnum('device_type').notNull().default('desktop'),
    visitorHash: text('visitor_hash'),
    visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('page_views_visited_at_idx').on(table.visitedAt),
    index('page_views_path_idx').on(table.path),
  ],
);

export const rateLimitLog = pgTable(
  'rate_limit_log',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    bucket: text('bucket').notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull().default(1),
  },
  (table) => [uniqueIndex('rate_limit_log_bucket_window_idx').on(table.bucket, table.windowStart)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Certification = typeof certifications.$inferSelect;
export type NewCertification = typeof certifications.$inferInsert;
export type SiteProfile = typeof siteProfile.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

// Tabel di bawah ini dihasilkan `npx @better-auth/cli generate` terhadap
// src/lib/auth.ts (better-auth@1.6.25) — jangan diedit manual. Field/tabel
// baru dari perubahan plugin (mis. menambah plugin Better Auth lain) wajib
// lewat regenerasi CLI yang sama, bukan ditambah tangan, agar tidak drift
// dari kontrak yang benar-benar diharapkan adapter versi terpasang.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const twoFactor = pgTable(
  'two_factor',
  {
    id: text('id').primaryKey(),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    verified: boolean('verified').default(true),
    failedVerificationCount: integer('failed_verification_count').default(0),
    lockedUntil: timestamp('locked_until'),
  },
  (table) => [index('twoFactor_secret_idx').on(table.secret), index('twoFactor_userId_idx').on(table.userId)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, { fields: [twoFactor.userId], references: [user.id] }),
}));

export type AuthUser = typeof user.$inferSelect;
export type AuthSession = typeof session.$inferSelect;
