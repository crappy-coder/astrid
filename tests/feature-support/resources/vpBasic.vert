attribute vec4 position;
attribute vec2 textureCoord;

uniform mat4 mvpMatrix;

varying vec2 vTexCoord;

void main()
{
	gl_Position = position;
	vTexCoord = textureCoord;
}