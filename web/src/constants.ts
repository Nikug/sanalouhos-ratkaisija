export const rows = Array.from({ length: 6 }, (_, i) => i);
export const columns = Array.from({ length: 5 }, (_, i) => i);
export const emptyGrid = () => Array.from({ length: rows.length * columns.length }, () => "");
export const allowedCharacters = "abcdefghijklmnopqrstuvwxyzåäö";
