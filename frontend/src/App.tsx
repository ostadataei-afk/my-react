import { useEffect, useState } from "react";
import { getTables, getColumns, getData } from "./api/api";
import TableList from "./components/Table/TableList";
import ColumnList from "./components/Table/ColumnList";
import DataTable from "./components/Table/DataTable";
import RowDetails from "./components/Forms/RowDetails";
import CreateForm from "./components/Forms/CreateForm";
import Layout from "./components/Layout/Layout";
import TabBar from "./components/Layout/TabBar";
import TableToolbar from "./components/Table/TableToolbar";
import NewRowInput from "./components/Table/NewRowInput";
import { createRow } from "./api/api";

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
const [selectedRow, setSelectedRow] = useState<Row | null>(null);
const refreshData = () => {

  if (!selectedTable) return;


  getData(selectedTable).then((data) => {
    setRows(data.results);
  });

};
  useEffect(() => {

    getTables().then((data) => {
      setTables(data.results);
    });

  }, []);


return (
  <Layout>
    <div>
      <h2>Tables</h2>
      <p>تعداد جدول‌ها: {tables.length}</p>
      <TabBar
        tables={tables}
        activeTable={selectedTable}
        onSelect={(tableName) => {
          setSelectedTable(tableName);
          setSelectedRow(null);

          getColumns(tableName).then((data) => {
            setColumns(data.results ?? data);
          });

          getData(tableName).then((data) => {
            setRows(data.results);
          });
        }}
      />

      <TableList
        tables={tables}
        onSelectTable={(tableName) => {
          setSelectedTable(tableName);
          setSelectedRow(null);

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
      <TableToolbar />


      <NewRowInput
        columns={columns}
        onSave={async (row) => {
          console.log("SAVE CALLED:", row);
          const id = row.id;

          const exists = rows.some(
            (item) => String(item.id) === String(id)
          );

          if (exists) {
            const edit = confirm(
              "این ID قبلاً وجود دارد. آیا می‌خواهید اطلاعات جدید جایگزین شود؟"
            );

            if (edit) {
              console.log("EDIT MODE:", row);
            }

            return;
          }

          const result = await createRow(
            selectedTable,
            row
          );

          console.log("CREATE RESULT:", result);

          refreshData();
        }}
      />
      <DataTable
        rows={rows}
        onSelectRow={setSelectedRow}
      />

      <RowDetails
        key={selectedRow?.id}
        row={selectedRow}
        tableName={selectedTable}
        onSaved={refreshData}
      />
    </div>
  </Layout>
);
}

export default App;