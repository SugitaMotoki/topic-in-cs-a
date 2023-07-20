export const array = `\
TWICE:
  declareLocal value int
  setLocal value
  getLocal value
  push 2
  mul
  return

MAIN:
  declareLocal array[2] int
  push 3
  setLocal array[0]
  push 4
  setLocal array[1]

  getLocal array[0]
  call TWICE
  call TWICE
  getLocal array[1]
  call TWICE
  add
  print
`;
