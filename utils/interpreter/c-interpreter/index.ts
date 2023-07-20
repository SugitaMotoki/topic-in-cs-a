import { Instruction } from "./types";
import { Compiler } from "./compiler";
import { Assembler } from "./assembler";
import { VirtualMachine } from "./virtual-machine";

export class CInterpreter {
  private readonly compiler = new Compiler();
  private readonly assembler = new Assembler();
  private readonly virtualMachine = new VirtualMachine();

  public execute(cSourceCode: string): string {
    const assemblyCode = this.compiler.compileToAssembly(cSourceCode);
    return this.executeFromAssembly(assemblyCode);
  }

  public executeFromAssembly(assemblyCode: string): string {
    const instructions: Instruction[] = this.assembler.assemble(assemblyCode);
    const pcOfMainFunction = this.assembler.getPcOfMainFunction();
    const output = this.virtualMachine.execute(instructions, pcOfMainFunction);
    return output.join("\n");
  }
}
