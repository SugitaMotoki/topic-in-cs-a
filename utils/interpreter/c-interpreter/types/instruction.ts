import { Variable } from "./variable";

/**
 * ### 命令オブジェクト
 * - 命令IDと引数の配列を持つ
 * - 独自の機械語の1命令に相当する
 * @property {number} id - 命令ID
 * @property {Variable[]} argments - 引数
 */
export type Instruction = {
  methodId: number;
  argments: Variable[];
};
