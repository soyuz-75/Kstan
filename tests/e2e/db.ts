import "../../scripts/load-env";
import postgres from "postgres";

/** Direct DB access for assertions and fixtures in e2e tests. */
export const sql = postgres(process.env.DATABASE_URL ?? "postgres://kstan:kstan@localhost:5432/kstan", { max: 2 });

export async function roomTypeId(slug: string): Promise<number> {
  const [row] = await sql<{ id: number }[]>`select id from room_types where slug = ${slug}`;
  if (!row) throw new Error(`room type ${slug} not seeded — run pnpm db:seed`);
  return row.id;
}
