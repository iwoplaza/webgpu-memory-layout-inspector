import type { Token } from 'tokenizr';

class TokenSource {
	private tokens: Token[];

	constructor(tokens: Token[], private readonly ignoreComments = true) {
		this.tokens = [...tokens];
	}

	hasNext(): boolean {
		return this.peek() !== undefined;
	}

	pop(): Token | undefined {
		const token = this.peek();
		this.tokens.shift();
		return token;
	}

	popOfType(type: string, errorMsg: string): Token {
		const token = this.pop();

		if (token?.type !== type) {
			throw new Error(`(line: ${token?.line}, col: ${token?.column}) ${errorMsg}`);
		}

		return token;
	}

	peek(): Token | undefined {
		// Skipping comments
		while (this.ignoreComments && this.tokens[0]?.type === 'comment') {
			this.tokens.shift();
		}

		const token = this.tokens[0];

		if (!token || token.type === 'EOF') {
			return undefined;
		}

		return token;
	}
}

export default TokenSource;
