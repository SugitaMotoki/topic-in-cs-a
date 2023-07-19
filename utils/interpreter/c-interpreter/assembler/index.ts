import { Instruction, Variable } from "../types";
import { instructionMethodIdMap } from "../virtual-machine";

export class Assembler {
  /** グローバル変数の名前とidを紐づけるMap */
  private readonly globalVariableIdMap: Map<string, number> = new Map();

  /** ローカル変数の名前とidを紐づけるMap */
  private readonly localVariableIdMap: Map<string, number> = new Map();

  /** ラベルの名前とidを紐づけるMap */
  private readonly labelIdMap: Map<string, number> = new Map();

  /**
   * アセンブリコードを独自の機械語に変換する
   * @param {string} assemblyCode
   * @returns {Instruction[]} 命令オブジェクト群（独自の機械語）
   */
  public assemble(assemblyCode: string): Instruction[] {
    this.globalVariableIdMap.clear();
    this.localVariableIdMap.clear();
    this.labelIdMap.clear();

    try {
      return this.parse(assemblyCode);
    } catch (error) {
      throw new Error(`Syntax error: ${error}`);
    }
  }

  /**
   * プログラムのパース
   * @param {string} assemblyCode
   * @returns {Instruction[]} 命令オブジェクト群
   */
  private parse = (assemblyCode: string): Instruction[] => {
    /** returnする命令オブジェクト群 */
    const instructions: Instruction[] = [];

    /** assemblyCodeを1行ずつ格納した配列 */
    const lines = assemblyCode.split("\n");

    const pc = 0;

    for (const line of lines) {
      /** lineの両端の空白を削除した文字列 */
      const trimmedLine = line.trim();

      // 空行・コメント行ならスキップ
      if (this.isSkipLine(trimmedLine)) {
        /* eslint no-continue: "off" */
        continue;
      }

      /** string配列化した行 */
      const lineArray = trimmedLine.split(" ");

      // ラベルであれば登録して次の行へ
      if (this.isLabel(lineArray[0])) {
        this.setLabel(lineArray[0], pc);
        continue;
      }

      // 正しい命令でなければ例外
      if (!instructionMethodIdMap.has(lineArray[0])) {
        throw new Error(`Invalid instruction: ${lineArray[0]}`);
      }

      instructions.push(this.createInstruction(lineArray));
    }

    return instructions;
  };

  /**
   * 命令オブジェクトを生成する
   * @param lineArray - string配列化した行
   * @returns {Instruction} 命令オブジェクト
   */
  private createInstruction = (lineArray: string[]): Instruction => {
    const methodId = instructionMethodIdMap.get(lineArray[0])!;
    switch (methodId) {
      case 2: // push
        return {
          methodId,
          argments: this.getPushArgment(lineArray[1]),
        };
      case 16: // jump
      case 17: // jumpIf
        return {
          methodId,
          argments: this.getJumpArgment(lineArray[1]),
        };
      default:
        return {
          methodId,
          argments: [],
        };
    }
  };

  /**
   * push命令オブジェクトの生成補助
   * @param argment - push命令の引数
   * @returns {Instruction} push命令オブジェクト
   */
  private getPushArgment = (argment: string): Variable[] => {
    const argments: Variable[] = [];
    if (this.isNumber(argment)) {
      argments.push(Number(argment));
    }
    return argments;
  };

  /**
   * jump命令オブジェクトの生成補助
   * - ラベル名からラベルidを取得する
   * @param argment - jump命令の引数
   * @returns {Variable[]} labelIdを1つだけ格納した配列
   */
  private getJumpArgment = (argment: string): Variable[] => {
    console.log(argment);
    if (this.labelIdMap.has(argment)) {
      return [this.labelIdMap.get(argment)!];
    }
    throw new Error(`Invalid label: ${argment}`);
  };

  /**
   * スキップすべき行かを判定する
   * @param {string} line
   * @returns {boolean} スキップすべき行かどうか
   */
  private isSkipLine = (line: string): boolean => {
    return line === "" || line.startsWith("//") || line.startsWith("#");
  };

  /**
   * 与えられた文字列がラベルかどうか判断する
   * @param {string} str - 与えられた文字列
   * @returns {boolean} ラベルかどうか
   */
  private isLabel = (str: string): boolean => {
    return str.endsWith(":");
  };

  /**
   * 与えられた文字列をNumber型に変換できるかどうか判断する
   * @param str
   * @returns
   */
  private isNumber = (str: string): boolean => {
    return !Number.isNaN(Number(str));
  };

  /**
   * ラベルを登録する
   * @param {string} label - ラベル名（:で終わっているはず）
   * @param {number} pc
   * @returns {void}
   * @throws {Error} ラベルが重複している場合
   */
  protected setLabel = (label: string, pc: number): void => {
    const labelName = label.slice(0, -1);
    if (this.labelIdMap.has(labelName)) {
      throw new Error(`Duplicate label: ${labelName}`);
    }
    this.labelIdMap.set(labelName, pc);
  };
}
