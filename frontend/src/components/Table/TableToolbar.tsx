type Props = {
  onAddColumn: () => void;
  onRenameColumn: () => void;
  onDeleteColumn: () => void;
  search: string;
  onSearch: (value: string) => void;
  columns: {name: string; pk: number}[];
  selectedColumn: string;
  onSelectColumn: (name: string) => void;
  disabled: boolean;
};

function TableToolbar({onAddColumn, onRenameColumn, onDeleteColumn, search, onSearch,
  columns, selectedColumn, onSelectColumn, disabled}: Props) {
  return (
    <div style={{display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px"}}>
      <input aria-label="جستجو در رکوردها" placeholder="جستجو در همه ستون‌ها..."
        value={search} onChange={event => onSearch(event.target.value)} disabled={disabled} />
      <button title="فیلد جدید" onClick={onAddColumn} disabled={disabled}>➕ افزودن ستون</button>
      <select aria-label="انتخاب ستون" value={selectedColumn}
        onChange={event => onSelectColumn(event.target.value)} disabled={disabled}>
        <option value="">انتخاب ستون</option>
        {columns.filter(column => !column.pk && column.name.toLowerCase() !== "id").map(column => (
          <option key={column.name} value={column.name}>{column.name}</option>
        ))}
      </select>
      <button title="ویرایش فیلد" onClick={onRenameColumn} disabled={disabled || !selectedColumn}>✏️ تغییر نام ستون</button>
      <button title="حذف فیلد" onClick={onDeleteColumn} disabled={disabled || !selectedColumn}>🗑️ حذف ستون</button>
    </div>
  );
}
export default TableToolbar;
