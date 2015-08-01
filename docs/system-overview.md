This overview is intended to give a high level view of the various components and terminology that make up the the framework. The following graphic shows a simple view of the major components at play, we will briefly talk about each one in greater detail.

![System overview](https://sweay.fogbugz.com/default.asp?pg=pgDownload&pgType=pgWikiAttachment&ixAttachment=36&sFileName=sys-overview.png)


## Application

The Application is the core container and main class that runs your game or app. The first thing you need is a new instance of an Application, then add one or more display surfaces (DisplaySurface) and finally put it into a run mode. You can think of an application as a single web page or the main window of a native application.

The application instance is responsible for firing off various events like, frame, orientation change, motion change and render events, it is also responsible for triggering render operations. In normal operation, rendering occurs after the Layout Manager has finished but only if needed, for example, the Layout Manager may perform it's measuring, layout and property commits but never actually affect anything visually on the screen in which case the render operation will be skipped until it is needed, this greatly increases the performance of an application.


## Display Surface

A display surface is considered to have a one-to-one mapping with a physical HTML5 `<canvas />` element, generally to create a display surface you would call `DisplaySurface.fromCanvas(..)` and then add that display surface to your application. Multiple display surfaces are allowed within an application and each one can be paused and resumed at any given time. The primary role of a display surface is to not only have direct access to the underlying `<canvas />` element and rendering context but to also handle user input, compute dirty regions, setup clip rectangles and perform the main render operation for that display surface.

Multiple display surfaces can be very useful when you have multiple canvas elements on a single web page, for example, a custom web application may use individual display surfaces for rendering different content, like visual graphs. Each display surface is rendered independently from one another but are managed through a single application instance. Native applications typically only use a single display surface that represents the main window.

Each display surface contains it's own Input Manager, if an input event is triggered, each surface will first determine whether or not that event was originated from itself, for example, if a mouse down event occurs on some other area of the screen that is outside of a running display surface, you wouldn't want to get that event because it never actually occurred within the display surfaces bounding box.


## Input Manager

As mentioned above, each Display Surface has it's own Input Manager. The InputManager module is responsible for handling most user initiated events that occur within a surface, like mouse, keyboard and touch events. It is also responsible for maintaining focus to a drawable as well as routing these events to the correct drawable through the hit testing phase.

When an Input Manager receives an event, for example, a mouse down event, it will first determine whether the coordinates are within the bounds of it's managing display surface, if so the Input Manager will begin the hit testing phase by triggering a recursive test on the surface and returning the drawable for which the test succeeded.

Focus is also handled through the Input Manager. A drawable gains focus when the user clicks (or taps) on a drawable and that drawable will retain it's focus until either another drawable takes it away or until the entire display surface loses focus. Focusing a drawable is critical to routing keyboard events, when a drawable has focus it is also said to have keyboard focus, that is, all keyboard events will be sent to the drawable that currently has focus.

To receive mouse, keyboard and touch events at a more global level, you can simply add an event handler to the display surface that you want to listen for events on, because event's follow the same propagation rules as a traditional DOM, a focused drawable and a display surface will receive the same events.


## Drawable

A drawable is considered the lowest level of a visual object on the screen. Not only does a drawable render content, it also provides a mechanism for measurement, layout, property changes, bitmap caching, effects, animations and more. It is probably the single most important part of the entire framework. Each drawable maintains it's own graphics object and is responsible for determining whether it needs to be rendered during each frame cycle. The display surface itself is a drawable and not only can you render directly to a drawable via it's graphics but you can combine multiple drawables together to build a composite drawable. You can consider a drawable as a collection of other drawables, as a single visual component, or both.

Drawables can also be cached to improve performance using a technique known as bitmap caching. When a drawable is set to cache itself as a bitmap it renders itself to an external (in-memory) `<canvas />` element and is updated in the same way as non-cached drawables. However, the difference is that during each frame, a full render pass must occur, regardless if anything has changed or not, in most cases, we still perform all the drawing operations, while this is usually plenty fast enough for a drawable that is not within the currently computed clip region it still requires various checks, loops and calls into the native renderer. Bitmap caching solves this problem by simply blitting the entire contents of a drawable and skipping all recursion. This is helpful if you have a complex draw tree.

The rendering model of a drawable is deferred by the framework. When you draw to a drawables graphics object you are actually just sending a set of operations that need to be performed and are not drawing directly to the `<canvas />` element in real time. This helps with performance as the native renderer (be that the Web Browser or a native application) can make intelligent decisions on whether to batch commands and/or allow the GPU to cache various operations. Not only does this help with performance but it also allows us to perform additional tasks on the graphics operations submitted, for example, we use these operations to calculate the precise filled and stroked bounds of a drawable (this allows us to get accurate dirty regions), we also use these operations to perform line dashing (something not yet supported by the native canvas) as well as other various tasks.


## Layout Manager

The layout manager is also a very critical piece to the framework. This is a stand alone object that handles every drawable. When a drawable is invalidated by the system or by calling `requestMeasure`, `requestLayout` or `invalidateProperties`, that drawable is sent to the layout manager, during each frame cycle the layout manager determines whether or not any drawable has requested that it be validated and then performs a `commitProperties`, `measure` and/or `layout` call.

The three phases are key. The first phase is `commitProperties`, when setting properties on a drawable it doesn't make sense to immediately perform any state changes right away otherwise you risk performing the same task multiple times. Consider you have a drawable and you want to modify the position of it on-screen, if layout transformations and other work needed to happen anytime the `x` OR `y` coordinate changed, then calling `drawable.setX(100)` followed by a `drawable.setY(50)` would trigger that task twice. Instead, when `setX` or `setY` is called it simply calls `drawable.invalidateProperties()`, this tells the Layout Manager that the properties have changed and need to be validated, then during the commit properties phase (i.e. `drawable.commitProperties`) the drawable can run any tasks needed to position the drawable only once, thus reducing the number of calls to potentially very expensive tasks.

Property changes may also trigger another phase of the layout to occur. For example, if you change the size of a drawable, it may need to be re-measured. This brings us to the second phase, measurement, if a drawable has requested that it be measured (i.e. `drawable.requestMeasure`), then after the `commitProperties` phase has run it will call `drawable.measure()`, this is helpful when a drawable does not know what it's exact size is going to be, for example, if you call `drawable.setPercentWidth(100)` then whatever container that drawable is put into will be measured as percentage of it's parent's width. One thing to note is that even if you call `requestMeasure()`, you are not guaranteed that you will receive a `measure()` call, if you have explicitly set the size of a drawable then it makes sense to skip that phase since we already know what the exact size of that drawable should be.

Finally, the third phase, the layout. In most cases this is where you will handle arranging any children or providing your rendering content via the graphics object.

For a more in-depth discussion and examples of how the layout manager works, see: Layout, Measurement and Visual State Architecture.
