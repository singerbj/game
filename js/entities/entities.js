/*------------------- 
a player entity
-------------------------------- */
game.PlayerEntity = me.ObjectEntity.extend({
 
    /* -----
 
    constructor
 
    ------ */
 
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
 
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 15);
 
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
 
    },
 
    /* -----
update the player pos
------ */
update: function(dt) {
 
    if (me.input.isKeyPressed('left'))
    {
        // flip the sprite on horizontal axis
        this.flipX(true);
        // update the entity velocity
        this.vel.x -= this.accel.x * me.timer.tick;
    }
    else if (me.input.isKeyPressed('right'))
    {
        // unflip the sprite
        this.flipX(false);
        // update the entity velocity
        this.vel.x += this.accel.x * me.timer.tick;
    
    }else
    {
        this.vel.x = 0;
    }
    if (me.input.isKeyPressed('jump'))
    {   
        if (!this.jumping && !this.falling) 
        {
            // set current vel to the maximum defined value
            // gravity will then do the rest
            this.vel.y = -this.maxVel.y * me.timer.tick;
            // set the jumping flag
            this.jumping = true;
        }
    }
 
    if (me.input.isKeyPressed('shot')) {
	// Create a new laser object
	console.log("person location: " + this.pos.x + ", " + this.pos.y)
	var myShot = me.pool.pull("ShotEntity", this.pos.x, this.pos.y, { image: "bullet", spritewidth: 16, spriteheight: 16 }, false);
	// Add the laser to the game manager with z value 3
	me.game.world.addChild(myShot, 3);
    } 
    // check & update player movement
    this.updateMovement();
 
    // check for collision
    var res = me.game.world.collide(this);
 
    if (res) {
        // if we collide with an enemy
        if (res.obj.type == me.game.ENEMY_OBJECT) {
            // check if we jumped on it
            if ((res.y > 0) && ! this.jumping) {
                // bounce (force jump)
                this.falling = false;
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
 
            } else {
                // let's flicker in case we touched an enemy
                this.renderable.flicker(750);
            }
        }
    }
 
    // update animation if necessary
    if (this.vel.x!=0 || this.vel.y!=0) {
        // update object animation
        this.parent(dt);
        return true;
    }
    // else inform the engine we did not perform
    // any update (e.g. position, animation)
    return false;       
 
}
 
 
});

/*----------------
 a Shot entity
------------------------ */
game.ShotEntity = me.ObjectEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings, left) {

	// call the parent constructor
        this.parent(x, y, settings);
	
	this.pos.x = x;
	this.pos.y = y;
	
	this.left = left;	
	this.collidable = true;
	console.log("shot created");
		
    },
 
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    	onCollision : function () {
		// do something when there is collision
		console.log("Hit!") 
		// make sure it cannot be collected "again"
		this.collidable = false;
		// remove it
		me.game.world.removeChild(this);
	},

	update: function() {
		console.log("update function called") 
	
		this.flipX(this.left);
		this.vel.x += (this.left)? - this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
		this.updateMovement();
		return true;    
	}
});

/*----------------
 a Coin entity
------------------------ */
game.CoinEntity = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
           
	// call the parent constructor
        this.parent(x, y, settings);
    },
 
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision : function () {
		// do something when collected
 
		// give some score
		game.data.score += 250;
 
		// make sure it cannot be collected "again"
		this.collidable = false;
		// remove it
		me.game.world.removeChild(this);
	}
 
});

/* --------------------------
an enemy Entity
------------------------ */
game.EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "wheelie_right";
           
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;;
 
        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.spritewidth = settings.width = 64;
        settings.spritewidth = settings.height = 64;
         
        // call the parent constructor
        this.parent(x, y , settings);
         
        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.spritewidth
        this.pos.x  = x + width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(2, 6);
         
        // make it collidable
        this.collidable = true;
        this.type = me.game.ENEMY_OBJECT;
    },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
 
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one
        if (this.alive && (res.y > 0) && obj.falling) {
            this.renderable.flicker(750);
        }
    },
 
    // manage the enemy movement
    update: function(dt) {
        // do nothing if not in viewport
        if (!this.inViewport)
            return false;
 
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            // make it walk
            this.flipX(this.walkLeft);
            this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
                 
        } else {
            this.vel.x = 0;
        }
         
        // check and update movement
        this.updateMovement();
         
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent(dt);
            return true;
        }
        return false;
    }
});

/**
 * a HUD container and child items
 */
 
game.HUD = game.HUD || {};
 
  
game.HUD.Container = me.ObjectContainer.extend({
 
    init: function() {
        // call the constructor
        this.parent();
         
        // persistent across level change
        this.isPersistent = true;
         
        // non collidable
        this.collidable = false;
         
        // make sure our object is always draw first
        this.z = Infinity;
 
        // give a name
        this.name = "HUD";
         
        // add our child score object at the right-bottom position
        this.addChild(new game.HUD.ScoreItem(630, 440));
    }
});
 
 
/** 
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend( {    
    /** 
     * constructor
     */
    init: function(x, y) {
         
        // call the parent constructor 
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 10, 10); 
         
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("right");
         
        // local copy of the global score
        this.score = -1;
 
        // make sure we use screen coordinates
        this.floating = true;
    },
     
    /**
     * update function
     */
    update : function (dt) {
        // we don't draw anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    },
 
    /**
     * draw the score
     */
    draw : function (context) {
        this.font.draw (context, game.data.score, this.pos.x, this.pos.y);
    }
});
