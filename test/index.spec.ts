import { env, SELF } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";

async function api(path: string, method = "GET", body?: unknown) {
  return SELF.fetch(`https://example.com${path}`, {
    method,
    headers: {"Content-Type": "application/json"},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(async () => {
  await env.DB.exec('CREATE TABLE records (id INTEGER PRIMARY KEY, title TEXT, score INTEGER); INSERT INTO records VALUES (1, \'original\', 42);');
});

describe("table and column management", () => {
  it("renames a table while preserving data, then deletes it", async () => {
    expect((await api("/api/table/records", "PUT", {name: "renamed"})).status).toBe(200);
    const rows = await (await api("/api/data/renamed")).json() as {results: unknown[]};
    expect(rows.results).toEqual([{id: 1, title: "original", score: 42}]);
    expect((await api("/api/table/records", "DELETE")).status).toBe(404);
    expect((await api("/api/table/renamed", "DELETE")).status).toBe(200);
    expect(await env.DB.prepare("SELECT name FROM sqlite_master WHERE name = 'renamed'").first()).toBeNull();
  });

  it("renames and drops a column without changing other data", async () => {
    expect((await api("/api/table/records/column/title", "PUT", {name: "description"})).status).toBe(200);
    expect(await env.DB.prepare("SELECT * FROM records").first()).toEqual({id: 1, description: "original", score: 42});
    expect((await api("/api/table/records/column/description", "DELETE")).status).toBe(200);
    expect(await env.DB.prepare("SELECT * FROM records").first()).toEqual({id: 1, score: 42});
  });

  it.each(["", "invalid-name", 'name"; DROP TABLE records;--', "sqlite_hidden", "_cf_hidden"])("rejects invalid table and column names: %s", async name => {
    expect((await api("/api/table/records", "PUT", {name})).status).toBe(400);
    expect((await api("/api/table/records/column/title", "PUT", {name})).status).toBe(400);
    expect(await env.DB.prepare("SELECT title FROM records").first()).toEqual({title: "original"});
  });

  it("rejects case-insensitive duplicates", async () => {
    await env.DB.exec("CREATE TABLE other (id INTEGER PRIMARY KEY)");
    expect((await api("/api/table/records", "PUT", {name: "OTHER"})).status).toBe(409);
    expect((await api("/api/table/records/column/title", "PUT", {name: "SCORE"})).status).toBe(409);
    expect(await env.DB.prepare("SELECT title FROM records").first()).toEqual({title: "original"});
  });

  it.each(["PUT", "DELETE"])("protects id and other primary keys from %s", async method => {
    expect((await api("/api/table/records/column/ID", method, method === "PUT" ? {name: "new_id"} : undefined)).status).toBe(400);
    await env.DB.exec("CREATE TABLE keyed (code TEXT PRIMARY KEY, title TEXT)");
    expect((await api("/api/table/keyed/column/code", method, method === "PUT" ? {name: "new_code"} : undefined)).status).toBe(400);
  });

  it("returns 404 for missing tables or columns", async () => {
    expect((await api("/api/table/missing", "DELETE")).status).toBe(404);
    expect((await api("/api/table/records/column/missing", "DELETE")).status).toBe(404);
  });

  it("reports a constrained column deletion as an error and preserves data", async () => {
    await env.DB.exec("CREATE INDEX title_index ON records(title)");
    const response = await api("/api/table/records/column/title", "DELETE");
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({success: false, error: expect.any(String)});
    expect(await env.DB.prepare("SELECT title FROM records").first()).toEqual({title: "original"});
  });

  it("rejects malformed JSON and missing rename fields", async () => {
    const malformed = await SELF.fetch("https://example.com/api/table/records", {method: "PUT", body: "{"});
    expect(malformed.status).toBe(400);
    expect((await api("/api/table/records", "PUT", {})).status).toBe(400);
    expect((await api("/api/table/records/column/title", "PUT", null)).status).toBe(400);
  });
});
