import { Variable } from "./variable";

/**
 * アセンブリ命令
 * @property {number} id 命令ID
 * @property {Variable[]} argments 引数
 */
export type Instruction = {
  id: number;
  argments: Variable[];
};
