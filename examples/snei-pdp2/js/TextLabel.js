import { IsNull } from "../../../src/Engine";
import Label from "../../../src/ui/Label"
import TextAlignment from "../../../src/text/TextAlignment"
import SolidColorBrush from "../../../src/brushes/SolidColorBrush"
import ResourceManager from "./ResourceManager"

class TextLabel extends Label {
	constructor(name, fontName, resourceId) {
		super(name);

		if(!IsNull(fontName))
			this.setFont(ResourceManager.getFont(fontName));

		if(!IsNull(resourceId))
			this.setText(ResourceManager.getString(resourceId));

		switch(fontName)
		{
			case "tiny":
				this.setLineHeight(20);
				break;
			case "small":
				this.setLineHeight(44);
				break;
			case "normal":
				this.setLineHeight(48);
				break;
			case "large":
				this.setLineHeight(58);
				break;
			case "x-tiny":
				this.setLineHeight(16);
				break;
			case "x-small":
			case "x-small-medium":
				this.setLineHeight(38);
				break;
			case "x-large":
				this.setLineHeight(64);
				break;
			case "xx-small":
			case "xx-small-medium":
				this.setLineHeight(24);
				break;
			case "xx-large":
				this.setLineHeight(88);
				break;
		}
	}
}

export default TextLabel;