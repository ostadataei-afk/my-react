type Props = {
  onAddColumn: () => void;
};

function TableToolbar({ onAddColumn }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        marginTop: "12px",
      }}
    >
      <input
        placeholder="🔍 جستجو..."
        style={{
          flex: 1,
          height: "36px",
          padding: "0 12px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          color: "#000",
        }}
      />
      <button
        title="فیلد جدید"
        onClick={onAddColumn}
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
        title="ویرایش فیلد"
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
        title="حذف فیلد"
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
  );
}


export default TableToolbar;