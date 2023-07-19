export const jumpif = `\
MAIN:
  push 0
  push 1
  push 2
  push 3
.L1:
  push 100
  print
  jumpIf .L1
`;
