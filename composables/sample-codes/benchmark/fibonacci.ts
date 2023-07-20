const number = 20;

export const assembly = `\
FIBONACCI:
        declareLocal n int
        setLocal n

        getLocal n
        push 0
        eq
        jumpIf .L3

        getLocal n
        push 1
        eq
        jumpIf .L4

        getLocal n
        push 1
        sub
        call FIBONACCI
        getLocal n
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
        declareLocal i int
        push 1
        setLocal i
.L1:
        getLocal i
        push ${number}
        gt
        jumpIf .L2

        getLocal i
        call FIBONACCI
        print

        getLocal i
        increment
        setLocal i
        jump .L1
.L2:
        return

`;
