# PLANFLOW-NAVASIAM

## Live, read-only sharing

The dashboard stores data in the current browser until Supabase is configured. To
share one live data source across devices:

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) to create the plans table,
   enable read-only access for visitors, and turn on realtime updates.
3. In Supabase Authentication, create accounts only for people who may edit.
   Disable public sign-ups so anyone with the viewer link cannot create an editor
   account.
4. In the dashboard, open **คลาวด์ / แชร์**, enter the Supabase Project URL and
   the public `anon`/publishable key, then sign in with an editor account.
5. Use **นำเข้าข้อมูลในเครื่อง** once to seed the empty cloud table, then copy
   **ลิงก์ดูอย่างเดียว · LIVE** to share.

Viewer links include the project URL and public anon key so visitors can read the
live data without signing in. This key is intended to be public; never put a
Supabase `service_role` key in the website or a shared link. Row-level security
allows anonymous reads only, while writes require an authenticated user.
Updates appear through Supabase Realtime. GitHub Pages redeploys the website on
pushes to `main`; data edits are stored in Supabase and do not require a redeploy.
