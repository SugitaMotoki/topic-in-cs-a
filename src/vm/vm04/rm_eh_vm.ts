import { FunctionState } from "./modules";
import { Address, Variable, Instruction } from "./types";

/* eslint max-lines-per-function: "off" */
/* eslint no-continue: "off" */
/* eslint max-lines: "off" */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */

/** デバッグかどうか */
const isDebug = "DEBUG" in process.env;

/** 時間を測るかどうか */
const isTime = "TIME" in process.env;

/**
 * VM03をほぼそのままコピーしたVM04
 * 速度比較対象として用いる
 */
export class RMEHVM {
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
    this.stack.push(Number(value));
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
    const currentFunction = this.getCurrentFunction();
    const value = this._pop();
    const currentAddress = currentFunction.localAddressMap.get(name!);
    if (currentAddress) {
      this.memory[currentAddress[0]!] = value;
    } else {
      const newAddress: Address = [this.memory.push(value) - 1];
      currentFunction.localAddressMap.set(name!, newAddress);
    }
  };

  protected _getLocal = (name: string | undefined) => {
    const currentFunction = this.getCurrentFunction();
    const address = currentFunction.localAddressMap.get(name!)!;

    // HACK: スタックにpushできる型が増えたら本実装

    const addressLengthOfVariable = 1;

    if (address.length === addressLengthOfVariable) {
      const variable = this.memory[address[0]!];
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
    const value = this._pop();
    this.globalAddressMap.set(name!, value);
  };

  /**
   * グローバル変数の取得
   * スタックにグローバル変数の値を積む
   * グローバル変数が存在しないときはエラーを投げる
   */
  protected _getGlobal = (name: string | undefined) => {
    const value = this.globalAddressMap.get(name!);
    this._push(value);
  };

  /**
   * 無条件ジャンプ
   * 指定されたラベルにジャンプする
   */
  protected _jump = (label: string | undefined) => {
    const pc = this.labels.get(label!)!;
    // 命令後にpcがインクリメントされるので、1減らす
    this.pc = pc - 1;
  };

  /**
   * 条件付きジャンプ
   * スタックから値を取り出し、0でなければ指定されたラベルにジャンプする
   */
  protected _jumpIf = (label: string | undefined) => {
    const value = this._pop();
    if (value !== 0) {
      const pc = this.labels.get(label!)!;
      // 命令後にpcがインクリメントされるので、1減らす
      this.pc = pc - 1;
    }
  };

  /**
   * 関数呼び出し
   */
  protected _call = (name: string | undefined) => {
    this.functionsStack.push(new FunctionState(name!, this.pc));
    this._jump(name);
  };

  /**
   * 関数からの戻り
   */
  protected _return = () => {
    const currentFunction = this.functionsStack.pop()!;
    this.pc = currentFunction.returnAddress;
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

  public execute(input: string): string {
    this.clean();

    /**
     * 命令が格納された2次元配列
     * @example [["push", "1"], ["push", "2"], ["add"], ["print"]]
     */
    const instructionSet: string[][] = this.parse(input);

    /** MAINへ飛ぶ */
    this.functionsStack.push(
      new FunctionState("MAIN", instructionSet.length - 1),
    );
    this._jump("MAIN");
    this.pc++;

    if (isDebug) {
      console.log("=== input =====");
      console.log(input);
      console.log("\n=== label =====");
      console.log(this.labels);
      console.log("\n=== flow =====");
    }

    if (isTime) {
      console.time("vm03_copy");
    }

    while (this.pc < instructionSet.length) {
      const instruction = instructionSet[this.pc];

      if (isDebug) {
        console.log(`${String(this.pc).padStart(3, " ")}, ${instruction}`);
      }

      if (!instruction) {
        this.pc++;
        continue;
      }

      switch (instruction[0]) {
        case Instruction.debugShowStack:
          this._showStack();
          break;
        case Instruction.push:
          this._push(instruction[1]);
          break;
        case Instruction.pop:
          this._pop();
          break;
        case Instruction.add:
          this._add();
          break;
        case Instruction.sub:
          this._sub();
          break;
        case Instruction.mul:
          this._mul();
          break;
        case Instruction.div:
          this._div();
          break;
        case Instruction.mod:
          this._mod();
          break;
        case Instruction.eq:
          this._eq();
          break;
        case Instruction.setLocal:
          this._setLocal(instruction[1]);
          break;
        case Instruction.getLocal:
          this._getLocal(instruction[1]);
          break;
        case Instruction.setGlobal:
          this._setGlobal(instruction[1]);
          break;
        case Instruction.getGlobal:
          this._getGlobal(instruction[1]);
          break;
        case Instruction.jump:
          this._jump(instruction[1]);
          break;
        case Instruction.jumpIf:
          this._jumpIf(instruction[1]);
          break;
        case Instruction.call:
          this._call(instruction[1]);
          break;
        case Instruction.return:
          this._return();
          break;
        case Instruction.print:
          this.printData.push(String(this._pop()));
          break;
        default:
          throw new Error(`Syntax error: ${instruction}`);
      }

      if (isDebug) {
        console.log(this.stack);
      }

      this.pc++;
    }

    if (isTime) {
      console.timeEnd("vm03_copy");
    }

    if (isDebug) {
      console.log("\n=== result =====");
    }
    return this.printData.join("\n");
  }
}
