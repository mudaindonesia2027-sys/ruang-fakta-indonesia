# RUANG FAKTA

Platform publik untuk isu masyarakat, kebijakan, artikel faktual, diskusi, dan pembaruan isu.

## Deploy ke Vercel

1. Push seluruh isi folder ini ke root repository GitHub.
2. Di Vercel, Import repository.
3. Tambahkan environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` **atau** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Pastikan database schema Prisma diterapkan dari `prisma/schema.prisma`.
5. Deploy. Build command otomatis menjalankan `prisma generate && next build`.

## Catatan Supabase

Untuk Google OAuth, set Redirect URL ke:

`https://DOMAIN-ANDA/auth/callback`

Tambahkan URL Vercel preview/production sesuai domain yang dipakai.
OK
