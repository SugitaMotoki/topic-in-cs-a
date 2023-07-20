export const array = `\
MAIN:
  declareGlobal a[2] int
  push 3
  setGlobal a[0]
  push 5
  setGlobal a[1]
  getGlobal a[0]
  getGlobal a[1]
  add
  print
`;
