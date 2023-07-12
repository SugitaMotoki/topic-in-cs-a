/**
 * 後置式電卓を行うVM
 */
export class PostfixCalculator {
  /** VMのスタック */
  private stack: number[] = [];

  /** スタックから値を取り出す */
  protected _pop = () => {
    const value = this.stack.pop();
    if (value || value === 0) {
      return value;
    }
    throw new Error("Stack underflow");
  };

  /** スタックに値を積む */
  protected _push = (value: number) => {
    this.stack.push(value);
  };

  /** 加算 */
  protected _add = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a + b);
  };

  /** 減算 */
  protected _sub = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(b - a);
  };

  /** 乗算 */
  protected _mul = () => {
    const a = this._pop();
    const b = this._pop();
    this.stack.push(a * b);
  };

  /** 除算 */
  protected _div = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new Error("Division by zero");
    }
    this.stack.push(Math.floor(b / a));
  };

  /** 剰余 */
  protected _mod = () => {
    const a = this._pop();
    const b = this._pop();
    if (a === 0) {
      throw new Error("Division by zero");
    }
    this.stack.push(b % a);
  };

  /** 値を出力する */
  protected _print = () => {
    const a = this._pop();
    return a;
  };

  /**
   * スタックのエラーを検知する
   * @returns {boolean} エラーが無ければtrue
   */
  protected hasStackError = (): boolean => {
    switch (this.stack.length) {
      case 0:
        throw new Error("Stack is empty");
      case 1:
        return true;
      default:
        throw new Error("Too many values in stack");
    }
  };

  public execute(input: string): number {
    for (const char of input.split(" ")) {
      switch (char) {
        case char.match(/[0-9]+/u)?.[0]:
          this._push(Number(char));
          break;
        case "+":
          this._add();
          break;
        case "-":
          this._sub();
          break;
        case "*":
          this._mul();
          break;
        case "/":
          this._div();
          break;
        case "%":
          this._mod();
          break;
        case "":
          break;
        default:
          throw new Error(`Syntax error: ${char}`);
      }
    }

    this.hasStackError();
    return this._pop();
  }
}
