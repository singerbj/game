
/* Game namespace */
var game = {

	// an object where to store game information
	data : {
		// score
		score : 0
	},
	
	
	// Run on page load.
	"onload" : function () {
	// Initialize the video.
	if (!me.video.init("screen", 1920, 1080, true, 'auto')) {
	//if (!me.video.init("screen", 480, 320, true, 'auto')) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}

	// add "#debug" to the URL to enable the debug Panel
	if (document.location.hash === "#debug") {
		window.onReady(function () {
			me.plugin.register.defer(this, debugPanel, "debug");
		});
	}

	// Initialize the audio.
	me.audio.init("mp3,ogg");

	// Set a callback to run when loading is complete.
	me.loader.onload = this.loaded.bind(this);

	// Load the resources.
	me.loader.preload(game.resources);

	// Initialize melonJS and display a loading screen.
	me.state.change(me.state.LOADING);
},

	// Run on game resources loaded.
	"loaded" : function () {
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new game.PlayScreen());
     
		// register our player entity in the object pool
		me.pool.register("mainPlayer", game.PlayerEntity);
		me.pool.register("mainPlayer2", game.PlayerEntity2);
		me.pool.register("CoinEntity", game.CoinEntity);
		me.pool.register("EnemyEntity", game.EnemyEntity);
            	me.pool.register("ShotEntity", game.ShotEntity); 
		// enable the keyboard
		
		//player1
		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP,  "jump", true);
		me.input.bindKey(me.input.KEY.M, "shot");
      
		//player1
		me.input.bindKey(me.input.KEY.A,  "left2");
		me.input.bindKey(me.input.KEY.D, "right2");
		me.input.bindKey(me.input.KEY.W,  "jump2", true);
		me.input.bindKey(me.input.KEY.G, "shot2");
		
		// start the game 
		me.state.change(me.state.PLAY);
	}
};
