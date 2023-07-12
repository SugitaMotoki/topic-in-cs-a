import { VirtualMachineError } from "./";

/** アドレスが存在しない場合のエラーオブジェクト */
export class UndefinedAddressError extends VirtualMachineError {
  public constructor(functionName: string, addressName: string, line: number) {
    super(line, `Undefined address: ${functionName}.${addressName}`);
  }
}
