import { Instruction } from "../types";

export class Assembler {
  /** グローバル変数の名前とidを紐づけるMap */
  private readonly globalVariableIdMap: Map<string, number> = new Map();

  /** ローカル変数の名前とidを紐づけるMap */
  private readonly localVariableIdMap: Map<string, number> = new Map();

  /**
   * アセンブリコードを独自の機械語に変換する
   * @param {string} assemblyCode
   * @param {Map<string, number>} globalVariableIdMap - グローバル変数の名前とidを紐づけるMap
   * @param {Map<string, number>} localVariableIdMap - ローカル変数の名前とidを紐づけるMap
   * @returns {Instruction[]} 命令オブジェクト群（独自の機械語）
   */
  public assemble(assemblyCode: string): Instruction[] {
    this.globalVariableIdMap.clear();
    this.localVariableIdMap.clear();

  }
    const instructions: Instruction[] = [];
    return instructions;
  }
}
