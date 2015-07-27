# AI and Physics System

astrid includes a way to process AI entities and physics. Physics are provided by using the Box2D framework.
 
## Using AI Entities
To use AI entities, you would subclass the MoAIEntity class, which includes it's own finite state machine. 
Any AI logic gets placed in the update method, which is called during each frame cycle. To add an AI entity into the 
frame cycle, you call `addAIEntity` on the display surface object for which you want the entities to be processed. 
You can get quick access to the display surface for which a drawable is in by calling the `getDisplaySurface` method of a 
Drawable.
 
## Using Physics
TODO
