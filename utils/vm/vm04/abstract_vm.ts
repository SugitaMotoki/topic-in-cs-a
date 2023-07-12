import { FunctionState } from "./modules";
import { VirtualMachineError, Address, Variable } from "./types";

export * from "./modules";
export * from "./types";

/* eslint max-lines: "off" */
/* eslint max-lines-per-function: "off" */

/** 第4回発表のVMの抽象クラス */
export abstract class VirtualMachine04 {
  /** スタック */
  protected stack: number[] = [];

  /** メモリ */
  protected memory: Variable[] = [];

  /** プログラムカウンタ */
  protected pc = 0;

  /** 関数 */
  protected functionsStack: FunctionState[] = [];

  /** ラベル（関数名も含む） */
  protected labels = new Map<string, number>();

  /** グローバル変数のアドレスの辞書 */
  protected globalAddressMap = new Map<string, number>();

  /** 出力するデータ */
  protected printData: string[] = [];

  /** VMを実行する */
  abstract execute(input: string): string;

  /** スタックの状態を確認する */
  protected _showStack = () => {
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

  /**
   * 加算
   * スタックから2つの値を取り出し、加算結果をスタックに積む
   */
  protected _add = () => {
    const a = this._pop();
    const b = this._pop();
    this._push(a + b);
  };

  /**
   * 減算
   * スタックから2つの値を取り出し、減算結果をスタックに積む
   */
  protected _sub = () => {
    const a = this._pop();
    const b = this._pop();
    this._push(b - a);
  };

  /**
   * 乗算
   * スタックから2つの値を取り出し、乗算結果をスタックに積む
   */
  protected _mul = () => {
    const a = this._pop();
    const b = this._pop();
    this._push(a * b);
  };

  /**
   * 除算
   * スタックから2つの値を取り出し、除算結果をスタックに積む
   * 0で除算するときはエラーを投げる
   */
  protected _div = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new VirtualMachineError(this.pc, "Division by zero");
    }
    this._push(Math.floor(b / a));
  };

  /**
   * 剰余
   * スタックから2つの値を取り出し、剰余結果をスタックに積む
   * 0で除算するときはエラーを投げる
   */
  protected _mod = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new VirtualMachineError(this.pc, "Division by zero");
    }
    this._push(b % a);
  };

  /**
   * 等価
   * スタックから2つの値を取り出し、等価の結果をスタックに積む
   * 等価のときは1、等価でないときは0をスタックに積む
   */
  protected _eq = () => {
    const a = this._pop();
    const b = this._pop();
    this._push(a === b ? 1 : 0);
  };

  /**
   * 不等価
   * スタックから2つの値を取り出し、不等価の結果をスタックに積む
   * 不等価のときは1、不等価でないときは0をスタックに積む
   */
  protected _ne = () => {
    const a = this._pop();
    const b = this._pop();
    this._push(a !== b ? 1 : 0);
  };

  /**
   * ローカル変数の設定
   * スタックから値を取り出し、ローカル変数に設定する
   * 指定された名前の変数が現在の関数にあれば代入し、なければ新規作成する
   */
  protected _setLocal = (name: string | undefined) => {
    if (typeof name === "undefined") {
      throw new Error("setLocal requires an argument");
    }
    const currentFunction = this.getCurrentFunction();
    const value = this._pop();
    const currentAddress = currentFunction.localAddressMap.get(name);
    if (currentAddress) {
      if (typeof currentAddress[0] === "undefined") {
        throw new Error(`Cannot set undefined variable ${name}`);
      }
      this.memory[currentAddress[0]] = value;
    } else {
      const newAddress: Address = [this.memory.push(value) - 1];
      currentFunction.localAddressMap.set(name, newAddress);
    }
  };

  protected _getLocal = (name: string | undefined) => {
    if (typeof name === "undefined") {
      throw new Error("getLocal requires an argument");
    }
    const currentFunction = this.getCurrentFunction();
    const address = currentFunction.localAddressMap.get(name);
    if (typeof address === "undefined") {
      throw new Error(`Undefined local variable: ${name}`);
    }

    // HACK: スタックにpushできる型が増えたら本実装

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
        this._push(variable);
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
        this._push(variable);
      }
    }
  };

  /**
   * グローバル変数の設定
   * スタックから値を取り出し、グローバル変数に設定する
   */
  protected _setGlobal = (name: string | undefined) => {
    if (typeof name === "undefined") {
      throw new Error("setGlobal requires an argument");
    }
    const value = this._pop();
    this.globalAddressMap.set(name, value);
  };

  /**
   * グローバル変数の取得
   * スタックにグローバル変数の値を積む
   * グローバル変数が存在しないときはエラーを投げる
   */
  protected _getGlobal = (name: string | undefined) => {
    if (typeof name === "undefined") {
      throw new Error("getGlobal requires an argument");
    }
    const value = this.globalAddressMap.get(name);
    if (typeof value === "undefined") {
      throw new Error(`Undefined global variable: ${name}`);
    }
    this._push(value);
  };

  /**
   * 無条件ジャンプ
   * 指定されたラベルにジャンプする
   */
  protected _jump = (label: string | undefined) => {
    if (typeof label === "undefined") {
      throw new Error("jump requires an argument");
    }
    const pc = this.labels.get(label);
    if (typeof pc === "undefined") {
      throw new Error(`Undefined label: ${label}`);
    }
    // 命令後にpcがインクリメントされるので、1減らす
    this.pc = pc - 1;
  };

  /**
   * 条件付きジャンプ
   * スタックから値を取り出し、0でなければ指定されたラベルにジャンプする
   */
  protected _jumpIf = (label: string | undefined) => {
    if (typeof label === "undefined") {
      throw new Error("jumpIf requires an argument");
    }
    const value = this._pop();
    if (value !== 0) {
      const pc = this.labels.get(label);
      if (typeof pc === "undefined") {
        throw new Error(`Undefined label: ${label}`);
      }
      // 命令後にpcがインクリメントされるので、1減らす
      this.pc = pc - 1;
    }
  };

  /**
   * 関数呼び出し
   */
  protected _call = (name: string | undefined) => {
    if (typeof name === "undefined") {
      throw new Error("call requires an argument");
    } else if (name === "MAIN") {
      throw new Error("Cannot call MAIN function");
    }
    this.functionsStack.push(new FunctionState(name, this.pc));
    this._jump(name);
  };

  /**
   * 関数からの戻り
   */
  protected _return = () => {
    const currentFunction = this.functionsStack.pop();
    if (!currentFunction) {
      throw new Error("No function to return");
    } else if (currentFunction.name === "MAIN") {
      // HACK: 本当は終了処理を書く
      this.pc = 1000000;
    } else {
      this.pc = currentFunction.returnAddress;
    }
  };

  /**
   * プログラムのパース
   * @param {string} input
   * @returns {string[][]} 命令
   */
  protected parse = (input: string): string[][] => {
    this.pc = 0;
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
          this.setLabel(this.pc, label);
          lineOfInput++;
          continue;
        }

        // 命令セットに追加
        instructionSet.push(instruction);
        this.pc++;
        lineOfInput++;
      }
    } catch (error) {
      throw new Error(`Syntax error: ${error}`);
    }
    return instructionSet;
  };

  /**
   * スキップすべき行かを判定する
   * @param {string} line
   * @returns {boolean} スキップすべき行かどうか
   */
  protected isSkip = (line: string): boolean => {
    return line === "" || line.startsWith("//") || line.startsWith("#");
  };

  /**
   * ラベルを登録する
   * @param {number} pc
   * @param {string} label
   * @returns {void}
   * @throws {Error} ラベルが重複している場合
   */
  protected setLabel = (pc: number, label: string): void => {
    if (this.labels.has(label)) {
      throw new Error(`Duplicate label: ${label}`);
    }
    this.labels.set(label, pc);
  };

  /**
   * stringをnumberに変換する
   * @param {string} value
   * @returns {number} 数値に変換した値
   */
  protected toNumber = (value: string): number => {
    if (!Number.isNaN(Number(value))) {
      return Number(value);
    }
    throw new Error(`Cannot convert ${value} to number`);
  };

  /**
   * 現在の関数情報を取得する
   * @returns {FunctionState} 現在の関数
   */
  protected getCurrentFunction = (): FunctionState => {
    const currentFunction = this.functionsStack[this.functionsStack.length - 1];
    if (!currentFunction) {
      throw new Error("This instruction must be called in a function");
    }
    return currentFunction;
  };

  /**
   * 初期化する
   */
  protected clean = () => {
    this.pc = 0;
    this.stack = [];
    this.functionsStack = [];
    this.labels.clear();
    this.globalAddressMap.clear();
    this.printData = [];
  };
}
