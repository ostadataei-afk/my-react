import { useEffect, useState } from "react";

import DataTable from "./components/Table/DataTable";
import Layout from "./components/Layout/Layout";
import TabBar from "./components/Layout/TabBar";
import TableToolbar from "./components/Table/TableToolbar";
import DuplicateIdMessage from "./components/Forms/DuplicateIdMessage";
import CreateColumnForm from "./components/Forms/CreateColumnForm";
import { validateTableName } from "./utils/validators";
import {getTables,getData,getColumns,createTable,createRow,createColumn,updateRow,deleteRow} from "./api/api";

type Table = {name: string;};
type Row = {[key: string]: string | number | null;};

function App() {
const [selectedTable, setSelectedTable] = useState("");
const [tables, setTables] = useState<Table[]>([]);
const [rows, setRows] = useState<Row[]>([]);
const [duplicateId, setDuplicateId] = useState<string | number | null>(null);
const [duplicateRow, setDuplicateRow] = useState<Record<string, string> | null>(null);
const [showCreateTable, setShowCreateTable] = useState(false);
const [showColumnForm, setShowColumnForm] = useState(false);
const [newTableName, setNewTableName] = useState("");
const [columns, setColumns] = useState<{name:string}[]>([]);
const refreshData = async (tableName = selectedTable) => {
  if (!tableName) return;
  const data = await getData(tableName); setRows(data.results);};
  useEffect(() => {getTables().then((data) => {setTables(data.results);});}, []);
return (
  <Layout>
    <div>
          <TabBar
            tables={tables}
            activeTable={selectedTable}
            onSelect={(tableName) => {
              setSelectedTable(tableName);
              getData(tableName).then((data) => {setRows(data.results);});
              getColumns(tableName).then((data) => {setColumns(data.results);});
            }}
            onCreateTable={() => {setShowCreateTable(true);}}
          />
      <TableToolbar
        onAddColumn={() => { console.log("ADD COLUMN CLICK"); setShowColumnForm(true);}}
      />
      {showCreateTable && (
        <div>
          <input
            placeholder="نام جدول"
            value={newTableName}
            onChange={(event) => {
              setNewTableName(event.target.value);
            }}
          />
          <button
            onClick={async () => {const error = validateTableName(newTableName,tables);
              if (error) {alert(error);return;}
              const result = await createTable(newTableName);
              console.log("CREATE TABLE RESULT:", result);
              if (result.success) {const data = await getTables();
                setTables(data.results);
                setNewTableName("");
                setShowCreateTable(false);
              }
            }}
          >ایجاد</button>
          <button
            onClick={() => {
              setNewTableName("");
              setShowCreateTable(false);
            }}
          >انصراف</button>
        </div>
      )}
            {showColumnForm && selectedTable && (
        <CreateColumnForm
          tableName={selectedTable}
        onSave={async (columnName, columnType) => {
          const name = columnName.trim();
          if (!name) {alert("نام ستون خالی است");return;}
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            alert("نام ستون فقط شامل حروف انگلیسی، عدد و _ باشد");return;}
          if (name.toLowerCase() === "id") {alert("ستون id از قبل وجود دارد");return;}
          const exists = columns.some(
            (column) => column.name.toLowerCase() === name.toLowerCase());
          if (exists) {alert("این ستون قبلاً وجود دارد");return;}
          const allowedTypes = ["TEXT","INTEGER","REAL"];
          if (!allowedTypes.includes(columnType)) {alert("نوع ستون نامعتبر است");return;}
          const result = await createColumn(selectedTable,name,columnType);
          if (!result.success) {alert(result.error || "خطا در ساخت ستون");return;}
          const data = await getColumns(selectedTable);
            setColumns(data.results);
            refreshData();
            setShowColumnForm(false);
        }}
           onCancel={() => {setShowColumnForm(false);}}
        />
      )}
      {duplicateId !== null && (
        <DuplicateIdMessage
          id={duplicateId}
          onConfirm={async () => {
            if (duplicateId === null || duplicateRow === null) return;
            await updateRow(selectedTable,duplicateId,duplicateRow);
            setDuplicateId(null);
            setDuplicateRow(null);
            refreshData();
          }}
          onCancel={() => {setDuplicateId(null);setDuplicateRow(null);}}
        />
      )}
        <DataTable
          columns={columns}
          rows={rows}
          onCreateRow={async (row) => {
          const id = row.id;
            if (id === undefined || id === null || String(id).trim() === "") {alert("شناسه id الزامی است");return;}
          const exists = rows.some((item) => String(item.id) === String(id));
          if (exists) {setDuplicateId(id);setDuplicateRow(row);return;}
          await createRow(selectedTable,row);         
          refreshData();
        }}
          onUpdateRow={async (row) => {
            const id = row.id;
            if (id === undefined || id === null) return;
            await updateRow(selectedTable,id,row);           
            refreshData();
          }}
          onDeleteRow={async (row) => {
          const id = row.id;
          if (id === null || id === undefined) return;
          await deleteRow(selectedTable,id);        
          refreshData();
        }}
      />
    </div>
  </Layout>
);}
export default App;