import { Instruction, Variable } from "./types";
import { Assembler } from "./assembler";
import { VirtualMachine } from "./virtual-machine";

export class CInterpreter {
  private assembler = new Assembler();

  private virtualMachine = new VirtualMachine();

  private memory: Variable[] = [];

  private initialize() {
    this.memory = [];
  }

  public execute(sourceCode: string): string {
    this.initialize();
    const instructions: Instruction[] = this.assembler.assemble(sourceCode);
    const output = this.virtualMachine.execute(instructions);
    return output.join("\n");
  }
}
