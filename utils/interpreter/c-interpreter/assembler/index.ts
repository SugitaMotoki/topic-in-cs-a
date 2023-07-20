import { regexp } from "../specifications";
import { cTypeIdMap } from "../id-map";
import { Instruction, Argment } from "../types";
import { instructionMethodIdMap } from "../virtual-machine";

/* eslint max-lines: "off" */
export class Assembler {
  /** グローバル変数の名前とidを紐づけるMap */
  private readonly globalVariableIdMap: Map<string, number> = new Map();

  /** ローカル変数の名前とidを紐づけるMap */
  private readonly localVariableIdMap: Map<string, number> = new Map();

  /** ラベルの名前とidを紐づけるMap */
  private readonly labelIdMap: Map<string, number> = new Map();

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
    let argments: Argment[] = [];
    switch (methodId) {
      case 2: // push
        argments = this.getPushArgment(lineArray[1]!);
        break;
      case 16: // jump
      case 17: // jumpIf
      case 24: // call
        argments = [this.getPcOfLabel(lineArray[1]!)];
        break;
      case 18: // declareGlobal
        argments = this.getDeclareArgment(lineArray[1]!, lineArray[2]!, 0);
        break;
      case 19: // setGlobal
      case 20: // getGlobal
        argments = this.setOrGetArgment(lineArray[1]!, 0);
        break;
      case 21: // declareLocal
        argments = this.getDeclareArgment(lineArray[1]!, lineArray[2]!, 1);
        break;
      case 22: // setLocal
      case 23: // getLocal
        argments = this.setOrGetArgment(lineArray[1]!, 1);
        break;
      default:
        break;
    }
    return { methodId, argments };
  };

  /**
   * push命令オブジェクトの生成補助
   * @param argment - push命令の引数
   * @returns {Instruction} push命令オブジェクト
   */
  private getPushArgment = (argment: string): Argment[] => {
    if (this.isNumber(argment)) {
      return [Number(argment)];
    } else if (this.isString(argment)) {
      return [argment.slice(1, -1)];
    }
    throw new Error(`Invalid argment: ${argment}`);
  };

  /**
   * ラベル名から対応するプログラムカウンタを取得する
   * @param {string} label - ラベル名
   * @returns {number} プログラムカウンタ
   */
  private getPcOfLabel = (label: string): number => {
    if (this.labelIdMap.has(label)) {
      return this.labelIdMap.get(label)!;
    }
    throw new Error(`Invalid label: ${label}`);
  };

  /**
   * 変数の宣言
   * @param {string} variableName - 変数名
   * @param {string} cTypeName - 変数の型
   * @param {0 | 1} mapId - グローバルかローカルか
   * @returns {Argment[]} 引数
   */
  private declareCVariable = (
    variableName: string,
    cTypeName: string,
    mapId: 0 | 1,
  ): Argment[] => {
    if (!cTypeIdMap.has(cTypeName)) {
      throw new Error(`Invalid type: ${cTypeName}`);
    }
    const cTypeId = cTypeIdMap.get(cTypeName)!;
    const variableMap = this.variableMaps[mapId]!;
    // グローバルかローカルかで名前重複時の挙動が異なる
    if (variableMap.has(variableName)) {
      if (mapId === 0) {
        throw new Error(`Duplicate variable name: ${variableName}`);
      } else {
        return [0, variableMap.get(variableName)!, cTypeId];
      }
    }
    const variableId = variableMap.size;
    variableMap.set(variableName, variableId);
    return [0, variableId, cTypeId];
  };

  /**
   * 配列の宣言
   * @param {string} arrayName - 配列名
   * @param {string} cTypeName - 配列の型
   * @param {number} length - 配列の長さ
   * @param {0 | 1} mapId - グローバルかローカルか
   * @returns {Argment[]} 引数
   */
  private declareCArray = (
    arrayName: string,
    cTypeName: string,
    length: number,
    mapId: 0 | 1,
  ): Argment[] => {
    if (!cTypeIdMap.has(cTypeName)) {
      throw new Error(`Invalid type: ${cTypeName}`);
    }
    const cTypeId = cTypeIdMap.get(cTypeName)!;
    const variableMap = this.variableMaps[mapId]!;
    // グローバルかローカルかで名前重複時の挙動が異なる
    if (variableMap.has(arrayName)) {
      if (mapId === 0) {
        throw new Error(`Duplicate variable name: ${arrayName}`);
      } else {
        return [1, variableMap.get(arrayName)!, cTypeId, length];
      }
    }
    const variableId = variableMap.size;
    variableMap.set(arrayName, variableId);
    return [1, variableId, cTypeId, length];
  };

  /**
   * declare命令オブジェクトの生成補助
   * @param {string} arg1 - 変数名 or 配列名
   * @param {string} arg2 - 変数の型
   * @param {0 | 1} arg3 - グローバルかローカルか
   * @returns
   */
  private getDeclareArgment = (
    arg1: string,
    arg2: string,
    arg3: 0 | 1,
  ): Argment[] => {
    // 変数の場合
    const variableMatchArray = arg1.match(regexp.cVariable);
    if (variableMatchArray) {
      return this.declareCVariable(variableMatchArray[0], arg2, arg3);
    }
    // 配列の場合
    const arrayMatchArray = arg1.match(regexp.cArray);
    if (arrayMatchArray) {
      return this.declareCArray(
        arrayMatchArray[1]!,
        arg2,
        Number(arrayMatchArray[2]),
        arg3,
      );
    }
    throw new Error(`Invalid variable name: ${arg2}`);
  };

  /**
   * 変数名から変数IDを取得する
   * @param {string} variableName - 変数名
   * @param {0 | 1} mapId - グローバルかローカルか
   * @returns {Argment[]} 引数
   */
  private setOrGetCVariable = (
    variableName: string,
    mapId: 0 | 1,
  ): Argment[] => {
    const variableMap = this.variableMaps[mapId]!;
    if (variableMap.has(variableName)) {
      return [0, variableMap.get(variableName)!];
    }
    throw new Error(`Undefined variable: ${variableName}`);
  };

  /**
   * 配列名から変数IDを取得する
   * @param {string} arrayName - 配列名
   * @param {number} index - 配列のインデックス
   * @param {0 | 1} mapId - グローバルかローカルか
   * @returns {Argment[]} 引数
   */
  private setOrGetCArray = (
    arrayName: string,
    index: number,
    mapId: 0 | 1,
  ): Argment[] => {
    const variableMap = this.variableMaps[mapId]!;
    if (variableMap.has(arrayName)) {
      return [1, variableMap.get(arrayName)!, index];
    }
    throw new Error(`Undefined variable: ${arrayName}`);
  };

  /**
   * setXXX・getXXX命令オブジェクトの生成補助
   * @param {string} arg1 - 変数名 or 配列名
   * @param {0 | 1} arg2 - グローバルかローカルか
   * @returns {Argment[]} 引数
   */
  private setOrGetArgment = (arg1: string, arg2: 0 | 1): Argment[] => {
    // 変数の場合
    const variableMatchArray = arg1.match(regexp.cVariable);
    if (variableMatchArray) {
      return this.setOrGetCVariable(variableMatchArray[0], arg2);
    }
    // 配列の場合
    const arrayMatchArray = arg1.match(regexp.cArray);
    if (arrayMatchArray) {
      return this.setOrGetCArray(
        arrayMatchArray[1]!,
        Number(arrayMatchArray[2]),
        arg2,
      );
    }
    throw new Error(`Invalid variable name: ${arg1}`);
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
   * @param {string} str - 与えられた文字列
   * @returns {boolean} Number型に変換できるかどうか
   */
  private isNumber = (str: string): boolean => {
    return !Number.isNaN(Number(str));
  };

  /**
   * 与えられた文字列が文字列かどうか判断する
   * @param {string} str - 与えられた文字列
   * @returns {boolean} 文字列かどうか
   */
  private isString = (str: string): boolean => {
    return str.startsWith('"') && str.endsWith('"');
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

  private readonly variableMaps = [
    /* No.00 */ this.globalVariableIdMap,
    /* No.01 */ this.localVariableIdMap,
  ];
}
