export type Literal = { kind: 'literal'; value: string | number };

export type Identifier = { kind: 'identifier'; identifier: string };

export type Sum = { kind: 'sum'; left: Expression; right: Expression };

export type Product = { kind: 'product'; left: Expression; right: Expression };

export type Expression = Literal | Identifier | Sum | Product;

export type FieldDefinition = { identifier: string; type: DataType };

export type StructDefinition = {
	kind: 'struct';
	identifier: string;
	label: string;
	fields: FieldDefinition[];
};

export type ConstantDefinition = {
	kind: 'const';
	identifier: string;
	expr: Expression;
};

export type DataType =
	| StructDefinition
	| {
			kind: 'simple-type';
			label: string;
			bytes: number;
	  }
	| {
			kind: 'array-type';
			label: string;
			innerType: DataType;
			countExpr: Expression;
	  };
