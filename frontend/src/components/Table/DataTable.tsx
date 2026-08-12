import { useRef, useState } from "react";
type Row = {[key: string]: string | number | null;};
type Props = {columns: {name: string;}[]; rows: Row[];
  onDeleteRow: (row: Row) => void;
  onCreateRow: (row: Record<string,string>) => Promise<void>;
  onUpdateRow: (row: Record<string,string>) => Promise<void>;
};

function hasRowChanges(original: Row,current: Record<string, string>): boolean 
{
  return Object.keys(original).some((key) => {
    if (key === "id") return false;
    const oldValue = original[key] ?? "";
    const newValue = current[key] ?? "";
    return String(oldValue) !== String(newValue);
  });
}
function DataTable({columns,rows,onDeleteRow,onCreateRow,onUpdateRow,}: Props)
{
  const [newRow, setNewRow] = useState<Record<string, string>>({});
  const [originalRow, setOriginalRow] = useState<Row | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const editInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const savingRef = useRef(false);
  const columnNames = columns.map((column) => column.name);
  const handleChange = (column: string, value: string) => {setNewRow((prev) => ({...prev,[column]: value,})); };
  const startEdit = (row: Row) => {
    setEditingId(row.id ?? null);
    setOriginalRow(row);
    setEditValues(
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          value === null ? "" : String(value),
        ])
      )
    );
    setTimeout(() => {editInputRefs.current[1]?.focus();}, 0);
  };

const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const nextInput = inputRefs.current[index + 1];
    if (nextInput) {nextInput.focus();return; }
    if (savingRef.current) return;
    savingRef.current = true;
const row = {
    ...newRow,
    [columnNames[index]]: event.currentTarget.value,
  };
    try {
      await onCreateRow(row);
      setNewRow({});
      inputRefs.current[0]?.focus();
    } finally {
      savingRef.current = false;
    }
};
const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>,index: number) => 
  {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const nextInput = editInputRefs.current[index + 1];
    if (nextInput) {nextInput.focus(); }
  };
  
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{width: "100%",borderCollapse: "collapse", }}>
          <thead>
            <tr>
              {columnNames.map((column) => (
                <th
                  key={column}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    background: "#eee",
                  }}
                >
                  {column}
                </th>
              ))}
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  background: "#eee",
                }}
              >
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ردیف ایجاد رکورد جدید */}
            <tr>
              {columnNames.map((column, index) => (
                <td
                  key={column}
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                  }}
                >
                <input
                  ref={(element) => {inputRefs.current[index] = element; }}
                  value={newRow[column] ?? ""}
                  placeholder={column}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "30px",
                  }}
                  onChange={(event) => handleChange(column,event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                />
                </td>
              ))}
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                💾
              </td>
            </tr>
            {/* رکوردهای موجود */}
            {rows.map((row, index) => (
              <tr key={index}>{columnNames.map((column, columnIndex) => (
              <td
                key={column}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                }}
              >
                {
                  editingId === row.id ? (column === "id" ? (row[column] ?? "-") : (
                    <input
                      ref={(element) => {
                        editInputRefs.current[columnIndex] = element;
                      }}
                      value={editValues[column] ?? ""}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        height: "30px",
                      }}
                      onChange={(event) => {
                        setEditValues((prev) => ({
                          ...prev,
                          [column]: event.target.value,
                        }));
                      }}
                      onKeyDown={(event) =>
                        handleEditKeyDown(event, columnIndex)
                      }
                    />
                    )
                  ) : (
                    row[column] ?? "-"
                  )
                }
              </td>
            ))}
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {editingId === row.id ? (
                  <>
                    <button
                      onClick={async (event) => {event.stopPropagation();
                      if (originalRow && !hasRowChanges(originalRow, editValues)) {
                        setEditingId(null);
                        setEditValues({});
                        setOriginalRow(null);
                        return;
                      }
                      await onUpdateRow(editValues);
                      setEditingId(null);
                      setEditValues({});
                      setOriginalRow(null);
                      }}
                    >
                      💾
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingId(null);
                        setEditValues({});
                      }}
                    >
                      ❌
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        startEdit(row);        
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteRow(row);
                      }}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}
export default DataTable;