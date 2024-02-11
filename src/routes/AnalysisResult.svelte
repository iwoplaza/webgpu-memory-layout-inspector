<script lang="ts">
	import DataTypeRepository from '$lib/artifactRepository';
	import MemoryAnalyser from '$lib/memoryAnalyser';

	const analyser = MemoryAnalyser();

	async function analyze() {
		const code = `
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
}
`;

		const dataTypeRepo = new DataTypeRepository();

		(await analyser)?.analyse(code, `SceneInfo`);
	}
</script>

<button type="button" on:click={analyze}>Analyze</button>
