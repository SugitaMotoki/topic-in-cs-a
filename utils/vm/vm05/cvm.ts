import { Variable, Instruction } from "./types";

export class CVM {
  /** スタック */
  private stack: Variable[] = [];

  /** メモリ */
  private memory: Variable[] = [];

  /** プログラムカウンタ */
  private pc = 0;

  /** 出力 */
  private output: string[] = [];

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

  public execute(instructions: Instruction[]): string[] {
    while (this.pc < instructions.length) {
      const instruction = instructions[this.pc];
      this.methods[instruction.id](instruction.argments);
      this.pc++;
    }
    return this.output;
  }

  private methods = [this._print, this._pop, this._push];
}
