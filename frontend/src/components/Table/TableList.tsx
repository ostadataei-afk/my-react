type Table = {
  name: string;
};

type TableListProps = {
  tables: Table[];
  onSelectTable: (tableName: string) => void;
};


function TableList({ tables, onSelectTable }: TableListProps) {


  return (
    <div>


      {
        tables.map((table) => (
          <p
            key={table.name}
            onClick={() => onSelectTable(table.name)}
            style={{ cursor: "pointer" }}
          >
            {table.name}
          </p>
        ))
      }


    </div>
  );
}


export default TableList;