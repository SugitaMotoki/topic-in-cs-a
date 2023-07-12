import { FunctionState } from "./modules";
import { VirtualMachineError, Address, Variable } from "./types";

export * from "./modules";
export * from "./types";

/* eslint max-lines: "off" */

/** 配列を実現するためのVMの抽象クラス */
export abstract class VirtualMachine03 {
  /** VMのスタック */
  protected stack: number[] = [];

  /** 命令の行数（プログラムカウンタ） */
  protected line = 0;

  /** メモリ */
  protected memory: Variable[] = [];

  /** 関数 */
  protected functions: FunctionState[] = [];

  /** ラベル（関数名も含む） */
  protected label = new Map<string, number>();

  /** グローバル変数 */
  private globalAddressMap = new Map<string, number>();

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

  /**
   * ローカル変数の定義
   * 指定された名前の変数が現在の関数にあれば代入、なければ新規作成
   */
  protected _setLocal = (name: string | undefined) => {
    if (!name) {
      throw new Error("set_local requires an argument");
    }
    const currentFunction = this.getCurrentFunction();
    const value = this._pop();
    const currentAddress = currentFunction.localAddressMap.get(name);
    if (currentAddress) {
      if (typeof currentAddress[0] === "undefined") {
        throw new Error("Invalid address");
      }
      this.memory[currentAddress[0]] = value;
    } else {
      const lengthOfMemory = this.memory.push(value);
      const newAddress: Address = [lengthOfMemory - 1];
      currentFunction.localAddressMap.set(name, newAddress);
    }
  };

  /** ローカル変数の取得 */
  protected _getLocal = (name: string | undefined) => {
    if (!name) {
      throw new Error("get_local requires an argument");
    }
    const currentFunction = this.getCurrentFunction();
    const address = currentFunction.localAddressMap.get(name);
    if (typeof address === "undefined") {
      throw new Error(`Undefined local variable: ${name}`);
    }

    // 実装途中

    const addressLengthOfVariable = 1;
    const addressLengthOfArray = 2;

    if (typeof address[0] === "undefined") {
      throw new Error("Invalid address");
    } else if (address.length === addressLengthOfVariable) {
      const variable = this.memory[address[0]];
      if (typeof variable === "undefined") {
        throw new Error(`Undefined local variable: ${name}`);
      }
      if (typeof variable === "number") {
        this.stack.push(variable);
      }
    } else if (address.length === addressLengthOfArray) {
      if (typeof address[1] === "undefined") {
        throw new Error("Invalid address");
      }
      const array = this.memory[address[0]];
      if (typeof array === "undefined") {
        throw new Error(`Undefined local variable: ${name}`);
      }
      if (typeof array === "number") {
        throw new Error(`Undefined local variable: ${name}`);
      }
      const variable = array[address[1]];
      if (typeof variable === "undefined") {
        throw new Error(`Undefined local variable: ${name}`);
      }
      if (typeof variable === "number") {
        this.stack.push(variable);
      }
    }
  };

  /** グローバル変数の定義 */
  protected _setGlobal = (name: string | undefined) => {
    if (!name) {
      throw new Error("set_global requires an argument");
    }
    const a = this._pop();
    this.globalAddressMap.set(name, a);
  };

  /** グローバル変数の取得 */
  protected _getGlobal = (name: string | undefined) => {
    if (!name) {
      throw new Error("get_global requires an argument");
    }
    const value = this.globalAddressMap.get(name);
    if (value || value === 0) {
      this.stack.push(value);
    } else {
      throw new Error(`Undefined global variable: ${name}`);
    }
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
    // 命令後にthis.lineが1足されるので1引いておく
    this.line = line - 1;
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
      this.line = line - 1;
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
      this.line = line - 1;
    }
  };

  /** 関数を呼び出す */
  protected _call(functionName: string | undefined) {
    if (!functionName) {
      throw new Error(`Undefined label name: ${functionName}`);
    } else if (functionName === "MAIN") {
      throw new Error(`MAIN function is not callable`);
    }

    this.functions.push(new FunctionState(functionName, this.line));
    this._jump(functionName);
  }

  /** 関数での処理を終えて呼び出した位置へ戻る */
  protected _return() {
    const returnedFunction = this.functions.pop();
    if (!returnedFunction) {
      throw new VirtualMachineError(this.line, "No function to return");
    }
    this.line = returnedFunction.returnAddress;
  }

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

  /** 今いる関数を取得する */
  protected getCurrentFunction = (): FunctionState => {
    const currentFunction = this.functions[this.functions.length - 1];
    if (!currentFunction) {
      // 関数に入っていないことを示すエラー
      throw new Error("This instruction must be called in a function");
    }
    return currentFunction;
  };

  /**
   * プログラムのパース
   * 入力文字列を命令セットに変換する
   * @param {string} input 入力文字列
   * @returns {Instruction[]} 命令セット
   */
  protected parse = (input: string): string[][] => {
    this.line = 0;
    const lines = input.split("\n");
    const instructionSet: string[][] = [];
    let lineOfInput = 0;
    try {
      while (lineOfInput < lines.length) {
        const line = lines[lineOfInput];

        if (!line) {
          lineOfInput++;
          continue;
        }

        /** 前後の空白を削除 */
        const trimmed = line.trim();

        // 空行、コメント行はスキップ
        if (this.isSkip(trimmed)) {
          /* eslint no-continue: "off" */
          lineOfInput++;
          continue;
        }

        // 行を空白で分割して配列化
        const instruction = trimmed.split(" ");

        // ラベルの場合はラベルを登録してスキップ
        if (instruction[0]?.endsWith(":")) {
          const label = instruction[0].slice(0, -1);
          this.setLabel(this.line, label);
          lineOfInput++;
          continue;
        }

        // 命令セットに追加
        instructionSet.push(instruction);
        // 命令を追加したので
        this.line++;
        lineOfInput++;
      }
    } catch (error) {
      throw new Error(`Syntax error: ${error}`);
    }
    return instructionSet;
  };

  /** スキップすべき行かを判定する */
  private isSkip = (line: string): boolean => {
    return line === "" || line.startsWith("//") || line.startsWith("#");
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

  /** ラベルの定義 */
  protected setLabel = (line: number, name: string | undefined) => {
    if (!name) {
      throw new Error("set_label requires an argument");
    }
    if (this.label.has(name)) {
      throw new Error(`Duplicated label: ${name}`);
    }
    this.label.set(name, line);
  };

  protected clean = () => {
    this.stack = [];
    this.globalAddressMap.clear();
    this.label.clear();
    this.line = 0;
    this.printData = [];
  };

  /** VMを実行する */
  abstract execute(input: string): string;
}
