export const add = `\
MAIN:
  push 1
  set_local :a
  push 2
  set_local :b
  get_local :a
  get_local :b
  add
  set_local :c
  get_local :c
  print
`;
