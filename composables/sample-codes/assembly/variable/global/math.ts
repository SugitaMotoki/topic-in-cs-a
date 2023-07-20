export const math = `\
MAIN:
  declareGlobal x int
  declareGlobal y int
  push 2
  push 3
  add
  setGlobal x
  push 5
  push 6
  add
  setGlobal y
  getGlobal x
  getGlobal y
  mul
  print
`;
