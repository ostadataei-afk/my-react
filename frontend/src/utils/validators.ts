type Table = {
  name: string;
};


export function validateTableName(
  name: string,
  tables: Table[]
): string | null {

  if (!name.trim()) {
    return "نام جدول خالی است";
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return "نام جدول فقط باید شامل حروف انگلیسی، عدد و _ باشد";
  }

  const exists = tables.some(
    (table) =>
      table.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    return "این نام جدول قبلاً وجود دارد";
  }

  return null;
}
