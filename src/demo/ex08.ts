const number = 30;

export const source08 = `
FIBONACCI:
        set_local n

        get_local n
        push 0
        eq
        jump_if .L3

        get_local n
        push 1
        eq
        jump_if .L4

        get_local n
        push 1
        sub
        call FIBONACCI
        get_local n
        push 2
        sub
        call FIBONACCI
        add
        return
.L3:
        push 0
        return
.L4:
        push 1
        return

MAIN:
        push 1
        set_local i
.L1:
        get_local i
        push ${number}
        gt
        jump_if .L2

        get_local i
        call FIBONACCI
        print

        get_local i
        inc
        set_local i
        jump .L1
.L2:
        return

`;
