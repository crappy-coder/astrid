MoApplication.create(0, 0);

var g_elContainer;
var g_elUnavailable;
var g_elSlots;

function loadGamepads() {
	assignElements();
	
	if(MoGamepad.getIsAvailable())
	{
		hideElement(g_elUnavailable);

		setInterval(processInput, 1 / 60);
	}
	else
		hideElement(g_elSlots);
		
	showElement(g_elContainer);
}

function processInput() {
	
	for(var i = 1; i <= 4; ++i)
	{
		var state = MoGamepad.getState(i);
		var elName = "slot" + i;
		var el = document.getElementById(elName);
		
		if(MoIsNull(state))
		{
			hideElement(el);
			continue;
		}
		
		showElement(el);
		
		updateElement(elName, "name", state.getName());
		toggleActiveStatus(elName, "A", state.getA());
		toggleActiveStatus(elName, "B", state.getB());
		toggleActiveStatus(elName, "X", state.getX());
		toggleActiveStatus(elName, "Y", state.getY());
		toggleActiveStatus(elName, "Start", state.getStart());
		toggleActiveStatus(elName, "Back", state.getBack());
		toggleActiveStatus(elName, "Big", state.getBig());
		toggleActiveStatus(elName, "DPadUp", state.getDPadUp());
		toggleActiveStatus(elName, "DPadDown", state.getDPadDown());
		toggleActiveStatus(elName, "DPadLeft", state.getDPadLeft());
		toggleActiveStatus(elName, "DPadRight", state.getDPadRight());
		toggleActiveStatus(elName, "LeftShoulder", state.getLeftShoulder());
		toggleActiveStatus(elName, "LeftTrigger", state.getLeftTrigger());
		toggleActiveStatus(elName, "LeftStick", state.getLeftStick());
		toggleActiveStatus(elName, "RightShoulder", state.getRightShoulder());
		toggleActiveStatus(elName, "RightTrigger", state.getRightTrigger());
		toggleActiveStatus(elName, "RightStick", state.getRightStick());
		
		updateElementForProgress(elName, "LeftTriggerPercent", state.getLeftTriggerValue());
		updateElement(elName, "LeftTriggerAmount", "raw: " + MoMath.toPrecision(state.getLeftTriggerValue(true), 4));
		updateElement(elName, "LeftTriggerAmountFiltered", "filtered: " + MoMath.toPrecision(state.getLeftTriggerValue(), 4));
		
		updateElementForProgress(elName, "RightTriggerPercent", state.getRightTriggerValue());
		updateElement(elName, "RightTriggerAmount", "raw: " + MoMath.toPrecision(state.getRightTriggerValue(true), 4));
		updateElement(elName, "RightTriggerAmountFiltered", "filtered: " + MoMath.toPrecision(state.getRightTriggerValue(), 4));
		
		var leftStickValue = state.getLeftStickValue();
		var leftStickValueRaw = state.getLeftStickValue(true);
		var rightStickValue = state.getRightStickValue();
		var rightStickValueRaw = state.getRightStickValue(true);		
		
		updateElementForAxis(elName, "LeftStickAxes", state.getLeftStickValue());
		updateElement(elName, "LeftStickAmount", "raw: " + "x: " + MoMath.toPrecision(leftStickValueRaw.x, 4) + ", y: " + MoMath.toPrecision(leftStickValueRaw.y, 4));
		updateElement(elName, "LeftStickAmountFiltered", "filtered: " + "x: " + MoMath.toPrecision(leftStickValue.x, 4) + ", y: " + MoMath.toPrecision(leftStickValue.y, 4));

		updateElementForAxis(elName, "RightStickAxes", state.getRightStickValue());
		updateElement(elName, "RightStickAmount", "raw: " + "x: " + MoMath.toPrecision(rightStickValueRaw.x, 4) + ", y: " + MoMath.toPrecision(rightStickValueRaw.y, 4));
		updateElement(elName, "RightStickAmountFiltered", "filtered: " + "x: " + MoMath.toPrecision(rightStickValue.x, 4) + ", y: " + MoMath.toPrecision(rightStickValue.y, 4));
	}
}

function updateElementForProgress(name, subname, value) {
	var progress = "";
	var maxBarCount = 200;
	
	document.getElementById(name + "-" + subname).style.width = Math.round(maxBarCount * value) + "px";
}

function updateElementForAxis(name, subname, value) {
	var maxSize = 50;
	var x = ((value.x * maxSize) + maxSize) - 2.5;
	var y = ((value.y * maxSize) + maxSize) - 2.5;
	
	document.getElementById(name + "-" + subname).style.left = x + "px";
	document.getElementById(name + "-" + subname).style.top = y + "px";
}

function toggleActiveStatus(name, subname, value) {
	document.getElementById(name + "-" + subname).className = (value ? "active" : "inactive");
}

function updateElement(name, subname, value) {		
	document.getElementById(name + "-" + subname).innerHTML = value;
}

function assignElements() {
	g_elContainer = document.getElementById("container");
	g_elUnavailable = document.getElementById("api-unavailable");
	g_elSlots = document.getElementById("slots");
}

function showElement(el) {
	el.style.display = "block";
}

function hideElement(el) {
	el.style.display = "none";
}