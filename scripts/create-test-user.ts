/**
 * Creates the test user and promotes them to admin.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/create-test-user.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL       – from .env.local
 *   SUPABASE_SERVICE_ROLE_KEY      – from Supabase Dashboard → Settings → API
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "test@wellbeing-concepts.de";
  const password = "Test1234!";

  console.log(`Creating user: ${email} …`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip confirmation email
    user_metadata: { full_name: "Test Admin" },
  });

  if (error) {
    // If user already exists, look them up instead
    if (error.message.includes("already been registered")) {
      console.log("User already exists – fetching existing user …");
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === email);
      if (!existing) {
        console.error("Could not find existing user.");
        process.exit(1);
      }
      await promoteToAdmin(existing.id, email);
      return;
    }
    console.error("Error creating user:", error.message);
    process.exit(1);
  }

  console.log(`✓ User created: ${data.user.id}`);
  await promoteToAdmin(data.user.id, email);
}

async function promoteToAdmin(userId: string, email: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", full_name: "Test Admin" })
    .eq("id", userId);

  if (error) {
    console.error("Error promoting to admin:", error.message);
    process.exit(1);
  }

  console.log(`✓ Profile updated – role: admin`);
  console.log("\n─────────────────────────────────────────");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: Test1234!`);
  console.log(`  Role:     admin`);
  console.log(`  UUID:     ${userId}`);
  console.log("─────────────────────────────────────────\n");
}

main();
