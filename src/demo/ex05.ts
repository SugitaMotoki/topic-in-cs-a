export const source05 = `
ADD:
        set_local x
        set_local y
        get_local x
        get_local y
        add
        return
SUB:
        set_local x
        set_local y
        get_local x
        get_local y
        sub
        return
MAIN:
        push 3
        set_local x
        push 7
        set_local y

        get_local x
        get_local y
        call ADD
        print

        get_local y
        get_local x
        call SUB
        print
`;
