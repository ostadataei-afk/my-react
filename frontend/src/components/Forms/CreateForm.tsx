import { useState } from "react";
import { createRow } from "../../api/api";

type Column = {
  name: string;
};

type Props = {
  tableName: string;
  columns: Column[];
  onSaved: () => void;
};

function CreateForm({
  tableName,
  columns,
  onSaved
}: Props) {

  const [formData, setFormData] = useState<Record<string, string>>({});

  // تغییر مقدار فیلدها
  const handleChange = (
    key: string,
    value: string
  ) => {

    setFormData({
      ...formData,
      [key]: value,
    });

  };

  // ذخیره رکورد جدید
  const save = async () => {

    const result = await createRow(
      tableName,
      formData
    );

    console.log("CREATE RESULT:", result);

    onSaved();

    setFormData({});

  };

  return (
    <div>

      <h3>رکورد جدید</h3>

      {
        columns
          .filter(column => column.name !== "id")
          .map(column => (

            <div key={column.name}>

              <label>
                {column.name}
              </label>

              <input
                value={formData[column.name] ?? ""}
                onChange={(e) =>
                  handleChange(
                    column.name,
                    e.target.value
                  )
                }
              />

            </div>

          ))
      }

      <button onClick={save}>
        ایجاد
      </button>

    </div>
  );
}

export default CreateForm;