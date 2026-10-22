import { useEffect, useRef, useState } from "react";
import DataTable from "./components/Table/DataTable";
import Layout from "./components/Layout/Layout";
import TabBar from "./components/Layout/TabBar";
import TableToolbar from "./components/Table/TableToolbar";
import DuplicateIdMessage from "./components/Forms/DuplicateIdMessage";
import CreateColumnForm from "./components/Forms/CreateColumnForm";
import { validateTableName } from "./utils/validators";
import * as api from "./api/api";

type Table = {name: string};
type Column = {name: string; pk: number};
type Row = Record<string, string | number | null>;
type Rename = {kind: "table" | "column"; original: string; name: string};

function App() {
  const [selectedTable, setSelectedTable] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [search, setSearch] = useState("");
  const [duplicateRow, setDuplicateRow] = useState<Record<string, string> | null>(null);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [rename, setRename] = useState<Rename | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  // Serialize actions so a late response cannot overwrite a different selection.
  async function perform(action: () => Promise<void>): Promise<boolean> {
    if (pending.current) return false;
    pending.current = true; setBusy(true); setError("");
    try { await action(); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "عملیات انجام نشد"); return false; }
    finally { pending.current = false; setBusy(false); }
  }

  useEffect(() => {
    let active = true;
    api.getTables().then(data => { if (active) setTables(data.results); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "خطا در دریافت جدول‌ها"); });
    return () => { active = false; };
  }, []);

  async function refresh(table: string) {
    const [data, schema] = await Promise.all([api.getData(table), api.getColumns(table)]);
    setRows(data.results); setColumns(schema.results);
  }

  function resetSelection() {
    setSelectedColumn(""); setSearch(""); setDuplicateRow(null);
    setRename(null); setShowColumnForm(false);
  }

  const query = search.trim().toLocaleLowerCase();
  const visibleRows = rows.filter(row => Object.values(row).some(value =>
    String(value ?? "").toLocaleLowerCase().includes(query)));

  return (
    <Layout>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">در حال انجام عملیات…</p>}
      <fieldset disabled={busy} style={{border: 0, padding: 0, margin: 0, minWidth: 0}}>
        <TabBar tables={tables} activeTable={selectedTable} disabled={busy}
          onSelect={table => { void perform(async () => {
            await refresh(table); setSelectedTable(table); resetSelection();
          }); }}
          onCreateTable={() => {setRename(null); setShowCreateTable(true);}}
          onRenameTable={() => {setShowCreateTable(false); setShowColumnForm(false);
            setRename({kind: "table", original: selectedTable, name: selectedTable});}}
          onDeleteTable={() => {
            if (!window.confirm(`جدول «${selectedTable}» و تمام اطلاعات آن برای همیشه حذف شوند؟ این عملیات قابل بازگشت نیست.`)) return;
            void perform(async () => {
              await api.deleteTable(selectedTable);
              setTables(current => current.filter(table => table.name !== selectedTable));
              setSelectedTable(""); setRows([]); setColumns([]); resetSelection();
              setTables((await api.getTables()).results);
            });
          }} />
        <TableToolbar search={search} onSearch={setSearch} columns={columns}
          selectedColumn={selectedColumn} onSelectColumn={setSelectedColumn}
          disabled={busy || !selectedTable}
          onAddColumn={() => {setRename(null); setShowColumnForm(true);}}
          onRenameColumn={() => {setShowColumnForm(false);
            setRename({kind: "column", original: selectedColumn, name: selectedColumn});}}
          onDeleteColumn={() => {
            if (!window.confirm(`ستون «${selectedColumn}» از جدول «${selectedTable}» و تمام مقادیر آن برای همیشه حذف شوند؟ این عملیات قابل بازگشت نیست.`)) return;
            void perform(async () => {
              await api.deleteColumn(selectedTable, selectedColumn);
              setSelectedColumn(""); setDuplicateRow(null); setRename(null);
              await refresh(selectedTable);
            });
          }} />
        {rename && <form onSubmit={event => {
          event.preventDefault(); void perform(async () => {
            const name = rename.name.trim();
            if (name === rename.original) {setRename(null); return;}
            const validation = validateTableName(name, rename.kind === "table" ? tables : columns);
            if (validation) throw new Error(validation);
            if (rename.kind === "table") {
              await api.renameTable(selectedTable, name);
              setSelectedTable(name);
              setTables(current => current.map(table => table.name === selectedTable ? {name} : table));
              resetSelection(); await refresh(name);
            } else {
              if (name.toLowerCase() === "id") throw new Error("نام id برای کلید اصلی رزرو شده است");
              await api.renameColumn(selectedTable, rename.original, name);
              setSelectedColumn(name); setDuplicateRow(null); setRename(null);
              await refresh(selectedTable);
            }
          });
        }}>
          <label>نام جدید {rename.kind === "table" ? "جدول" : "ستون"}
            <input autoFocus value={rename.name} onChange={event => setRename({...rename, name: event.target.value})} />
          </label>
          <button type="submit">ذخیره نام</button>
          <button type="button" onClick={() => setRename(null)}>انصراف</button>
        </form>}
        {showCreateTable && <form onSubmit={event => {
          event.preventDefault(); void perform(async () => {
            const name = newTableName.trim();
            const validation = validateTableName(name, tables);
            if (validation) throw new Error(validation);
            await api.createTable(name); setTables((await api.getTables()).results);
            setNewTableName(""); setShowCreateTable(false);
          });
        }}>
          <input aria-label="نام جدول" placeholder="نام جدول" value={newTableName} onChange={event => setNewTableName(event.target.value)} />
          <button type="submit">ایجاد</button>
          <button type="button" onClick={() => {setNewTableName(""); setShowCreateTable(false);}}>انصراف</button>
        </form>}
        {showColumnForm && selectedTable && <CreateColumnForm tableName={selectedTable}
          onSave={async (columnName, columnType) => {
            await perform(async () => {
              const name = columnName.trim();
              const validation = validateTableName(name, columns);
              if (validation) throw new Error(validation);
              if (name.toLowerCase() === "id") throw new Error("ستون id از قبل وجود دارد");
              await api.createColumn(selectedTable, name, columnType);
              await refresh(selectedTable); setShowColumnForm(false);
            });
          }} onCancel={() => setShowColumnForm(false)} />}
        {duplicateRow && <DuplicateIdMessage id={duplicateRow.id}
          onConfirm={async () => { await perform(async () => {
            await api.updateRow(selectedTable, duplicateRow.id, duplicateRow);
            setDuplicateRow(null); await refresh(selectedTable);
          }); }} onCancel={() => setDuplicateRow(null)} />}
        {!selectedTable ? <p>یک جدول را انتخاب کنید.</p> : <>
          {query && <p role="status">{visibleRows.length} رکورد از {rows.length} رکورد</p>}
          {query && !visibleRows.length && <p>رکوردی پیدا نشد.</p>}
          <DataTable key={`${selectedTable}:${columns.map(column => column.name).join(",")}`}
            columns={columns} rows={visibleRows}
            onCreateRow={async row => {
              if (!row.id?.trim()) {setError("شناسه id الزامی است"); throw new Error("invalid id");}
              if (rows.some(item => String(item.id) === row.id)) {setDuplicateRow(row); return;}
              const ok = await perform(async () => {await api.createRow(selectedTable, row); await refresh(selectedTable);});
              if (!ok) throw new Error("save failed");
            }}
            onUpdateRow={async row => {
              const ok = await perform(async () => {await api.updateRow(selectedTable, row.id, row); await refresh(selectedTable);});
              if (!ok) throw new Error("save failed");
            }}
            onDeleteRow={row => {
              if (row.id == null || !window.confirm(`رکورد با شناسه «${row.id}» حذف شود؟`)) return;
              void perform(async () => {await api.deleteRow(selectedTable, row.id as string | number); await refresh(selectedTable);});
            }} />
        </>}
      </fieldset>
    </Layout>
  );
}
export default App;
