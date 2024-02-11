import type { ArtifactProvider } from './artifactRepository';
import type { Expression } from './types';

function computeConstExpr(expr: Expression, artifactProvider: ArtifactProvider): number {
	if (expr.kind === 'literal') {
		if (typeof expr.value !== 'number') {
			// TODO: Loosen requirement, ignore these
			throw new Error(`Expected only numeric constants.`);
		}

		return expr.value;
	}

	if (expr.kind === 'identifier') {
		return artifactProvider.getConstant(expr.identifier);
	}

	if (expr.kind === 'sum') {
		return (
			computeConstExpr(expr.left, artifactProvider) + computeConstExpr(expr.right, artifactProvider)
		);
	}

	if (expr.kind === 'product') {
		return (
			computeConstExpr(expr.left, artifactProvider) * computeConstExpr(expr.right, artifactProvider)
		);
	}

	throw new Error(`Unknown const expression`);
}

export default computeConstExpr;
