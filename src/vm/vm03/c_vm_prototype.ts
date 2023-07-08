import { VirtualMachine03, Instruction, FunctionState } from "./abstract_vm";

/** デバッグ時に環境変数として与えられる文字列 */
const DEBUG = "DEBUG";

export class CVMProtoType extends VirtualMachine03 {
  /** 配列名とメモリのインデックスの対応表 */
  private arrayMap = new Map<string, number>();

  /** 配列を定義する */
  private _defineArray = (name: string | undefined) => {
    if (!name) {
      throw new Error("set_array requires an argument");
    }

    /** 定義する配列の長さ */
    const length = this._pop();

    // 長さの文だけ0で埋め、メモリサイズを取得する
    const memorySize = this.memory.push(new Array(length).fill(0));

    // 配列名とメモリのインデックスを対応付ける
    this.arrayMap.set(name, memorySize - 1);
  };

  /** 配列に値を保存する */
  private _setArray = (name: string | undefined) => {
    if (!name) {
      throw new Error("set_array requires an argument");
    }

    /** 配列内の保存するインデックス */
    const index = this._pop();

    /** 保存する値 */
    const value = this._pop();

    /** 保存する配列の場所 */
    const memoryIndex = this.arrayMap.get(name);
    if (typeof memoryIndex === "undefined") {
      throw new Error(`Undefined array name: ${name}`);
    }

    /** 保存する配列 */
    const array = this.memory[memoryIndex];
    if (!array) {
      throw new Error(`Undefined array name: ${name}`);
    }

    // 実装途中
    if (typeof array === "number") {
      throw new Error(`Not array name: ${name}`);
    }

    // 配列に値を保存する
    array[index] = value;

    // 保存した配列をメモリに戻す
    this.memory[memoryIndex] = array;
  };

  /** 配列の要素を取得する */
  private _getArray = (name: string | undefined) => {
    if (!name) {
      throw new Error("get_array requires an argument");
    }

    /** 配列内の取得するインデックス */
    const index = this._pop();

    /** 取得する配列の場所 */
    const memoryIndex = this.arrayMap.get(name);
    if (typeof memoryIndex === "undefined") {
      throw new Error(`Undefined array name: ${name}`);
    }

    /** 取得する配列 */
    const array = this.memory[memoryIndex];
    if (!array) {
      throw new Error(`Undefined array name: ${name}`);
    }

    // 実装途中
    if (typeof array === "number") {
      throw new Error(`Not array name: ${name}`);
    }

    /** 取得した値 */
    const value = array[index];
    if (typeof value === "undefined") {
      throw new Error(`Undefined array index: ${index}`);
    }

    // 取得した値をスタックに積む
    this.stack.push(value);
  };

  /* eslint max-lines-per-function: "off" */
  /* eslint no-continue: "off" */
  public override execute(input: string): string {
    // データを初期化する
    this.clean();

    /**
     * 命令が格納された2次元配列
     * @example [["push", "1"], ["push", "2"], ["add"], ["print"]]
     */
    const instructionSet: string[][] = this.parse(input);

    /** MAINへ飛ぶ */
    this.functions.push(new FunctionState("MAIN", instructionSet.length - 1));
    this._jump("MAIN");
    this.line++;

    if (process.env[DEBUG]) {
      console.log("=== input =====");
      console.log(input);
      console.log("\n=== label =====");
      console.log(this.label);
      console.log("\n=== flow =====");
    }

    while (this.line < instructionSet.length) {
      /** ${line}行目の命令 */
      const instruction = instructionSet[this.line];

      if (process.env[DEBUG]) {
        console.log(`${String(this.line).padStart(3, " ")}, ${instruction}`);
      }

      if (!instruction) {
        this.line++;
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
        case Instruction.equal:
          this._equal();
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
        case Instruction.defineArray:
          this._defineArray(instruction[1]);
          break;
        case Instruction.setArray:
          this._setArray(instruction[1]);
          break;
        case Instruction.getArray:
          this._getArray(instruction[1]);
          break;
        case Instruction.jump:
          this._jump(instruction[1]);
          break;
        case Instruction.jumpIf:
          this._jumpIf(instruction[1]);
          break;
        case Instruction.jumpIfZero:
          this._jumpIfZero(instruction[1]);
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
      this.line++;
    }

    if (process.env[DEBUG]) {
      console.log("\n=== result =====");
    }
    return this.printData.join("\n");
  }
}
