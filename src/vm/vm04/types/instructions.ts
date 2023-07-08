/**
 * VM04の命令一覧
 */
export const Instruction = {
  // 基本機能
  pop: "pop",
  push: "push",
  // 演算
  add: "add",
  sub: "sub",
  mul: "mul",
  div: "div",
  mod: "mod",
  eq: "eq", // ==
  ne: "ne", // !=
  ge: "ge", // >=
  gt: "gt", // >
  le: "le", // <=
  lt: "lt", // <
  inc: "inc", // ++
  dec: "dec", // --
  // 変数
  setLocal: "set_local",
  getLocal: "get_local",
  setGlobal: "set_global",
  getGlobal: "get_global",
  defineArray: "define_array",
  setArray: "set_array",
  getArray: "get_array",
  // ジャンプ
  jump: "jump",
  jumpIf: "jump_if",
  jumpIfZero: "jump_if_zero",
  // 関数
  call: "call",
  return: "return",
  // その他
  print: "print",
  debugShowStack: "debug_show_stack",
};
