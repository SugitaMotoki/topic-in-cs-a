/** VMの命令セット */
export const instructionMethodIdMap = new Map<string, number>([
  ["print", 0],
  ["pop", 1],
  ["push", 2],
  ["add", 3],
  ["sub", 4],
  ["mul", 5],
  ["div", 6],
  ["mod", 7],
  ["eq", 8],
  ["ne", 9],
  ["gt", 10],
  ["ge", 11],
  ["lt", 12],
  ["le", 13],
  ["increment", 14],
  ["decrement", 15],
]);
