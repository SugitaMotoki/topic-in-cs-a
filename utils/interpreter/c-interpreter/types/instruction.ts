import { Value } from "./value";

/**
 * ### 引数
 */
export type Argment = Value;

/**
 * ### 命令オブジェクト
 * - 命令IDと引数の配列を持つ
 * - 独自の機械語の1命令に相当する
 * @property {number} id - 命令ID
 * @property {Argment[]} argments - 引数
 */
export type Instruction = {
  methodId: number;
  argments: Argment[];
};
