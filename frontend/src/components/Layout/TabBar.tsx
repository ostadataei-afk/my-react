type Props = {tables: {name: string;}[];activeTable: string;
  onSelect: (name: string) => void;
  onCreateTable: () => void;
};

function TabBar({tables,activeTable,onSelect,onCreateTable,}: Props) 
{
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "6px",
          flex: 1,
        }}
      >
        {tables.map((table) => (
          <button
            key={table.name}
            onClick={() => onSelect(table.name)}
            style={{
              height: "36px",
              padding: "0 16px",
              borderRadius: "6px",
              border:
                activeTable === table.name
                  ? "2px solid #4a7cff"
                  : "1px solid #ddd",
              background:
                activeTable === table.name
                  ? "#eef4ff"
                  : "#fff",
              color: "#000",
              fontWeight:
                activeTable === table.name
                  ? "600"
                  : "400",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {table.name}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "6px",
          flexShrink: 0,
                  }}
      >
        <button
          title="جدول جدید"
          onClick={onCreateTable}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #ddd",
            background: "white",
            color: "#000",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >➕</button>

        <button
          title="تغییر نام جدول"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #ddd",
            background: "white",
            color: "#000",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >✏️</button>


        <button
          title="حذف جدول"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #ddd",
            background: "white",
            color: "#000",
            fontSize: "16px",
            cursor: "pointer",
}}
        >🗑️</button>
      </div>
    </div>
  );
}
export default TabBar;