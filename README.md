# Lesson4 — Student Manager

An Expo React Native student-management application with bilingual Vietnamese/English UI, student avatar support, CRUD confirmations, and Supabase persistence.

## Supabase setup

1. Create or select a Supabase project.
2. In **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Authentication → Providers**, enable **Anonymous Sign-Ins**.
4. Run the complete schema. It creates Row Level Security policies so each device can only read and change its own student records.
5. Copy `.env.example` to `.env`, then fill in the project values from **Supabase Dashboard → Connect**:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

6. Restart the Expo server after changing `.env`.

## Start the app

```bash
npm install
npx expo start
```

To launch the web version, press `w` in the Expo terminal. The app renders a clear setup message until the Supabase environment variables are configured.

## Checks

```bash
npx expo lint
npx tsc --noEmit
```
