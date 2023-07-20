import { cTypeIdMap } from "../id-map";
import { Instruction, Variable } from "../types";
import { instructionMethodIdMap } from "../virtual-machine";

/* eslint max-lines: "off" */
export class Assembler {
  /** グローバル変数の名前とidを紐づけるMap */
  private readonly globalVariableIdMap: Map<string, number> = new Map();

  /** ローカル変数の名前とidを紐づけるMap */
  private readonly localVariableIdMap: Map<string, number> = new Map();

  /** ラベルの名前とidを紐づけるMap */
  private readonly labelIdMap: Map<string, number> = new Map();

  /** 変数の正規表現 */
  public readonly variableRegExp = /^[A-Za-z_]+\w*$/u;

  /** 配列の正規表現 */
  public readonly arrayRegExp = /^(?<name>[A-Za-z_]+\w*)\[(?<length>\d+)\]$/u;

  /** main関数の開始位置となるプログラムカウンタを返す */
  public getPcOfMainFunction = (): number => {
    return this.labelIdMap.get("MAIN")!;
  };

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

    // 前処理
    const preprocessedLines = this.preprocess(lines);

    for (const line of preprocessedLines) {
      /** string配列化した行 */
      const lineArray = line.split(" ");

      // 正しい命令でなければ例外
      if (!instructionMethodIdMap.has(lineArray[0]!)) {
        throw new Error(`Invalid instruction: ${lineArray[0]}`);
      }

      instructions.push(this.createInstruction(lineArray));
    }

    return instructions;
  };

  /**
   * パースの前処理
   * - 空行・コメント行を削除
   * - ラベルを登録
   * @param lines - assemblyCodeを1行ずつ格納した配列
   * @returns {string[]} 前処理後の文字列を格納した配列
   */
  private preprocess = (lines: string[]): string[] => {
    /** 前処理後の文字列を格納する配列 */
    const preprocessedLines: string[] = [];

    for (const line of lines) {
      /** lineの両端の空白を削除した文字列 */
      const trimmedLine = line.trim();

      // 空行・コメント行ならスキップ
      if (this.isSkipLine(trimmedLine)) {
        /* eslint no-continue: "off" */
        continue;
      }

      // ラベルであれば登録
      if (this.isLabel(trimmedLine)) {
        this.setLabel(trimmedLine, preprocessedLines.length);
        continue;
      }

      preprocessedLines.push(trimmedLine);
    }
    return preprocessedLines;
  };

  /**
   * 命令オブジェクトを生成する
   * @param lineArray - string配列化した行
   * @returns {Instruction} 命令オブジェクト
   */
  private createInstruction = (lineArray: string[]): Instruction => {
    const methodId = instructionMethodIdMap.get(lineArray[0]!)!;
    switch (methodId) {
      case 2: // push
        return {
          methodId,
          argments: this.getPushArgment(lineArray[1]!),
        };
      case 16: // jump
      case 17: // jumpIf
        return {
          methodId,
          argments: this.getJumpArgment(lineArray[1]!),
        };
      case 18: // declareGlobal
        return {
          methodId,
          argments: this.getDeclareGlobalArgment(lineArray[1]!, lineArray[2]!),
        };
      case 19: // setGlobal
      case 20: // getGlobal
        return {
          methodId,
          argments: this.getUseGlobalArgment(lineArray[1]!),
        };
      case 21: // declareLocal
        return {
          methodId,
          argments: this.getDeclareLocalArgment(lineArray[1]!, lineArray[2]!),
        };
      case 22: // setLocal
      case 23: // getLocal
        return {
          methodId,
          argments: this.getUseLocalArgment(lineArray[1]!),
        };
      case 24: // call
        return {
          methodId,
          argments: this.getJumpArgment(lineArray[1]!),
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
    if (this.labelIdMap.has(argment)) {
      return [this.labelIdMap.get(argment)!];
    }
    throw new Error(`Invalid label: ${argment}`);
  };

  /**
   * declareGlobal命令オブジェクトの生成補助
   * - グローバル変数を宣言する
   * @param {string} cType
   * @param {string} variable
   * @returns {Variable[]}
   */
  private getDeclareGlobalArgment = (
    arg1: string, // 変数名
    arg2: string,
  ): Variable[] => {
    const variableMatchArray = arg1.match(this.variableRegExp);
    // 変数の場合
    if (variableMatchArray) {
      if (this.globalVariableIdMap.has(variableMatchArray[0])) {
        throw new Error(`Duplicate variable name: ${variableMatchArray[0]}`);
      } else if (!cTypeIdMap.has(arg2)) {
        throw new Error(`Invalid type: ${arg2}`);
      }
      const variableId = this.globalVariableIdMap.size;
      this.globalVariableIdMap.set(variableMatchArray[0], variableId);
      return [0, variableId, cTypeIdMap.get(arg2)!];
    }
    // 配列の場合
    const arrayMatchArray = arg1.match(this.arrayRegExp);
    if (arrayMatchArray) {
      if (this.globalVariableIdMap.has(arrayMatchArray[1]!)) {
        throw new Error(`Duplicate variable name: ${arrayMatchArray[1]}`);
      } else if (!cTypeIdMap.has(arg2)) {
        throw new Error(`Invalid type: ${arg2}`);
      }
      const variableId = this.globalVariableIdMap.size;
      this.globalVariableIdMap.set(arrayMatchArray[1]!, variableId);
      return [1, variableId, cTypeIdMap.get(arg2)!, Number(arrayMatchArray[2])];
    }
    throw new Error(`Invalid variable name: ${arg2}`);
  };

  /**
   * setGlobal・getGlobal命令オブジェクトの生成補助
   * @param {string} variable
   * @returns {Variable[]}
   */
  private getUseGlobalArgment = (variable: string): Variable[] => {
    // 変数の場合
    const variableMatchArray = variable.match(this.variableRegExp);
    if (variableMatchArray) {
      if (this.globalVariableIdMap.has(variableMatchArray[0])) {
        return [0, this.globalVariableIdMap.get(variableMatchArray[0])!];
      }
      throw new Error(`Undefined variable: ${variableMatchArray[0]}`);
    }
    // 配列の場合
    const arrayMatchArray = variable.match(this.arrayRegExp);
    if (arrayMatchArray) {
      if (this.globalVariableIdMap.has(arrayMatchArray[1]!)) {
        return [
          1,
          this.globalVariableIdMap.get(arrayMatchArray[1]!)!,
          Number(arrayMatchArray[2]),
        ];
      }
      throw new Error(`Undefined variable: ${arrayMatchArray[1]}`);
    }
    throw new Error(`Invalid variable name: ${variable}`);
  };

  /**
   * declareLocal命令オブジェクトの生成補助
   * - グローバル変数を宣言する
   * @param {string} arg1
   * @param {string} arg2
   * @returns {Variable[]}
   */
  private getDeclareLocalArgment = (
    arg1: string, // 変数名
    arg2: string,
  ): Variable[] => {
    const variableMatchArray = arg1.match(this.variableRegExp);
    // 変数の場合
    if (variableMatchArray) {
      const variableId = this.localVariableIdMap.size;
      if (this.localVariableIdMap.has(variableMatchArray[0])) {
        return [
          0,
          this.localVariableIdMap.get(variableMatchArray[0])!,
          variableId,
        ];
      } else if (!cTypeIdMap.has(arg2)) {
        throw new Error(`Invalid type: ${arg2}`);
      }
      this.localVariableIdMap.set(variableMatchArray[0], variableId);
      return [0, variableId, cTypeIdMap.get(arg2)!];
    }
    // 配列の場合
    const arrayMatchArray = arg1.match(this.arrayRegExp);
    if (arrayMatchArray) {
      const variableId = this.localVariableIdMap.size;
      if (this.localVariableIdMap.has(arrayMatchArray[1]!)) {
        return [
          1,
          this.localVariableIdMap.get(arrayMatchArray[1]!)!,
          variableId,
        ];
      } else if (!cTypeIdMap.has(arg2)) {
        throw new Error(`Invalid type: ${arg2}`);
      }
      this.localVariableIdMap.set(arrayMatchArray[1]!, variableId);
      return [1, variableId, cTypeIdMap.get(arg2)!, Number(arrayMatchArray[2])];
    }
    throw new Error(`Invalid variable name: ${arg2}`);
  };

  /**
   * setLocal・getLocal命令オブジェクトの生成補助
   * @param {string} variable
   * @returns {Variable[]}
   */
  private getUseLocalArgment = (variable: string): Variable[] => {
    // 変数の場合
    const variableMatchArray = variable.match(this.variableRegExp);
    if (variableMatchArray) {
      if (this.localVariableIdMap.has(variableMatchArray[0])) {
        return [0, this.localVariableIdMap.get(variableMatchArray[0])!];
      }
      throw new Error(`Undefined variable: ${variableMatchArray[0]}`);
    }
    // 配列の場合
    const arrayMatchArray = variable.match(this.arrayRegExp);
    if (arrayMatchArray) {
      if (this.localVariableIdMap.has(arrayMatchArray[1]!)) {
        return [
          1,
          this.localVariableIdMap.get(arrayMatchArray[1]!)!,
          Number(arrayMatchArray[2]),
        ];
      }
      throw new Error(`Undefined variable: ${arrayMatchArray[1]}`);
    }
    throw new Error(`Invalid variable name: ${variable}`);
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
