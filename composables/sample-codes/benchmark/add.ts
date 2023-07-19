export const c = `\
#include <stdio.h>
int main(void)
{
    int a = 1;
    int b = 2;
    int c = a + b;
    printf("%d\\n", c);
    return 0;
};
`;

export const assembly = `\
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
