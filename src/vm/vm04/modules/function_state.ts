import { Address } from "../types";

/**
 * 関数の状態を表すクラス
 */
export class FunctionState {
  /** 関数名 */
  public readonly name: string;

  /** returnする行数 */
  public readonly returnAddress: number;

  /** 変数のアドレスの辞書 */
  public localAddressMap = new Map<string, Address>();

  public constructor(name: string, returnAddress: number) {
    this.name = name;
    this.returnAddress = returnAddress;
  }
}
