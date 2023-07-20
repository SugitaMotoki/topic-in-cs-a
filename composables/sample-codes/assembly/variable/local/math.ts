export const math = `\
CALC:
  declareLocal x int
  declareLocal y int
  setLocal y
  setLocal x
  getLocal x
  push 2
  mul
  print
  getLocal y
  push 2
  mul
  print
  return
MAIN:
  declareLocal x int
  declareLocal y int
  push 2
  push 3
  add
  setLocal x
  push 5
  push 6
  add
  setLocal y
  getLocal x
  getLocal y
  call CALC
`;
