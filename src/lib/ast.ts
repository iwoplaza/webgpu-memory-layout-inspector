import type TokenSource from './tokenSource';

type Literal = { kind: 'literal'; value: string | number };

type Identifier = { kind: 'identifier'; identifier: string };

type Sum = { kind: 'sum'; left: Expression; right: Expression };

type Product = { kind: 'product'; left: Expression; right: Expression };

type Expression = Literal | Identifier | Sum | Product;

type DataType =
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

type FieldDefinition = { identifier: string; type: DataType };

type StructDefinition = {
	kind: 'struct';
	identifier: string;
	label: string;
	fields: { identifier: string; type: DataType }[];
};

type ConstantDefinition = {
	kind: 'const';
	identifier: string;
	expr: Expression;
};

const BuiltInDataTypes = [
	[
		'u32',
		{
			bytes: 4,
			kind: 'simple-type',
			label: 'unsigned 32-bit integer'
		}
	],
	[
		'vec3f',
		{
			bytes: 3 * 4,
			kind: 'simple-type',
			label: 'vector of three 32-bit floats'
		}
	],
	[
		'vec4f',
		{
			bytes: 4 * 4,
			kind: 'simple-type',
			label: 'vector of four 32-bit floats'
		}
	]
] satisfies [string, DataType][];

class AST {
	public dataTypes: Map<string, DataType> = new Map(BuiltInDataTypes);
	public structs: StructDefinition[] = [];
	public constants: ConstantDefinition[] = [];

	constructor() {}

	parseExpression(source: TokenSource): Expression {
		const next = source.pop();

		if (next?.type === 'id') {
			return {
				kind: 'identifier',
				identifier: next.value
			};
		}

		if (next?.type === 'number' || next?.type === 'string') {
			return {
				kind: 'literal',
				value: next.value
			};
		}

		throw new Error(`Unexpected token: ${next}`);
	}

	parseDataType(source: TokenSource): DataType {
		const typeStr = source.popOfType('id', 'Failed to parse type').value;

		if (typeStr === 'array') {
			source.popOfType('lt', `Expected '<' after array`);

			const innerType = this.parseDataType(source);
			// TODO: Do not require array length when not in struct definition
			source.popOfType('comma', 'Expected size of array');
			const countExpr = this.parseExpression(source);

			source.popOfType('gt', `Expected '>' after array`);

			return {
				kind: 'array-type',
				label: `Array of: ${innerType.label}`,
				innerType,
				countExpr
			};
		}

		const dataType = this.dataTypes.get(typeStr);

		if (!dataType) {
			throw new Error(`Unknown data-type '${typeStr}'`);
		}

		return dataType;
	}

	parseStructField(source: TokenSource): FieldDefinition {
		const identifier = source.popOfType(
			'id',
			`Struct field definition has to begin with an identifier`
		).value;
		source.popOfType('colon', `Expected ':' after struct field identifier`);
		const dataType = this.parseDataType(source);

		// Pop comma
		if (source.peek()?.type === 'comma') {
			source.pop();
		}

		return { identifier, type: dataType };
	}

	parseStructDef(source: TokenSource): StructDefinition {
		source.popOfType('struct', `Struct definition has to start with 'struct'`);
		const structIdentifier = source.popOfType(
			'id',
			`'struct' has to be followed by an identifier`
		).value;
		source.popOfType('brace_open', 'Struct identifier has to be follow by {');

		const fields: FieldDefinition[] = [];
		while (source.peek()?.type === 'id') {
			fields.push(this.parseStructField(source));
		}

		source.popOfType('brace_close', 'Struct definition has to end with }');

		return {
			kind: 'struct',
			identifier: structIdentifier,
			label: `${structIdentifier} struct`,
			fields
		};
	}

	parseConstantDefinition(source: TokenSource): ConstantDefinition {
		source.popOfType('const', 'Invalid constant definition');
		const identifier = source.popOfType('id', `Expected identifier after 'const'`).value;

		if (source.peek()?.type === 'colon') {
			// Ignoring colon
			source.pop();
			// Ignoring type
			this.parseDataType(source);
		}

		source.popOfType('eq', 'Expected equals sign after const identifier');

		const valueExpression = this.parseExpression(source);

		if (source.peek()?.type === 'semi') {
			// Ignoring semicolon
			source.pop();
		}

		return { kind: 'const', identifier, expr: valueExpression };
	}

	parse(source: TokenSource) {
		while (source.hasNext()) {
			if (source.peek()!.type === 'struct') {
				const struct = this.parseStructDef(source);
				this.dataTypes.set(struct.identifier, struct);
				this.structs.push(struct);
			} else if (source.peek()!.type === 'const') {
				this.constants.push(this.parseConstantDefinition(source));
			} else {
				throw new Error(`Unsupported token at top-level: ${source.peek()?.type}`);
			}
		}
	}
}

export default AST;
