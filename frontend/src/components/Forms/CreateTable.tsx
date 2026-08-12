import { useState } from "react";

type Props = {
  existingTables: string[];
  onCreate: (name: string) => Promise<void>;
  onCancel: () => void;
};

const reservedWords = [
  "table",
  "select",
  "where",
  "index",
  "order",
  "group",
  "user",
];

function CreateTable({existingTables,onCreate,onCancel,}: Props) 
{
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const validate = () => {
  const value = name.trim();
  if (!value) {
      return "نام جدول نمی‌تواند خالی باشد";
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      return "نام جدول فقط می‌تواند شامل حروف، عدد و _ باشد";
  }
    if (reservedWords.includes(value.toLowerCase())) 
      {return "این نام توسط SQLite رزرو شده است";
    }
    if (
      existingTables.some(
        table =>
          table.toLowerCase() === value.toLowerCase()
      )
    ) {return "این جدول قبلاً وجود دارد";}
    return "";
  };
  const submit = async () => {
  const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    await onCreate(name.trim());
    setName("");
  };
  return (
    <div>
      <h3>جدول جدید </h3>
      <input
        value={name}
        placeholder="نام جدول"
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />
      {error && (<p>{error}</p>)}
      <button onClick={submit}>ایجاد</button>
      <button onClick={onCancel}>انصراف</button>
    </div>
  );
}
export default CreateTable;