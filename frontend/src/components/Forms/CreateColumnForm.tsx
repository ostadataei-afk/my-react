import { useState } from "react";
type Props = {
  tableName: string;
  onSave: (columnName: string, columnType: string) => Promise<void>;
  onCancel: () => void;
};


function CreateColumnForm({
  tableName,
  onSave,
  onCancel,
}: Props) {

  const [columnName, setColumnName] = useState("");
  const [columnType, setColumnType] = useState("TEXT");

  const save = async () => {
    if (!columnName.trim()) {alert("نام ستون خالی است"); return;}

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      alert("نام ستون فقط شامل حروف انگلیسی، عدد و _ باشد");
      return;
    }
    await onSave(columnName,columnType);
    setColumnName("");
  };
  return (
    <div>
      <h3>افزودن ستون به {tableName}</h3>
      <input
        placeholder="نام ستون"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)
        }
      />
      <select
        value={columnType}
        onChange={(e) => setColumnType(e.target.value)
        }
      >
        <option value="TEXT">TEXT</option>
        <option value="INTEGER">INTEGER</option>
        <option value="REAL">REAL</option>
      </select>
      <button onClick={save}>ایجاد</button>
      <button onClick={onCancel}>انصراف</button>
    </div>
  );
}
export default CreateColumnForm;