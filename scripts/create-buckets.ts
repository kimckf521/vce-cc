import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const buckets = ["exams", "solutions"];
  for (const name of buckets) {
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error && error.message !== "The resource already exists") {
      console.error(`❌ ${name}: ${error.message}`);
    } else {
      console.log(`✅ Bucket ready: ${name}`);
    }
  }
}

main();
