export interface Env {DB: D1Database;ASSETS: Fetcher;}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function identifier(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value) || /^(sqlite_|_cf_)/i.test(value)) {
    throw new ApiError(400, "نام جدول یا ستون نامعتبر است");
  }
  return `"${value}"`;
}

async function tableColumns(db: D1Database, name: string) {
  const quoted = identifier(name);
  const exists = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ? COLLATE NOCASE").bind(name).first();
  if (!exists) throw new ApiError(404, "جدول پیدا نشد");
  return (await db.prepare(`PRAGMA table_info(${quoted})`).all<{name: string; pk: number}>()).results;
}

export default {
  async fetch(request, env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }
    const url = new URL(request.url);
    try {
    const management = url.pathname.match(/^\/api\/table\/([^/]+)(?:\/column\/([^/]+))?$/);
    if (management && ["PUT", "DELETE"].includes(request.method)) {
      const tableName = decodeURIComponent(management[1]);
      const table = identifier(tableName);
      const columns = await tableColumns(env.DB, tableName);
      const columnName = management[2] ? decodeURIComponent(management[2]) : null;
      if (columnName !== null) {
        const column = identifier(columnName);
        const existing = columns.find(item => item.name.toLowerCase() === columnName.toLowerCase());
        if (!existing) throw new ApiError(404, "ستون پیدا نشد");
        if (existing.pk || existing.name.toLowerCase() === "id") throw new ApiError(400, "تغییر یا حذف ستون کلید اصلی مجاز نیست");
        if (request.method === "DELETE") {
          await env.DB.prepare(`ALTER TABLE ${table} DROP COLUMN ${column}`).run();
        } else {
          const body = await request.json() as {name?: unknown};
          const name = body?.name;
          const renamed = identifier(name);
          if (typeof name !== "string" || name.toLowerCase() === "id") throw new ApiError(400, "نام ستون مجاز نیست");
          if (columns.some(item => item.name.toLowerCase() === name.toLowerCase())) throw new ApiError(409, "نام ستون تکراری است");
          await env.DB.prepare(`ALTER TABLE ${table} RENAME COLUMN ${column} TO ${renamed}`).run();
        }
      } else if (request.method === "DELETE") {
        await env.DB.prepare(`DROP TABLE ${table}`).run();
      } else {
        const body = await request.json() as {name?: unknown};
        const name = body?.name;
        const renamed = identifier(name);
        const duplicate = await env.DB.prepare("SELECT name FROM sqlite_master WHERE name = ? COLLATE NOCASE").bind(name as string).first();
        if (duplicate) throw new ApiError(409, "نام جدول تکراری است");
        await env.DB.prepare(`ALTER TABLE ${table} RENAME TO ${renamed}`).run();
      }
      return Response.json({success: true}, {headers: corsHeaders()});
    }
    if (request.method === "POST" && url.pathname === "/api/tables" ) 
      {
      const body = await request.json() as {tableName: string;};
      const tableName = body.tableName;
      await env.DB
        .prepare(`CREATE TABLE "${tableName}" (id INTEGER PRIMARY KEY)`)
        .run();
      return Response.json(
        { success: true,
          tableName
        },{ headers: corsHeaders(),}
      );
    }
    if (
      request.method === "POST" &&
      url.pathname.match(/^\/api\/table\/[^/]+\/column$/)
    ) {
      const parts = url.pathname.split("/");
      const tableName = parts[3];
      const body = await request.json() as {columnName: string;columnType: string;};
      const result = await env.DB
        .prepare(`ALTER TABLE "${tableName}" ADD COLUMN "${body.columnName}" ${body.columnType}`)
        .run();
      return Response.json(
        {
          success: true,
          tableName,
          columnName: body.columnName,
          columnType: body.columnType,
          changes: result.meta.changes
        },
        {
          headers: corsHeaders(),
        }
      );
    }
    if (
      request.method === "GET" && url.pathname === "/api/tables") 
      {
      const result = await env.DB
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'")
        .all();
      return Response.json(result, {
        headers: corsHeaders(),
      });
    }
    if (request.method === "PUT" && url.pathname.startsWith("/api/data/")) 
      {
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
        .prepare(`UPDATE "${tableName}" SET ${setQuery} WHERE id = ?`)
        .bind(...values,id)
        .run();
      return Response.json(
        {
          success: true,
          changes: result.meta.changes,
          tableName,
          id
        },
        {headers: corsHeaders(),}
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
        .prepare(`DELETE FROM "${tableName}" WHERE id = ?`)
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
  request.method === "POST" &&  url.pathname.startsWith("/api/data/")) 
  {
  const tableName = url.pathname.split("/").pop();
  const body = await request.json() as Record<string, string | number | null>;
  const columns = Object.keys(body);
  const values = Object.values(body);
  const placeholders = columns
    .map(() => "?")
    .join(", ");
  const result = await env.DB
    .prepare(`INSERT INTO "${tableName}" (${columns.join(", ")}) VALUES (${placeholders})`)
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
    if (
      request.method === "GET" && url.pathname.startsWith("/api/table/")) 
      {
      const parts = url.pathname.split("/");
      const tableName = parts[3];
      const result = await env.DB
        .prepare(`PRAGMA table_info("${tableName}")`)
        .all();
      return Response.json(result, {headers: corsHeaders(),});}
    if (url.pathname.startsWith("/api/data/")) {
      const tableName = url.pathname.split("/").pop();
      try {
        const result = await env.DB
          .prepare(`SELECT * FROM "${tableName}"`)
          .all();
        return Response.json(result, {headers: corsHeaders(),});
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
// اگر مسیر API بود ولی هیچ‌کدام از هندلرها آن را نگرفتند → 404 بده
    if (url.pathname.startsWith("/api")) {
      return new Response("Unknown API route", {
        status: 404,
        headers: corsHeaders(),
      });
    }
    return env.ASSETS.fetch(request);
    } catch (error) {
      const status = error instanceof ApiError ? error.status : error instanceof SyntaxError || error instanceof URIError ? 400 : 500;
      const message = error instanceof ApiError ? error.message : status === 400 ? "درخواست نامعتبر است" : "عملیات انجام نشد؛ محدودیت‌های جدول یا ارتباط با پایگاه داده را بررسی کنید";
      return Response.json({success: false, error: message}, {status, headers: corsHeaders()});
    }
  },
} satisfies ExportedHandler<Env>;
