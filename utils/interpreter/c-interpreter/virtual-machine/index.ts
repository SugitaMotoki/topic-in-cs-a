import { Instruction, Variable } from "../types";

export class VirtualMachine {
  /** スタック */
  private stack: Variable[] = [];

  /** プログラムカウンタ */
  private pc = 0;

  /** 出力 */
  private output: string[] = [];

  /**
   * VMの実行
   * @param {Instruction[]} instructions アセンブリ命令列
   * @returns {string[]} 出力
   */
  public execute(instructions: Instruction[]): string[] {
    while (this.pc < instructions.length) {
      const instruction = instructions[this.pc];
      this.methods[instruction.id](instruction.argments);
      this.pc++;
    }
    return this.output;
  }

  /**
   * ### No.0: print
   * スタックの先頭を出力する
   */
  private _print = () => {
    const value = this._pop();
    this.output.push(String(value));
  };

  /**
   * ### No.1: pop
   * スタックから値を取り出す
   */
  private _pop = () => {
    const value = this.stack.pop();
    if (typeof value === "undefined") {
      throw new Error("stack underflow");
    }
    return value;
  };

  /**
   * ### No.2: push
   * スタックに値を積む
   */
  private _push = (arg: Variable[]) => {
    this.stack.push(arg[0]);
  };

  /**
   * 命令の実行メソッド
   * 配列のインデックスが命令IDに対応している
   */
  private methods = [this._print, this._pop, this._push];
}
