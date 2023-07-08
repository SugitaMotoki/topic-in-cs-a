export class VirtualMachineError extends Error {
  constructor(line: number, message: string) {
    super(`Line ${line}: ${message}`);
  }
}
