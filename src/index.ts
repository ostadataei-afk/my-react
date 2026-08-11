function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
export default {
  async fetch(request, env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }
    const url = new URL(request.url);
    if (url.pathname === "/api/tables") {
      const result = await env.DB
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"
        )
        .all();
      return Response.json(result, {
        headers: corsHeaders(),
      });
    }
    if (
      request.method === "PUT" &&
      url.pathname.startsWith("/api/data/")
    ) {
      const parts = url.pathname.split("/");
      const tableName = parts[3];
      const id = parts[4];
      const body = await request.json() as Record<string, string | number | null>;
      const columns = Object.keys(body);
      const values = Object.values(body);
      const setQuery = columns
        .map(column => `${column} = ?`)
        .join(", ");
      const result = await env.DB
        .prepare(
          `UPDATE "${tableName}" SET ${setQuery} WHERE id = ?`
        )
        .bind(
          ...values,
          id
        )
        .run();
      return Response.json(
        {
          success: true,
          changes: result.meta.changes,
          tableName,
          id
        },
        {
          headers: corsHeaders(),
        }
      );
    }
    if (
      request.method === "DELETE" &&
      url.pathname.startsWith("/api/data/")
    ) {
      const parts = url.pathname.split("/");
      const tableName = parts[3];
      const id = parts[4];
      const result = await env.DB
        .prepare(
          `DELETE FROM "${tableName}" WHERE id = ?`
        )
        .bind(id)
        .run();
      return Response.json(
        {
          success: true,
          changes: result.meta.changes,
          tableName,
          id
        },
        {
          headers: corsHeaders(),
        }
      );
    }

	
	if (
  request.method === "POST" &&
  url.pathname.startsWith("/api/data/")
) {

  const tableName = url.pathname.split("/").pop();

  const body = await request.json() as Record<string, string | number | null>;

  const columns = Object.keys(body);

  const values = Object.values(body);

  const placeholders = columns
    .map(() => "?")
    .join(", ");

  const result = await env.DB
    .prepare(
      `INSERT INTO "${tableName}" (${columns.join(", ")}) VALUES (${placeholders})`
    )
    .bind(
      ...values
    )
    .run();

  return Response.json(
    {
      success: true,
      changes: result.meta.changes,
      id: result.meta.last_row_id,
      tableName
    },
    {
      headers: corsHeaders(),
    }
  );

}
    if (url.pathname.startsWith("/api/table/")) {
      const tableName = url.pathname.split("/").pop();
      const result = await env.DB
        .prepare(`PRAGMA table_info(${tableName})`)
        .all();
      return Response.json(result, {
        headers: corsHeaders(),
      });
    }
    if (url.pathname.startsWith("/api/data/")) {
      const tableName = url.pathname.split("/").pop();
      try {
        const result = await env.DB
          .prepare(`SELECT * FROM "${tableName}"`)
          .all();
        return Response.json(result, {
          headers: corsHeaders(),
        });
      } catch (error) {
        return Response.json(
          {
            error: String(error),
            tableName
          },
          {
            status: 500,
            headers: corsHeaders(),
          }
        );
      }
    }
    return new Response("API is running", {
      headers: corsHeaders(),
    });
  },
} satisfies ExportedHandler<Env>;
