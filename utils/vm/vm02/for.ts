import { LoopVirtualMachine } from "./loop_virtual_machine";

export class For extends LoopVirtualMachine {
  /** ループカウンタ */
  private loopCounter = new Map<string, number>();

  /* eslint max-lines-per-function: "off" */
  /* eslint max-statements: "off" */
  /* eslint complexity: "off" */
  /* eslint @typescript-eslint/no-non-null-assertion: "off" */

  public override execute(input: string): string {
    /** データを初期化する */
    this.clean();
    this.loopCounter.clear();

    /**
     * 命令が格納された2次元配列
     * @example [["push", "1"], ["push", "2"], ["add"], ["print"]]
     */
    const instructions: string[][] = this.generateInstructionSet(input);

    // 行数をリセット
    this.line = 0;

    // ラベルのみ先に走査する
    while (this.line < instructions.length) {
      const instruction = instructions[this.line]!;
      switch (instruction[0]) {
        case "start_for":
          this._setLabel(`SF${instruction[1]}`);
          break;
        case "end_for":
          this._setLabel(`EF${instruction[1]}`);
          break;
        default:
          break;
      }
      this.line++;
    }

    // 行数をリセット
    this.line = 0;

    while (this.line < instructions.length) {
      /** ${line}行目の命令 */
      const instruction = instructions[this.line]!; // whileの条件より必ず存在する

      switch (instruction[0]) {
        case "debug_show_stack":
          this._showStack();
          break;
        case "push":
          this._push(instruction[1]);
          break;
        case "pop":
          this._pop();
          break;
        case "add":
          this._add();
          break;
        case "sub":
          this._sub();
          break;
        case "mul":
          this._mul();
          break;
        case "div":
          this._div();
          break;
        case "mod":
          this._mod();
          break;
        case "equal":
          this._equal();
          break;
        case "set_global":
          this._setGlobal(instruction[1]);
          break;
        case "get_global":
          this._getGlobal(instruction[1]);
          break;
        case "start_for":
          this._startFor(instruction[1]);
          break;
        case "end_for":
          this._endFor(instruction[1]);
          break;
        case "print":
          this.printData.push(String(this._pop()));
          break;
        case "label":
          // labelは上で見ているのでここでは何もしない
          break;
        case "//":
          // コメントなので無視
          break;
        default:
          throw new Error(`Syntax error: ${instruction}`);
      }
      this.line++;
    }
    return this.printData.join("\n");
  }

  /** popした値の回数だけ、end_forまでの処理を行う */
  private _startFor(loopLable: string | undefined): void {
    if (!loopLable) {
      throw new Error("start_for requires an argument");
    }
    const a = this._pop();
    if (a <= 0) {
      this.line = this.label.get(`EF${loopLable}`)!;
    } else {
      this.loopCounter.set(loopLable, a - 1);
    }
  }

  /** loopCounterが0になるまでstart_forに戻る */
  private _endFor(loopLabel: string | undefined): void {
    if (!loopLabel) {
      throw new Error("end_for requires an argument");
    }
    const value = this.loopCounter.get(loopLabel);
    if (typeof value === "undefined") {
      throw new Error(`Undefined loopLabel: ${loopLabel}`);
    }
    if (value > 0) {
      this.line = this.label.get(`SF${loopLabel}`)!;
      this.loopCounter.set(loopLabel, value - 1);
    }
  }
}
