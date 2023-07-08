export const source02 = `
push 1
set_global i
push 9
start_for I
  push 1
  set_global j
  push 9
  start_for J
    get_global i
    get_global j
    mul
    print
    get_global j
    push 1
    add
    set_global j
  end_for J
  get_global i
  push 1
  add
  set_global i
end_for I
`;
