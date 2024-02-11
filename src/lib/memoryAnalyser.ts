import AST, { parseDataType } from './ast';
import DataTypeRepository from './artifactRepository';
import { lexer } from './lexer';
import TokenSource from './tokenSource';
import type { DataType } from './types';

function makeAssignCode(dataType: DataType, prefix: string) {
	if (dataType.kind === 'simple-type') {
		return `${prefix}${dataType.label} = 0;\n`;
	} else if (dataType.kind === 'array-type') {
		return `for (let i = 0; i < ${dataType.countExpr})`;
	}
}

const MemoryAnalyser = async () => {
	if (typeof window === 'undefined') {
		return;
	}

	const adapter = await navigator.gpu.requestAdapter();

	if (!adapter) {
		throw new Error(`Null GPU adapter`);
	}

	const device = await adapter.requestDevice();

	return {
		async analyse(code: string, typeExpression: string) {
			lexer.input(code);

			const ast = new AST();
			const dataTypeRepo = new DataTypeRepository();
			ast.parse(new TokenSource(lexer.tokens()), dataTypeRepo);

			lexer.input(typeExpression);
			const typeExprSource = new TokenSource(lexer.tokens());
			const analizedType = parseDataType(typeExprSource, dataTypeRepo);

			const pipeline = device.createComputePipeline({
				layout: 'auto',
				compute: {
					module: device.createShaderModule({
						code: `${code}

@group(0) @binding(0) var<storage, read_write> buffer: ${typeExpression};

@compute @workgroup_size(1)
fn main() {
	
	buffer.num_of_spheres = 15;
}
`
					}),
					entryPoint: 'main'
				}
			});

			const bufferSize = 5136;

			const gpuWriteBuffer = device.createBuffer({
				size: bufferSize,
				usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
				mappedAtCreation: true
			});
			{
				const mapping = new Uint8Array(gpuWriteBuffer.getMappedRange());
				for (let i = 0; i < bufferSize; ++i) {
					mapping[i] = 0;
				}

				gpuWriteBuffer.unmap();
			}

			const gpuReadBuffer = device.createBuffer({
				size: bufferSize,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
				mappedAtCreation: false
			});

			const bindGroup = device.createBindGroup({
				layout: pipeline.getBindGroupLayout(0),
				entries: [
					{
						binding: 0,
						resource: {
							buffer: gpuWriteBuffer
						}
					}
				]
			});

			const commandEncoder = device.createCommandEncoder();

			const mainPass = commandEncoder.beginComputePass();

			mainPass.setPipeline(pipeline);
			mainPass.setBindGroup(0, bindGroup);
			mainPass.dispatchWorkgroups(1);

			mainPass.end();

			commandEncoder.copyBufferToBuffer(
				gpuWriteBuffer, // source
				0, // source offset
				gpuReadBuffer, // destination
				0, // destination offset
				bufferSize
			);

			device.queue.submit([commandEncoder.finish()]);

			const resultBuffer = new Uint8Array(bufferSize);
			{
				await gpuReadBuffer.mapAsync(GPUMapMode.READ);
				const mapping = new Uint8Array(gpuReadBuffer.getMappedRange());
				resultBuffer.set(mapping);

				gpuReadBuffer.unmap();
			}

			console.log(resultBuffer);

			gpuWriteBuffer.destroy();
			gpuReadBuffer.destroy();
		}
	};
};

export default MemoryAnalyser;
