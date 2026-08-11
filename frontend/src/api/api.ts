const API_URL = "http://127.0.0.1:8787";
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
export async function updateRow(
tableName: string,
id: string | number,
data: Record<string, string | number | null>
) {
const response = await fetch(
`${API_URL}/api/data/${tableName}/${id}`,
{
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
}
);
return await response.json();
}
// ایجاد رکورد جدید در جدول
export async function createRow(
  tableName: string,
  data: Record<string, string | number | null>
) {

  const response = await fetch(
    `${API_URL}/api/data/${tableName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return await response.json();

}
export async function deleteRow(
tableName: string,
id: string | number
) {
const response = await fetch(
`${API_URL}/api/data/${tableName}/${id}`,
{
method: "DELETE",
headers: {
"Content-Type": "application/json",
},
}
);
return await response.json();
}