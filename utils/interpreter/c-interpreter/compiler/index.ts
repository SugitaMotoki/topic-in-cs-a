export class Compiler {
  public compileToAssembly(cSourceCode: string): string {
    console.log(cSourceCode);
    // HACK: 一旦用意されたサンプルコードを返す
    return sampleCodes().assembly.tiny;
  }
}
