import { Instruction } from "../types";

export class Assembler {
  /**
   * Cのソースコードをアセンブリ命令列に変換する
   * @param {string} sourceCode Cのソースコード
   * @returns {Instruction[]} アセンブリ命令列
   */
  public assemble(sourceCode: string): Instruction[] {
    // HACK: 一旦アセンブリのJSONをパースして返す
    const assemblyCode = JSON.parse(sourceCode) as Instruction[];
    return assemblyCode;
  }
}
