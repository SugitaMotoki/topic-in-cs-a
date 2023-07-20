/**
 * 関数オブジェクト
 */
export type FunctionObject = {
  functionId: number;
  returnAddress: number;
  localVariableMap: Map<number, number>;
};
