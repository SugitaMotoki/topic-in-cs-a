export const nomalJump = `\
MAIN:
  push 0
  print
  jump .L1
  push 100
  push 200
  push 300
.L1:
  push 1
  print
`;
