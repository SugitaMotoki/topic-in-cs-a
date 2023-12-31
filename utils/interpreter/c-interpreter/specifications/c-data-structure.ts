export interface CDataStructure {}

export class CVariable implements CDataStructure {
  readonly cTypeId: number;
  value: number | null;

  constructor(cTypeId: number) {
    this.cTypeId = cTypeId;
    this.value = null;
  }

  setValue(value: number) {
    this.value = value;
  }
}

export class CArray implements CDataStructure {
  readonly cTypeId: number;
  values: CVariable[];

  constructor(cTypeId: number, length: number) {
    this.cTypeId = cTypeId;
    this.values = [...Array(length)].map(() => new CVariable(cTypeId));
  }
}
