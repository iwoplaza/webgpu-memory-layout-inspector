import computeConstExpr from './computeConstExpr';
import type { ConstantDefinition, DataType } from './types';

export const BuiltInDataTypes = [
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

export interface ArtifactProvider {
	getType(identifier: string): DataType | undefined;
	getConstant(identifier: string): number;
}

class ArtifactRepository implements ArtifactProvider {
	public dataTypes: Map<string, DataType> = new Map(BuiltInDataTypes);
	public constants: Map<string, number> = new Map();

	constructor() {}

	getType(identifier: string): DataType | undefined {
		return this.dataTypes.get(identifier);
	}

	getConstant(identifier: string): number {
		if (this.constants.has(identifier)) {
			return this.constants.get(identifier)!;
		}

		throw new Error(`Unknown or non-numeric constant: ${identifier}`);
	}

	setType(identifier: string, dataType: DataType) {
		this.dataTypes.set(identifier, dataType);
	}

	setConstant(identifier: string, def: ConstantDefinition) {
		// TODO: Ignore non-numeric constants
		this.constants.set(identifier, computeConstExpr(def.expr, this));
	}
}

export default ArtifactRepository;
