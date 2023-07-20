import { Value, Argment, Instruction, FunctionObject, Address } from "../types";
import { CDataStructure, CVariable, CArray } from "../specifications";
export { instructionMethodIdMap } from "../id-map";

/* eslint max-lines: "off" */
export class VirtualMachine {
  /** スタック */
  private stack: Value[] = [];

  /** メモリ */
  private memory: CDataStructure[] = [];

  /** プログラムカウンタ */
  private pc = 0;

  /** グローバル変数 */
  private globalVariableMap = new Map<number, number>();

  /** 関数 */
  private functionStack: FunctionObject[] = [];

  /** 出力 */
  private output: string[] = [];

  /** VMの初期化 */
  private initialize() {
    this.stack = [];
    this.memory = [];
    this.pc = 0;
    this.output = [];
    this.functionStack = [];
  }

  /**
   * VMの実行
   * @param {Instruction[]} instructions アセンブリ命令列
   * @returns {string[]} 出力
   */
  public execute(
    instructions: Instruction[],
    pcOfMainFunction: number,
  ): string[] {
    // 領域の初期化
    this.initialize();

    // MAIN関数をセット
    this.functionStack.push({
      functionId: pcOfMainFunction,
      returnAddress: instructions.length,
      localVariableMap: new Map<number, number>(),
    });

    // プログラムカウンタをMAIN関数の先頭にセット
    this.pc = pcOfMainFunction;

    // 命令の実行
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
   * @param {Argment[]} arg - 引数
   */
  private _push = (arg: Argment[]) => {
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
  private _jump = (arg: Argment[]) => {
    const newPc = arg[0] as number;
    this.pc = newPc - 1;
  };

  /**
   * ### No.17: `jumpIf`
   * - スタックの先頭の値が正（0以外）ならばプログラムカウンタを指定された値に変更する
   */
  private _jumpIf = (arg: Argment[]) => {
    const newPc = arg[0] as number;
    const value = this._pop() as number;
    if (value !== 0) {
      this.pc = newPc - 1;
    }
  };

  /**
   * ### No.18: `declareGlobal`
   * - グローバル変数を宣言する
   * @param {Argment[]} arg - 引数
   */
  private _declareGlobal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const cTypeId = arg[2] as number;
    const address: Address = this.memory.length;
    switch (dataStructureId) {
      case 0: // CVariable
        this.memory.push(new CVariable(cTypeId));
        break;
      case 1: // CArray
        this.memory.push(new CArray(cTypeId, arg[3] as number));
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
    this.globalVariableMap.set(variableId, address);
  };

  private setCVariable = (address: Address, value: number) => {
    const cVariable = this.memory[address]! as CVariable;
    cVariable.setValue(value);
  };

  private setCArray = (address: Address, index: number, value: number) => {
    const cArray = this.memory[address]! as CArray;
    const cVariable = cArray.values[index]! as CVariable;
    cVariable.setValue(value);
  };

  /**
   * ### No.19: `setGlobal`
   * - グローバル変数に値を代入する
   * @param {Argment[]} arg - 引数
   */
  private _setGlobal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const value = this._pop() as number;
    const address = this.globalVariableMap.get(variableId)!;
    switch (dataStructureId) {
      case 0: // CVariable
        this.setCVariable(address, value);
        break;
      case 1: // CArray
        this.setCArray(address, arg[2] as number, value);
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
  };

  private getCVariable = (address: Address) => {
    const cVariable = this.memory[address]! as CVariable;
    this.stack.push(cVariable.value!);
  };

  private getCArray = (address: Address, index: number) => {
    const cArray = this.memory[address]! as CArray;
    const cVariable = cArray.values[index]! as CVariable;
    this.stack.push(cVariable.value!);
  };

  /**
   * ### No.20: `getGlobal`
   * - グローバル変数の値をスタックに積む
   * @param {Argment[]} arg - 引数
   */
  private _getGlobal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const address = this.globalVariableMap.get(variableId)!;
    switch (dataStructureId) {
      case 0: // CVariable
        this.getCVariable(address);
        break;
      case 1: // CArray
        this.getCArray(address, arg[2] as number);
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
  };

  /**
   * ### No.21: `declareLocal`
   * - ローカル変数を宣言する
   * @param {Argment[]} arg - 引数
   */
  private _declareLocal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const cTypeId = arg[2] as number;
    const address = this.memory.length;
    const currentFunction = this.functionStack[this.functionStack.length - 1]!;
    switch (dataStructureId) {
      case 0: // CVariable
        this.memory.push(new CVariable(cTypeId));
        break;
      case 1: // CArray
        this.memory.push(new CArray(cTypeId, arg[3] as number));
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
    currentFunction.localVariableMap.set(variableId, address);
  };

  /**
   * ### No.22: `setLocal`
   * - ローカル変数に値を代入する
   * @param {Argment[]} arg - 引数
   */
  private _setLocal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const value = this._pop() as number;
    const currentFunction = this.functionStack[this.functionStack.length - 1]!;
    const address = currentFunction.localVariableMap.get(variableId)!;
    switch (dataStructureId) {
      case 0: // CVariable
        this.setCVariable(address, value);
        break;
      case 1: // CArray
        this.setCArray(address, arg[2] as number, value);
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
  };

  /**
   * ### No.23: `getLocal`
   * - ローカル変数の値をスタックに積む
   * @param {Argment[]} arg - 引数
   */
  private _getLocal = (arg: Argment[]) => {
    const dataStructureId = arg[0] as number;
    const variableId = arg[1] as number;
    const currentFunction = this.functionStack[this.functionStack.length - 1]!;
    const address = currentFunction.localVariableMap.get(variableId)!;
    switch (dataStructureId) {
      case 0: // CVariable
        this.getCVariable(address);
        break;
      case 1: // CArray
        this.getCArray(address, arg[2] as number);
        break;
      default:
        throw new Error(`Invalid data structure id: ${dataStructureId}`);
    }
  };

  /**
   * ### No.24: `call`
   * - 関数を呼び出す
   * @param {Argment[]} arg - 引数
   */
  private _call = (arg: Argment[]) => {
    const functionId = arg[0] as number;
    this.functionStack.push({
      functionId,
      returnAddress: this.pc + 1,
      localVariableMap: new Map<number, number>(),
    });
    this._jump([functionId]);
  };

  /**
   * ### No.25: `return`
   * - 関数から戻る
   */
  private _return = () => {
    const currentFunction = this.functionStack.pop()!;
    if (!currentFunction) {
      throw new Error("function stack underflow");
    }
    this._jump([currentFunction.returnAddress]);
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
    /* No.21 */ this._declareLocal,
    /* No.22 */ this._setLocal,
    /* No.23 */ this._getLocal,
    /* No.24 */ this._call,
    /* No.25 */ this._return,
  ];
}
