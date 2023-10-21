<script lang="ts">
	import { lexer } from '$lib/lexer';
	import { Token } from 'tokenizr';

	let codeString = `
struct SphereObj {
  xyzr: vec4f,
  material_idx: u32,
}

struct MarchDomain {
  kind: u32,
  pos: vec3f,
  extra: vec3f,
}

const MAX_DOMAINS = 64;  // TODO: Parametrize
const MAX_SPHERES = 64;  // TODO: Parametrize

struct SceneInfo {
  num_of_spheres: u32,
  num_of_domains: u32,
  domains: array<MarchDomain, MAX_DOMAINS>,
  spheres: array<SphereObj, MAX_SPHERES>
}`;

	function computeTokens(input: string) {
		try {
			lexer.input(codeString);
			return [lexer.tokens(), null] as const;
		} catch (e) {
			return [[] as Token[], 'Invalid code'] as const;
		}
	}

	$: [codeTokens, lexerError] = computeTokens(codeString);

	$: console.log(codeTokens);
</script>

<main>
	<label class="input-sizer stacked" data-value={codeString}>
		<textarea spellcheck="false" bind:value={codeString} />
	</label>
	<div class="line-numbers">
		{#each codeString.split('\n') as line, idx}
			<li>{idx}</li>
		{/each}
	</div>
	<div class="tokens">
		{#each codeTokens as token}
			<span
				class="token"
				class:define={['struct', 'const'].includes(token.type)}
				class:comment={token.type === 'comment'}
				class:operator={['eq', 'gt', 'lt', 'colon', 'comma', 'semi'].includes(token.type)}
				style="--col: {token.column - 1}; --line: {token.line - 1}">{token.value}</span
			>
		{/each}
	</div>
</main>
{#if lexerError !== null}
	<p class="error-status">{lexerError}</p>
{/if}

<style>
	main {
		--line-height: 1.5em;
		font-size: 0.8em;
		position: relative;
		display: flex;
		flex-direction: column;
		line-height: var(--line-height);
	}

	.line-numbers {
		box-sizing: border-box;
		position: absolute;
		display: block;
		padding: 0.25em;
		padding-right: 2em;
		width: 5em;
		text-align: right;
		font-family: var(--font-code, monospace);

		& ul {
			margin: 0;
			padding: 0;
		}

		& li {
			margin: 0;
			padding: 0;
			list-style: none;
		}
	}

	.input-sizer {
		box-sizing: border-box;
		display: inline-grid;
		vertical-align: top;
		align-items: center;
		position: relative;

		border: 1px solid #595980;
		border-radius: 3px;

		&.stacked {
			align-items: stretch;

			&::after,
			input,
			textarea {
				grid-area: 2 / 1;
			}
		}

		&::after,
		input,
		textarea {
			width: auto;
			min-width: 1em;
			grid-area: 1 / 2;
			padding: 0.25em;
			margin: 0;
			resize: none;
			background: none;
			appearance: none;
			border: none;

			line-height: inherit;
			padding-left: 5em;
			background-color: #2a2a43;
			font-family: var(--font-code, monospace);
			font-size: 1em;
			color: transparent;
		}

		&::after {
			content: attr(data-value) ' ';
			visibility: hidden;
			white-space: pre-wrap;
		}

		&:focus-within {
			outline: solid 1px #595980;

			& textarea:focus {
				outline: none;
			}
		}
	}

	.token {
		position: absolute;
		left: calc(var(--col) * 0.6em + 5em + 0.07em);
		top: calc(var(--line) * var(--line-height) + 0.25em);

		color: white;
		font-family: var(--font-code, monospace);

		&.define {
			color: #7bd6ed;
		}

		&.comment {
			color: #ffffff66;
		}

		&.operator {
			color: rgb(242, 208, 135);
		}
	}

	.error-status {
		color: #f00;
	}
</style>
