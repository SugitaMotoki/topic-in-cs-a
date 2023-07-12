import { VirtualMachine04, Instruction, FunctionState } from "./abstract_vm";

/* eslint max-lines-per-function: "off" */
/* eslint no-continue: "off" */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */

/** デバッグかどうか */
const isDebug = "DEBUG" in process.env;

/** 時間を測るかどうか */
const isTime = "TIME" in process.env;

/**
 * VM03をほぼそのままコピーしたVM04
 * 速度比較対象として用いる
 */
export class ShortInstructionVM extends VirtualMachine04 {
  protected thisParse = (input: string): (string | number)[][] => {
    this.pc = 0;
    const lines = input.split("\n");
    const instructionSet: (string | number)[][] = [];
    let lineOfInput = 0;
    try {
      while (lineOfInput < lines.length) {
        const line = lines[lineOfInput]?.trim();

        if (!line) {
          lineOfInput++;
          continue;
        }

        if (this.isSkip(line)) {
          lineOfInput++;
          continue;
        }

        const instruction = line.split(" ");

        if (instruction[0]?.endsWith(":")) {
          const label = instruction[0].slice(0, -1);
          this.setLabel(this.pc, label);
          lineOfInput++;
          continue;
        }

        instructionSet.push(instruction);
        this.pc++;
        lineOfInput++;
      }
      this.pc = 0;
      while (this.pc < instructionSet.length) {
        const instruction = instructionSet[this.pc]!;
        if (
          instruction[0] === Instruction.call ||
          instruction[0] === Instruction.jump ||
          instruction[0] === Instruction.jumpIf
        ) {
          const label = instruction[1] as string;
          instruction[1] = Number(this.labels.get(label));
        }
        this.pc++;
      }
    } catch (e) {
      throw new Error(`Syntax error: ${lines[lineOfInput]}`);
    }
    return instructionSet;
  };

  protected thisJump = (pc: number | undefined): void => {
    if (typeof pc === "undefined") {
      throw new Error(`Syntax error: ${Instruction.jump}`);
    }
    this.pc = pc - 1;
  };

  protected thisJumpIf = (pc: number | undefined): void => {
    if (typeof pc === "undefined") {
      throw new Error(`Syntax error: ${Instruction.jumpIf}`);
    }
    const value = this._pop();
    if (value !== 0) {
      this.pc = pc - 1;
    }
  };

  protected override _return = (): void => {
    const currentFunction = this.functionsStack.pop();
    if (typeof currentFunction === "undefined") {
      throw new Error(`Syntax error: ${Instruction.return}`);
    } else if (currentFunction.name === "MAIN") {
      this.pc = 1000000;
    } else {
      this.pc = currentFunction.returnAddress;
    }
  };

  protected thisCall = (pc: number | undefined): void => {
    if (typeof pc === "undefined") {
      throw new Error(`Syntax error: ${Instruction.call}`);
    } else if (pc === this.labels.get("MAIN")) {
      throw new Error(`Syntax error: ${Instruction.call}`);
    }
    this.functionsStack.push(
      new FunctionState(this.pcToLabelName(pc), this.pc),
    );
    this.thisJump(pc);
  };

  private pcToLabelName = (pc: number): string => {
    for (const [labelName, labelPc] of this.labels) {
      if (pc === labelPc) {
        return labelName;
      }
    }
    throw new Error(`Syntax error: ${pc}`);
  };

  public execute(input: string): string {
    this.clean();

    /**
     * 命令が格納された2次元配列
     * @example [["push", "1"], ["push", "2"], ["add"], ["print"]]
     */
    const instructionSet: (string | number)[][] = this.thisParse(input);

    /** MAINへ飛ぶ */
    this.functionsStack.push(
      new FunctionState("MAIN", instructionSet.length - 1),
    );
    this.thisJump(this.labels.get("MAIN")!);
    this.pc++;

    if (isDebug) {
      console.log("=== input =====");
      console.log(input);
      console.log("\n=== label =====");
      console.log(this.labels);
      console.log("\n=== flow =====");
    }

    if (isTime) {
      console.time("short_instruction_vm");
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
          this._setLocal(String(instruction[1]));
          break;
        case Instruction.getLocal:
          this._getLocal(String(instruction[1]));
          break;
        case Instruction.setGlobal:
          this._setGlobal(String(instruction[1]));
          break;
        case Instruction.getGlobal:
          this._getGlobal(String(instruction[1]));
          break;
        case Instruction.jump:
          this.thisJump(Number(instruction[1]));
          break;
        case Instruction.jumpIf:
          this.thisJumpIf(Number(instruction[1]));
          break;
        case Instruction.call:
          this.thisCall(Number(instruction[1]));
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
      console.timeEnd("short_instruction_vm");
    }

    if (isDebug) {
      console.log("\n=== result =====");
    }
    return this.printData.join("\n");
  }
}
