MoParticleVertex = Class.create(
// @PRIVATE 
{
	initialize : function() {
		this.size = 0;
		this.color = MoColor.Black.copy();
		this.position = MoVector2D.Zero();
	},

	toString : function() {
		return "position: " + this.position + ", size: " + this.size + ", color: " + this.color;
	}
});
