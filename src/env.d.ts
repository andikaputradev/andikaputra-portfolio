/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    admin: import('better-auth').User | null;
    session: import('better-auth').Session | null;
  }
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly BETTER_AUTH_SECRET: string;
  readonly BETTER_AUTH_URL: string;
  readonly ADMIN_EMAIL: string;
  readonly ADMIN_INITIAL_PASSWORD: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly VISITOR_HASH_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
