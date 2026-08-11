type Column = {
  name: string;
};

type ColumnListProps = {
  columns: Column[];
};


function ColumnList({ columns }: ColumnListProps) {

  return (
    <div>

      <h3>Columns</h3>

      {
        columns.map((column) => (
          <p key={column.name}>
            {column.name}
          </p>
        ))
      }

    </div>
  );
}

export default ColumnList;