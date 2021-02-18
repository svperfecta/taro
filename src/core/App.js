import { Physics } from './Physics.js';
import { Renderer } from './Renderer.js';
import { AssetManager } from './AssetManager.js';
import { Time } from './Time.js';
import { Input } from './Input.js';

export class App {

	constructor( parameters = {} ) {

		this.parameters = parameters;

		this.renderer = parameters.renderer !== undefined ? parameters.renderer : new Renderer( parameters );
		this.domElement = this.renderer.domElement;

		this.assets = new AssetManager();
		this.time = new Time( parameters );
		this.physics = new Physics( parameters );
		this.input = new Input( this.domElement );

		this.scenes = [];
		this.currentScene = undefined;

		App.currentApp = this;

	}

	start() {

		this.renderer.setAnimationLoop( ( t ) => this.update( t ) );

	}

	stop() {

		this.renderer.setAnimationLoop( null );

	}

	update( timestamp = 0 ) {

		const deltaTime = this.time.update( timestamp / 1000 );

		let steps = this.physics.update( this.time.scaledFixedTimestep, deltaTime );

		// fixed update (0 - multiple times per frame)
		while ( steps -- ) {

			for ( const type in this.components ) {

				const container = this.components[ type ];
				if ( container[ 0 ] !== undefined && container[ 0 ].fixedUpdate !== undefined )
					for ( let j = 0, lenj = container.length; j < lenj; j ++ )
						container[ j ].fixedUpdate( deltaTime );

			}

		}

		// update (once per frame)
		for ( const type in this.components ) {

			const container = this.components[ type ];
			if ( container[ 0 ] !== undefined && container[ 0 ].update !== undefined )
				for ( let j = 0, lenj = container.length; j < lenj; j ++ )
					container[ j ].update( deltaTime );

		}

		this.renderer.update();
		this.input.reset();

	}

	dispose() {

		this.renderer.dispose();
		this.input.dispose();

	}

	addScene( scene ) {

		scene.app = this;
		this.scenes.push( scene );
		scene.dispatchEvent( { type: 'appadd' } );
		return scene;

	}

	removeScene( scene ) {

		const index = this.scenes.indexOf( scene );

		if ( index !== - 1 ) {

			this.scenes.splice( index, 1 );
			delete scene.app;

		}

	}

	setScene( scene ) {

		if ( this.currentScene !== scene ) {

			if ( this.scenes.indexOf( scene ) === - 1 )
				this.addScene( scene );

			const oldScene = this.currentScene;

			this.components = scene.components;
			this.currentScene = scene;

			this.renderer._updateScene( scene );
			this.physics._updateScene( scene );

		}

		return scene;

	}

	getEntityById( id ) {

		return this.getEntityByProperty( 'id', id );

	}

	getSceneByName( name ) {

		return this.getSceneByProperty( 'name', name );

	}

	getSceneByProperty( name, value ) {

		for ( let i = 0, len = this.scenes.length; i < len; i ++ ) {

			if ( this.scenes[ i ][ name ] === value )
				return this.scenes[ i ];

		}

		return undefined;

	}

}

App.prototype.isApp = true;
