import "./load-env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { rooms } from "../content/rooms";
import { roomTypes } from "../src/lib/db/schema";

/** Upserts room types from content/rooms.ts. Safe to run repeatedly. */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  for (const room of rooms) {
    const values = {
      slug: room.slug,
      nameUk: room.name.uk,
      nameEn: room.name.en,
      capacity: room.capacity,
      unitsCount: room.unitsCount,
      basePrice: room.basePrice,
      amenities: room.amenities,
    };
    await db
      .insert(roomTypes)
      .values(values)
      .onConflictDoUpdate({ target: roomTypes.slug, set: { ...values, updatedAt: new Date() } });
    console.log(`room_types: ${room.slug}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
