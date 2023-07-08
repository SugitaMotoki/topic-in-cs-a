export const source06 = `
INCREMENT:
        push 1
        add
        return
MAIN:
        push 0
        call INCREMENT
        print
        push 100
        call INCREMENT
        call INCREMENT
        print
        return
`;
