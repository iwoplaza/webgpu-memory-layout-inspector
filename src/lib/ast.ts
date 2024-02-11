import type DataTypeRepository from './artifactRepository';
import type { DataTypeProvider } from './artifactRepository';
import type TokenSource from './tokenSource';
import type {
	ConstantDefinition,
	DataType,
	Expression,
	FieldDefinition,
	StructDefinition
} from './types';

export function parseExpression(source: TokenSource): Expression {
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

export function parseDataType(source: TokenSource, dataTypeProvider: DataTypeProvider): DataType {
	const typeStr = source.popOfType('id', 'Failed to parse type').value;

	if (typeStr === 'array') {
		source.popOfType('lt', `Expected '<' after array`);

		const innerType = parseDataType(source, dataTypeProvider);
		// TODO: Do not require array length when not in struct definition
		source.popOfType('comma', 'Expected size of array');
		const countExpr = parseExpression(source);

		source.popOfType('gt', `Expected '>' after array`);

		return {
			kind: 'array-type',
			label: `Array of: ${innerType.label}`,
			innerType,
			countExpr
		};
	}

	const dataType = dataTypeProvider.get(typeStr);

	if (!dataType) {
		throw new Error(`Unknown data-type '${typeStr}'`);
	}

	return dataType;
}

export function parseConstantDefinition(
	source: TokenSource,
	dataTypeProvider: DataTypeProvider
): ConstantDefinition {
	source.popOfType('const', 'Invalid constant definition');
	const identifier = source.popOfType('id', `Expected identifier after 'const'`).value;

	if (source.peek()?.type === 'colon') {
		// Ignoring colon
		source.pop();
		// Ignoring type
		parseDataType(source, dataTypeProvider);
	}

	source.popOfType('eq', 'Expected equals sign after const identifier');

	const valueExpression = parseExpression(source);

	if (source.peek()?.type === 'semi') {
		// Ignoring semicolon
		source.pop();
	}

	return { kind: 'const', identifier, expr: valueExpression };
}

export function parseStructField(
	source: TokenSource,
	dataTypeProvider: DataTypeProvider
): FieldDefinition {
	const identifier = source.popOfType(
		'id',
		`Struct field definition has to begin with an identifier`
	).value;
	source.popOfType('colon', `Expected ':' after struct field identifier`);
	const dataType = parseDataType(source, dataTypeProvider);

	// Pop comma
	if (source.peek()?.type === 'comma') {
		source.pop();
	}

	return { identifier, type: dataType };
}

export function parseStructDef(
	source: TokenSource,
	dataTypeProvider: DataTypeProvider
): StructDefinition {
	source.popOfType('struct', `Struct definition has to start with 'struct'`);
	const structIdentifier = source.popOfType(
		'id',
		`'struct' has to be followed by an identifier`
	).value;
	source.popOfType('brace_open', 'Struct identifier has to be follow by {');

	const fields: FieldDefinition[] = [];
	while (source.peek()?.type === 'id') {
		fields.push(parseStructField(source, dataTypeProvider));
	}

	source.popOfType('brace_close', 'Struct definition has to end with }');

	return {
		kind: 'struct',
		identifier: structIdentifier,
		label: `${structIdentifier} struct`,
		fields
	};
}

class AST {
	public structs: StructDefinition[] = [];
	public constants: ConstantDefinition[] = [];

	constructor() {}

	parse(source: TokenSource, dataTypeRepository: DataTypeRepository) {
		while (source.hasNext()) {
			if (source.peek()!.type === 'struct') {
				const struct = parseStructDef(source, dataTypeRepository);
				dataTypeRepository.set(struct.identifier, struct);
				this.structs.push(struct);
			} else if (source.peek()!.type === 'const') {
				this.constants.push(parseConstantDefinition(source, dataTypeRepository));
			} else {
				throw new Error(`Unsupported token at top-level: ${source.peek()?.type}`);
			}
		}
	}
}

export default AST;
