export const source03 = `
MAIN:
        push 0
        set_global i
        push 10
        set_global length
        get_global length
        define_array a
.L1:
        get_global i
        get_global length
        equal
        jump_if .L2
        get_global i
        get_global i
        mul
        get_global i
        set_array a
        get_global i
        push 1
        add
        set_global i
        jump .L1
.L2:
        push 0
        set_global i
.L3:
        get_global i
        get_global length
        equal
        jump_if END
        get_global length
        push 1
        sub
        get_global i
        sub
        get_array a
        print
        get_global i
        push 1
        add
        set_global i
        jump .L3
END:
`;

/*
 *
 *#include <stdio.h>
 *int main(void)
 *{
 *    int i;
 *    int a[10];
 *    for (i = 0; i < 10; i++) {
 *      a[i] = i * i;
 *    }
 *    for (i = 0; i < 10; i++) {
 *      printf("%d\n", a[9 - i]);
 *    }
 *    return 0;
 *}
 *
 */
