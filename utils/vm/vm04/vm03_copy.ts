import { VirtualMachine04, Instruction, FunctionState } from "./abstract_vm";

/* eslint max-lines-per-function: "off" */
/* eslint no-continue: "off" */

/** デバッグかどうか */
const isDebug = "DEBUG" in process.env;

/** 時間を測るかどうか */
const isTime = "TIME" in process.env;

/**
 * VM03をほぼそのままコピーしたVM04
 * 速度比較対象として用いる
 */
export class VM03Copy extends VirtualMachine04 {
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
