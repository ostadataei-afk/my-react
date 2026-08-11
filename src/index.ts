function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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



    // دریافت لیست جدول‌ها
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



    // دریافت ستون‌های یک جدول
    if (url.pathname.startsWith("/api/table/")) {


      const tableName = url.pathname.split("/").pop();


      const result = await env.DB
        .prepare(`PRAGMA table_info(${tableName})`)
        .all();


      return Response.json(result, {
        headers: corsHeaders(),
      });
    }



    // دریافت اطلاعات داخل جدول
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