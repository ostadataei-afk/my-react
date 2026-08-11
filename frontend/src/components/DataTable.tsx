type Row = {
  [key: string]: string | number | null;
};


type Props = {
  rows: Row[];
};


function DataTable({ rows }: Props) {


  if (rows.length === 0) {
    return <p>داده‌ای وجود ندارد</p>;
  }


  const columns = Object.keys(rows[0]);


  return (
    <table border={1}>
      <thead>
        <tr>
          {
            columns.map((column) => (
              <th key={column}>
                {column}
              </th>
            ))
          }
        </tr>
      </thead>


      <tbody>
        {
          rows.map((row, index) => (
            <tr key={index}>
              {
                columns.map((column) => (
                  <td key={column}>
                    {row[column]}
                  </td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}


export default DataTable;