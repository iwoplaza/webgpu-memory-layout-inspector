<script>
	import AnalysisResult from './AnalysisResult.svelte';
	import CodeEditor from './CodeEditor.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta
		name="description"
		content="An app helping developers understand the WebGPU memory layout."
	/>
</svelte:head>

<section>
	<h1>WebGPU Memory Layout Inspector</h1>
</section>

<CodeEditor />

<AnalysisResult />

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
