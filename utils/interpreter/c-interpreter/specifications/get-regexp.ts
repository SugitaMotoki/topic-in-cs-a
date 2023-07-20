/** Cの変数 */
const cVariable = /^[A-Za-z_]+\w*$/u;

/** Cの配列 */
const cArray = /^(?<name>[A-Za-z_]+\w*)\[(?<length>\d+)\]$/u;

/** Cのアドレス演算 */
const cAddress = /^&(?<name>[A-Za-z_]+\w*)$/u;

/** Cのポインタ */
const cPointer = /^\*(?<name>[A-Za-z_]+\w*)$/u;

/** Cの正規表現 */
export const regexp = {
  cVariable,
  cArray,
  cAddress,
  cPointer,
};
