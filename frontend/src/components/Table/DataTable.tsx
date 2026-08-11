type Row = {
  [key: string]: string | number | null;
};


type Props = {
  rows: Row[];
  onSelectRow: (row: Row) => void;
};


function DataTable({ rows, onSelectRow }: Props) {


  if (rows.length === 0) {
    return <p>داده‌ای وجود ندارد</p>;
  }


  const columns = Object.keys(rows[0]);


  return (
    <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >

        <thead>

          <tr>
            {
              columns.map((column) => (
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
              ))
            }
          </tr>

        </thead>


        <tbody>

          {
            rows.map((row, index) => (

              <tr
                key={index}
                onClick={() => onSelectRow(row)}
                style={{ cursor: "pointer" }}
                >

                {
                  columns.map((column) => (

                    <td
                      key={column}
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                      }}
                    >
                      {row[column] ?? "-"}
                    </td>

                  ))
                }

              </tr>

            ))
          }

        </tbody>

      </table>

    </div>
  );
}


export default DataTable;