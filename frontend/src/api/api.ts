const API_URL = "http://127.0.0.1:8787";;

export async function getTables() {
  const response = await fetch(
    `${API_URL}/api/tables`
  );

  const data = await response.json();

  console.log("API DATA:", data);

  return data;
}
export async function getColumns(tableName: string) {

  const response = await fetch(
    `${API_URL}/api/table/${tableName}`
  );

  const data = await response.json();

  console.log("COLUMN DATA:", data);

  return data;

}
export async function getData(tableName: string) {

  const response = await fetch(
    `${API_URL}/api/data/${tableName}`
  );

  const data = await response.json();

  console.log("DATA RESPONSE:", data);

  return data;
}