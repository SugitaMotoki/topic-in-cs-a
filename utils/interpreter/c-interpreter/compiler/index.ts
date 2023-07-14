export class Compiler {
  public compileToAssembly(cSourceCode: string): string {
    // HACK: 一旦用意されたサンプルコードを返す
    return sampleCodes().assembly.tiny;
  }
}
