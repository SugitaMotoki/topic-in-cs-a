/* eslint no-use-before-define: "off" */
export type Variable = number | Array<Variable> | object;

export type CDataStructure = CVariable | CArray | CPointer | CStruct;

export type CVariable = {
  cType: number;
  value: number | null;
};

export type CArray = {
  cType: number;
  value: (number | null)[];
};

export type CPointer = {
  cType: number;
  value: string;
};

export type CStruct = {
  value: CDataStructure[];
};
