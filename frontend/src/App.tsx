import { useEffect, useState } from "react";
import { getTables, getColumns, getData } from "./api/api";
import Hello from "./components/Hello";
import TableList from "./components/TableList";
import ColumnList from "./components/ColumnList";
import DataTable from "./components/DataTable";

  type Table = {
  name: string;
};

type Column = {
  name: string;
};
type Row = {
  [key: string]: string | number | null;
};
function App() {

const [selectedTable, setSelectedTable] = useState("");
const [columns, setColumns] = useState<Column[]>([]);
const [tables, setTables] = useState<Table[]>([]);
const [rows, setRows] = useState<Row[]>([]);
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
    getData(tableName).then((data) => {
      setRows(data.results);
    });
      }}
    />
    <p>
      جدول انتخاب شده: {selectedTable}
    </p>
    <ColumnList columns={columns} />
    <DataTable rows={rows} />
    </div>
  );
}

export default App;