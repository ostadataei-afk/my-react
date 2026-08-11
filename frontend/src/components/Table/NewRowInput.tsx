import { useRef, useState } from "react";

type Column = {
  name: string;
};

type Props = {
  columns: Column[];
  onSave: (row: Record<string, string>) => Promise<void>;
};

function NewRowInput({ columns, onSave }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const savingRef = useRef(false);

  const handleChange = (columnName: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const nextInput = inputRefs.current[index + 1];

    if (nextInput) {
      nextInput.focus();
      return;
    }

    if (savingRef.current) return;

    savingRef.current = true;

    const row = {
      ...values,
      [columns[index].name]: event.currentTarget.value,
    };

    try {
      await onSave(row);

      setValues({});
      inputRefs.current[0]?.focus();
    } finally {
      savingRef.current = false;
    }
  };

  return (
    <div>
      {columns.map((column, index) => (
        <input
          key={column.name}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          value={values[column.name] ?? ""}
          placeholder={column.name}
          onChange={(event) =>
            handleChange(column.name, event.target.value)
          }
          onKeyDown={(event) => handleKeyDown(event, index)}
        />
      ))}
    </div>
  );
}

export default NewRowInput;