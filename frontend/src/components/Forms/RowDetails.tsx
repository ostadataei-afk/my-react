import { useState } from "react";
import { updateRow, deleteRow } from "../../api/api";

type Row = {
  [key: string]: string | number | null;
};

type Props = {
  row: Row | null;
  tableName: string;
  onSaved: () => void;
};

function RowDetails({
  row,
  tableName,
  onSaved
}: Props) {

  const [editRow, setEditRow] = useState<Row | null>(row);

  if (!row) {
    return <p>یک رکورد انتخاب کنید</p>;
  }

  // تغییر مقدار یک فیلد در فرم ویرایش
  const handleChange = (
    key: string,
    value: string
  ) => {

    if (!editRow) return;

    setEditRow({
      ...editRow,
      [key]: value,
    });

  };

  // ذخیره تغییرات رکورد در دیتابیس
  const save = async () => {

    console.log("SAVING:", editRow);
    console.log("TABLE:", tableName);

    if (!editRow) return;

    if (editRow.id == null) {
      return;
    }

    const result = await updateRow(
      tableName,
      editRow.id,
      editRow
    );

    console.log("UPDATE RESULT:", result);

    onSaved();

  };

  // حذف رکورد انتخاب شده از دیتابیس
  const remove = async () => {

    if (!editRow) return;

    if (editRow.id == null) {
      return;
    }

    const confirmDelete = confirm(
      "آیا از حذف این رکورد مطمئن هستید؟"
    );

    if (!confirmDelete) {
      return;
    }

    const result = await deleteRow(
      tableName,
      editRow.id
    );

    console.log("DELETE RESULT:", result);

    onSaved();

  };

  return (
    <div>

      <h3>ویرایش رکورد</h3>

      {
        Object.keys(editRow ?? {}).map((key) => (

          key === "id" ? (

            <p key={key}>
              <b>{key}: </b>
              {editRow?.[key]}
            </p>

          ) : (

            <div key={key}>

              <label>
                {key}
              </label>

              <input
                value={String(editRow?.[key] ?? "")}
                onChange={(e) =>
                  handleChange(
                    key,
                    e.target.value
                  )
                }
              />

            </div>

          )

        ))
      }

      <button onClick={save}>
        ذخیره
      </button>

      <button onClick={remove}>
        حذف
      </button>

    </div>
  );
}

export default RowDetails;