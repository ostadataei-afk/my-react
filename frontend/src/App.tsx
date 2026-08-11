import { useEffect, useState } from "react";
import { getTables, getColumns } from "./api/api";
import Hello from "./components/Hello";
import TableList from "./components/TableList";
import ColumnList from "./components/ColumnList";
function App() {
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {

    getTables().then((data) => {
      setTables(data.results);
    });

  }, []);


  return (
    <div>
      <h1>D1 Manager</h1>
      <Hello name="علیرضا" />
      <h2>Tables</h2>
      <p>تعداد جدول‌ها: {tables.length}</p>
    <TableList
      tables={tables}
      onSelectTable={(tableName) => {

        setSelectedTable(tableName);

    getColumns(tableName).then((data) => {
      console.log("COLUMNS RESPONSE:", data);
      setColumns(data.results ?? data);
    });

      }}
    />
    <p>
      جدول انتخاب شده: {selectedTable}
    </p>
    <ColumnList columns={columns} />
    </div>
  );
}

export default App;