import { Instruction } from "../types";

export class Assembler {
  /**
   * アセンブリコードを独自の機械語に変換する
   * @param {string} assemblyCode
   * @param {Map<string, number>} globalVariableIdMap - グローバル変数の名前とidを紐づけるMap
   * @param {Map<string, number>} localVariableIdMap - ローカル変数の名前とidを紐づけるMap
   * @returns {Instruction[]} 命令オブジェクト群（独自の機械語）
   */
  public assemble(
    assemblyCode: string,
    globalVariableIdMap: Map<string, number>,
    localVariableIdMap: Map<string, number>,
  ): Instruction[] {
    globalVariableIdMap.clear();
    localVariableIdMap.clear();

    // HACK: 一旦空の配列を返す
    const instructions: Instruction[] = [];
    return instructions;
  }
}
