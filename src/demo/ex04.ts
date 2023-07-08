export const source04 = `
PRINTER:
        # i++
        get_global i
        push 1
        add
        set_global i

        # i == max ?
        get_global i
        get_global max
        equal

        # i < maxならばPRINTERを再帰呼出し
        jump_if .L1
        call PRINTER
.L1:
        # i = maxで終了
        return
MAIN:
        # i = 0
        push 0
        set_global i

        # max = 5
        push 5
        set_global max

        # max回PRINTERを再帰呼出し
        call PRINTER

        # iを表示して終了
        get_global i
        print
        return
`;
