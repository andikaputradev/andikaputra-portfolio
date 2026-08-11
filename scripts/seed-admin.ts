import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { twoFactor } from 'better-auth/plugins';
import { db } from '../src/db';
import { user, session, account, verification, twoFactor as twoFactorTable } from '../src/db/schema';

const seedAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification, twoFactor: twoFactorTable },
  }),
  emailAndPassword: { enabled: true, disableSignUp: false, minPasswordLength: 12 },
  plugins: [twoFactor()],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL dan ADMIN_INITIAL_PASSWORD wajib di-set di environment');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_INITIAL_PASSWORD minimal 12 karakter');
  }

  const result = await seedAuth.api.signUpEmail({
    body: { email, password, name: 'Wahyu Andika Putra' },
  });

  if (!result?.user) {
    throw new Error('Gagal membuat akun admin — periksa apakah akun sudah ada sebelumnya');
  }

  console.log(`Admin account created: ${result.user.email}`);
  console.log('Ganti password dan aktifkan 2FA di /admin/settings/security setelah login pertama.');
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed admin gagal:', error instanceof Error ? error.message : error);
    process.exit(1);
  });
