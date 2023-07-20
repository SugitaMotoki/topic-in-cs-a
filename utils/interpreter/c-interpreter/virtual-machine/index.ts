import { CDataStructure, CVariable, Instruction, Variable } from "../types";
export { instructionMethodIdMap } from "../id-map";

/* eslint max-lines: "off" */
export class VirtualMachine {
  /** スタック */
  private stack: Variable[] = [];

  /** メモリ */
  private memory: CDataStructure[] = [];

  /** プログラムカウンタ */
  private pc = 0;

  /** グローバル変数 */
  private globalVariableMap = new Map<number, number>();

  /** 出力 */
  private output: string[] = [];

  /** VMの初期化 */
  private initialize() {
    this.stack = [];
    this.memory = [];
    this.pc = 0;
    this.output = [];
  }

  /**
   * VMの実行
   * @param {Instruction[]} instructions アセンブリ命令列
   * @returns {string[]} 出力
   */
  public execute(instructions: Instruction[]): string[] {
    this.initialize();
    while (this.pc < instructions.length) {
      const instruction = instructions[this.pc]!;
      this.methods[instruction.methodId]!(instruction.argments);
      this.pc++;
    }
    return this.output;
  }

  /**
   * ### No.0: `print`
   * - スタックの先頭を出力する
   */
  private _print = () => {
    const value = this._pop();
    this.output.push(String(value));
  };

  /**
   * ### No.01: `pop`
   * - スタックから値を取り出す
   */
  private _pop = () => {
    const value = this.stack.pop();
    if (typeof value === "undefined") {
      throw new Error("stack underflow");
    }
    return value;
  };

  /**
   * ### No.02: `push`
   * - スタックに値を積む
   * @param {Variable[]} arg - 引数
   */
  private _push = (arg: Variable[]) => {
    this.stack.push(arg[0]!);
  };

  /**
   * ### No.03: `add`
   * - スタックの先頭2つの値を足し算する
   * - b + a
   */
  private _add = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b + a);
  };

  /**
   * ### No.04: `sub`
   * - スタックの先頭2つの値を引き算する
   * - b - a
   */
  private _sub = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b - a);
  };

  /**
   * ### No.05: `mul`
   * - スタックの先頭2つの値を掛け算する
   * - b * a
   */
  private _mul = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b * a);
  };

  /**
   * ### No.06: `div`
   * - スタックの先頭2つの値を割り算する
   * - 0除算の場合はエラー
   * - b / a
   */
  private _div = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    if (a === 0) {
      throw new Error("zero division");
    }
    this.stack.push(b / a);
  };

  /**
   * ### No.07: `mod`
   * - スタックの先頭2つの値を割り算した余りを求める
   * - 0除算の場合はエラー
   */
  private _mod = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    if (a === 0) {
      throw new Error("zero division");
    }
    this.stack.push(b % a);
  };

  /**
   * ### No.08: `eq`
   * - スタックの先頭2つの値が等しければ1を、そうでなければ0をスタックに積む
   * - b === a
   */
  private _eq = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a === b ? 1 : 0);
  };

  /**
   * ### No.09: `ne`
   * - スタックの先頭2つの値が等しくなければ1を、そうでなければ0をスタックに積む
   * - b !== a
   */
  private _ne = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a !== b ? 1 : 0);
  };

  /**
   * ### No.10: `gt`
   * - スタックの2番目の値が先頭の値より大きければ1を、そうでなければ0をスタックに積む
   * - b > a
   */
  private _gt = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b > a ? 1 : 0);
  };

  /**
   * ### No.11: `ge`
   * - スタックの2番目の値が先頭の値以上であれば1を、そうでなければ0をスタックに積む
   * - b >= a
   */
  private _ge = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b >= a ? 1 : 0);
  };

  /**
   * ### No.12: `lt`
   * - スタックの2番目の値が先頭の値より小さければ1を、そうでなければ0をスタックに積む
   * - b > a
   */
  private _lt = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b < a ? 1 : 0);
  };

  /**
   * ### No.13: `le`
   * - スタックの2番目の値が先頭の値以下であれば1を、そうでなければ0をスタックに積む
   * - b >= a
   */
  private _le = () => {
    const a = this._pop() as number;
    const b = this._pop() as number;
    this.stack.push(b <= a ? 1 : 0);
  };

  /**
   * ### No.14: `increment`
   * - スタックの先頭の値をインクリメントする
   * - value++
   */
  private _increment = () => {
    const value = this._pop() as number;
    this.stack.push(value + 1);
  };

  /**
   * ### No.15: `decrement`
   * - スタックの先頭の値をデクリメントする
   * - value--
   */
  private _decrement = () => {
    const value = this._pop() as number;
    this.stack.push(value - 1);
  };

  /**
   * ### No.16: `jump`
   * - プログラムカウンタを指定された値に変更する
   */
  private _jump = (arg: Variable[]) => {
    const newPc = arg[0] as number;
    this.pc = newPc - 1;
  };

  /**
   * ### No.17: `jumpIf`
   * - スタックの先頭の値が正（0以外）ならばプログラムカウンタを指定された値に変更する
   */
  private _jumpIf = (arg: Variable[]) => {
    const newPc = arg[0] as number;
    const value = this._pop() as number;
    if (value !== 0) {
      this.pc = newPc - 1;
    }
  };

  /**
   * ### No.18: `declareGlobal`
   * - グローバル変数を宣言する
   * @param {Variable[]} arg - 引数
   */
  private _declareGlobal = (arg: Variable[]) => {
    const variableId = arg[0] as number;
    const cTypeId = arg[1] as number;
    const address = this.memory.length;
    this.memory.push({ cType: cTypeId, value: null });
    this.globalVariableMap.set(variableId, address);
  };

  /**
   * ### No.19: `setGlobal`
   * - グローバル変数に値を代入する
   * @param {Variable[]} arg - 引数
   */
  private _setGlobal = (arg: Variable[]) => {
    const variableId = arg[0] as number;
    const value = this._pop() as number;
    const address = this.globalVariableMap.get(variableId)!;
    const data = this.memory[address]! as CVariable;
    this.memory[address] = { cType: data.cType, value };
  };

  /**
   * ### No.20: `getGlobal`
   * - グローバル変数の値をスタックに積む
   * @param {Variable[]} arg - 引数
   */
  private _getGlobal = (arg: Variable[]) => {
    const variableId = arg[0] as number;
    const address = this.globalVariableMap.get(variableId)!;
    const data = this.memory[address]! as CVariable;
    if (data.value === null) {
      throw new Error("not initialized");
    }
    this.stack.push(data.value);
  };

  /**
   * 命令の実行メソッド
   * 配列のインデックスが命令IDに対応している
   */
  private methods = [
    /* No.00 */ this._print,
    /* No.01 */ this._pop,
    /* No.02 */ this._push,
    /* No.03 */ this._add,
    /* No.04 */ this._sub,
    /* No.05 */ this._mul,
    /* No.06 */ this._div,
    /* No.07 */ this._mod,
    /* No.08 */ this._eq,
    /* No.09 */ this._ne,
    /* No.10 */ this._gt,
    /* No.11 */ this._ge,
    /* No.12 */ this._lt,
    /* No.13 */ this._le,
    /* No.14 */ this._increment,
    /* No.15 */ this._decrement,
    /* No.16 */ this._jump,
    /* No.17 */ this._jumpIf,
    /* No.18 */ this._declareGlobal,
    /* No.19 */ this._setGlobal,
    /* No.20 */ this._getGlobal,
  ];
}
