import {
	Scene,
	MeshBuilder,
	ArcRotateCamera,
	HemisphericLight,
	Vector3,
	Color3,
	Color4,
	StandardMaterial,
	GlowLayer,
} from '@babylonjs/core';

import { SceneComponent } from '../SceneComponent/SceneComponent';

export const ReactCanvasSceneComponent = () => {
	const createScene = (scene: Scene) => {
		scene.clearColor = new Color4(0.0, 0.1, 0.2);

		const gl = new GlowLayer('glow', scene);
		gl.intensity = 2.0;

		const camera = new ArcRotateCamera(
			'camera1',
			Math.PI / 2,
			Math.PI / 2,
			0.1,
			new Vector3(0, 0, 0),
			scene
		);
		camera.wheelDeltaPercentage = 0.01;

		const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
		light.intensity = 10.7;

		const mat = new StandardMaterial('mat', scene);
		mat.disableLighting = true;

		const path = [
			new Vector3(-1.0, 0.0, 0.0),
			new Vector3(0.0, 1, 0.0),
			new Vector3(1.0, 0, 0.0),
			new Vector3(0.0, -1, 0.0),
			new Vector3(-1.0, 0.0, 0.0),
		];

		const colors = new Array(path.length)
			.fill(0)
			.map(() => new Color4(1, 1, 1, 1));

		const squaresCount = 100;
		const step = 1.0;
		const maxZ = squaresCount * step;

		const squares: any[] = [];
		for (let i = 0; i < squaresCount; i += 1) {
			const square = MeshBuilder.CreateLines(
				'tube',
				{ points: path, colors },
				scene
			);

			const squareMaterial = square.material as StandardMaterial;
			squareMaterial.emissiveColor = new Color3(1, 0.5, 0);
			squareMaterial.disableLighting = true;
			square.material.alpha = 1;

			//@ts-ignore
			square.idx = i as number;
			//@ts-ignore
			square.originalPosZ = -square.idx * step;

			//@ts-ignore
			square.position.z = square.originalPosZ;

			squares.push(square);
		}

		let time = 0;
		const rate = 0.01;
		scene.registerBeforeRender(function () {
			for (let i = 0; i < squaresCount; i += 1) {
				const square = squares[i];
				square.position.z = square.originalPosZ + time * 10;
				square.rotation.z = (Math.cos(time + square.idx * 0.1) * Math.PI) / 2;

				Color3.HSVtoRGBToRef(
					(square.idx * 10) % 360,
					1,
					1,
					square.material.emissiveColor
				);
				square.material.emissiveColor.scaleToRef(
					1 - Math.sqrt(Math.abs(square.position.z / maxZ)),
					square.material.emissiveColor
				);

				if (square.position.z > 0) {
					square.idx += squaresCount;
					square.originalPosZ = -square.idx * step;
				}
			}

			camera.fov = (Math.sin(time * 3) * 0.25 + 0.75) * 0.25 + 0.525;
			time += scene.getAnimationRatio() * rate;
		});
	};

	return <SceneComponent onSceneReady={createScene} />;
};
