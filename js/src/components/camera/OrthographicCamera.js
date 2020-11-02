class OrthographicCamera extends THREE.OrthographicCamera {
	init(data) {
		if ("left" in data) this.left = data.left;
		if ("right" in data) this.right = data.right;
		if ("top" in data) this.top = data.top;
		if ("bottom" in data) this.bottom = data.bottom;
		if ("near" in data) this.near = data.near;
		if ("far" in data) this.far = data.far;
		this.updateProjectionMatrix();
		this.viewport =
			"viewport" in data ? data.viewport : new ENGINE.Vector4(0, 0, 1, 1);
	}

	onEnable() {
		this.entity.scene.cameras.push(this);
		this.entity.add(this);
	}

	onDisable() {
		this.entity.scene.cameras.splice(
			ENGINE.Render.cameras.indexOf(this),
			1
		);
		this.entity.remove(this);
	}
}

ENGINE.createComponent("OrthographicCamera", OrthographicCamera);
