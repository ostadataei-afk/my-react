const API_URL = import.meta.env.VITE_API_URL ?? "https://d1-manager.ostad-ataei.workers.dev";

type Row = Record<string, string | number | null>;
type Result<T> = { success: boolean; results: T[] };

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || "عملیات انجام نشد");
  }
  return data;
}

const tablePath = (name: string) => `/api/table/${encodeURIComponent(name)}`;
const dataPath = (name: string) => `/api/data/${encodeURIComponent(name)}`;
export const getTables = () => request<Result<{name: string}>>("/api/tables");
export const getData = (table: string) => request<Result<Row>>(dataPath(table));
export const getColumns = (table: string) => request<Result<{name: string; pk: number}>>(tablePath(table));
export const createTable = (tableName: string) => request<{success: boolean}>("/api/tables", "POST", {tableName});
export const renameTable = (table: string, name: string) => request(tablePath(table), "PUT", {name});
export const deleteTable = (table: string) => request(tablePath(table), "DELETE");
export const createColumn = (table: string, columnName: string, columnType: string) =>
  request<{success: boolean; error?: string}>(`${tablePath(table)}/column`, "POST", {columnName, columnType});
export const renameColumn = (table: string, column: string, name: string) =>
  request(`${tablePath(table)}/column/${encodeURIComponent(column)}`, "PUT", {name});
export const deleteColumn = (table: string, column: string) =>
  request(`${tablePath(table)}/column/${encodeURIComponent(column)}`, "DELETE");
export const createRow = (table: string, row: Row) => request(dataPath(table), "POST", row);
export const updateRow = (table: string, id: string | number, row: Row) =>
  request(`${dataPath(table)}/${encodeURIComponent(id)}`, "PUT", row);
export const deleteRow = (table: string, id: string | number) =>
  request(`${dataPath(table)}/${encodeURIComponent(id)}`, "DELETE");
