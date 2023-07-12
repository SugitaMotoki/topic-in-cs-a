/** ループを実現するためのVMの抽象クラス */
export abstract class LoopVirtualMachine {
  /** VMのスタック */
  private stack: number[] = [];

  /** 命令の行数 */
  protected line = 0;

  /** ラベル */
  protected label = new Map<string, number>();

  /** グローバル変数 */
  private global = new Map<string, number>();

  /** 出力するデータ */
  protected printData: string[] = [];

  /** スタックの状態を確認する */
  public _showStack = () => {
    console.log("=== show stack ===");
    console.log(this.stack);
    console.log("==================");
  };

  /** スタックから値を取り出す */
  protected _pop = () => {
    const value = this.stack.pop();
    if (value || value === 0) {
      return value;
    }
    throw new Error("Stack underflow");
  };

  /** スタックに値を積む */
  protected _push = (value: number | string | undefined) => {
    switch (typeof value) {
      case "undefined":
        throw new Error("push requires an argument");
      case "string":
        this.stack.push(this.toNumber(value));
        break;
      default:
        this.stack.push(value);
    }
  };

  /** 加算 */
  protected _add = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a + b);
  };

  /** 減算 */
  protected _sub = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(b - a);
  };

  /** 乗算 */
  protected _mul = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a * b);
  };

  /** 除算 */
  protected _div = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new Error("Division by zero");
    }
    this.stack.push(Math.floor(b / a));
  };

  /** 剰余 */
  protected _mod = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new Error("Division by zero");
    }
    this.stack.push(b % a);
  };

  /** 等価 */
  protected _equal = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a === b ? 1 : 0);
  };

  /** グローバル変数の定義 */
  protected _setGlobal = (name: string | undefined) => {
    if (!name) {
      throw new Error("get_global requires an argument");
    }
    const a = this._pop();
    this.global.set(name, a);
  };

  /** グローバル変数の取得 */
  protected _getGlobal = (name: string | undefined) => {
    if (!name) {
      throw new Error("get_global requires an argument");
    }
    const value = this.global.get(name);
    if (value || value === 0) {
      this.stack.push(value);
    } else {
      throw new Error(`Undefined global variable: ${name}`);
    }
  };

  /** ラベルの定義 */
  protected _setLabel = (name: string | undefined) => {
    if (!name) {
      throw new Error("set_label requires an argument");
    }
    if (this.label.has(name)) {
      throw new Error(`Duplicated label: ${name}`);
    }
    this.label.set(name, this.line);
  };

  /** ラベルで指定された行へジャンプ */
  protected _jump = (label: string | undefined) => {
    if (!label) {
      throw new Error("jump requires an argument");
    }
    const line = this.label.get(label);
    if (typeof line === "undefined") {
      throw new Error(`Undefined label: ${label}`);
    }
    this.line = line;
  };

  /** popした値が0以外ならジャンプ */
  protected _jumpIf = (label: string | undefined) => {
    if (!label) {
      throw new Error("jump_if requires an argument");
    }
    const a = this._pop();
    if (a !== 0) {
      const line = this.label.get(label);
      if (typeof line === "undefined") {
        throw new Error(`Undefined label: ${label}`);
      }
      this.line = line;
    }
  };

  /** popした値が0ならジャンプ */
  protected _jumpIfZero = (label: string | undefined) => {
    if (!label) {
      throw new Error("jump_if_zero requires an argument");
    }
    const a = this._pop();
    if (a === 0) {
      const line = this.label.get(label);
      if (typeof line === "undefined") {
        throw new Error(`Undefined label: ${label}`);
      }
      this.line = line;
    }
  };

  /** 値を出力する */
  protected _print = () => {
    const a = this._pop();
    return a;
  };

  /**
   * スタックのエラーを検知する
   * @returns {boolean} エラーが無ければtrue
   */
  protected hasStackError = (): boolean => {
    switch (this.stack.length) {
      case 0:
        throw new Error("Stack is empty");
      case 1:
        return true;
      default:
        throw new Error("Too many values in stack");
    }
  };

  /**
   * 命令セットの生成
   * @param {string} input 入力文字列
   * @returns {Instruction[]} 命令セット
   */
  protected generateInstructionSet = (input: string): string[][] => {
    const lines = input.split("\n");
    const instructions: string[][] = [];
    try {
      for (const line of lines) {
        if (line.trim() !== "") {
          instructions.push(line.trim().split(" "));
        }
      }
    } catch (error) {
      throw new Error(`Syntax error: ${error}`);
    }
    return instructions;
  };

  /**
   * 与えられた文字列が数字であればnumber型にして返す
   * 数字でなければエラーを投げる
   * @param {string} value 文字列
   * @returns {number} 数字
   */
  protected toNumber = (value: string): number => {
    if (!Number.isNaN(Number(value))) {
      return Number(value);
    }
    throw new Error(`push requires a number: ${value} isn't allowed`);
  };

  protected clean = () => {
    this.stack = [];
    this.global.clear();
    this.label.clear();
    this.line = 0;
    this.printData = [];
  };

  /** VMを実行する */
  abstract execute(input: string): string;
}
