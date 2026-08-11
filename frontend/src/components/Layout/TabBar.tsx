type Props = {
  tables: {
    name: string;
  }[];
  activeTable: string;
  onSelect: (name: string) => void;
};

function TabBar({
  tables,
  activeTable,
  onSelect,
}: Props) {
  return (
    <div>
      {tables.map((table) => (
        <button
          key={table.name}
          onClick={() => onSelect(table.name)}
        >
          {table.name}
        </button>
      ))}
    </div>
  );
}

export default TabBar;