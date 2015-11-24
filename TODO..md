# ASTRID TODO


## UI
* Support Padding in controls. Will act just like Margins do except the Padding is applied to the inner part of the control instead of outer.
* See about supporting Margins in the `DockPanel` control.
* Update `StackPanel` to allow for better margin support.
	* When orientation is Vertical, left and right margins can be applied as usual as well as the top margin. The 
	bottom margin would be applied after the panel has been measured with all of it's content, basically the last 
	child will have the margin applied.
	* When orientation is Horizontal, perform the same layout as Vertical orientation, except the top, bottom and left
	margins will be applied as usual and the right margin applied after full content measure.
* Support scrolling in the StackPanel.
* Add VirtualizingPanel control.
* Add VirtualizingStackPanel control.
* Add ScrollBar control.
* Add ScrollViewer control which would extend the ContentControl.
* Add a Button control.
* Add a TabPanel control.
* Support percentages for Shapes, for example, the ShapeLine can support percentages for the x1, y1, x2 and y2 properties, instead of explicit values.
* Support basic HTML formatting in Label.
* Add a TextView control which supports scrolling and HTML.
* Add a Grid control.
* Implement support for calculating more accurate text metrics.
* Support paragraph metrics in Label/Text controls. For example, Spacing before/after paragraphs, left/center/right align, justify last left/center/right, justify all...

