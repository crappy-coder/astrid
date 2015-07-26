import MediaState from "./MediaState";
import Timer from "../Timer";
import TimerEvent from "../TimerEvent";
import { ValueOrDefault, DebugWrite, DebugLevel } from "../Engine";
import Event from "../Event";
import ErrorEvent from "../ErrorEvent";
import MediaEvent from "./MediaEvent";

/****************************************************************************
** Subclasses must implement the EventDispatcher class to provide
** support for the following events:
**  - onEnded
**  - onError
**  - onStateChange
**  - onOpened
**
****************************************************************************/

var MediaBase = {

/**
 * @MIXIN
 *
 * SUMMARY:
 *	Base mixin for all objects that participate in media playback.
 *
 * REMARKS:
 *  This mixin must be added to a class that inherits from EventDispatcher
 *  otherwise events will fail to dispatch
 *
 */

	initializeMedia : function(sourceElement) {
		this.availableSources = [];
		this.currentSourceIndex = -1;
		this.currentSuspendRetryCount = 0;
		this.currentState = MediaState.Closed;
		this.sourceElement = sourceElement;
		this.autoPlayEnabled = false;
		this.loopingEnabled = false;
		this.wasStopRequested = false;
		this.isPendingPlay = false;
		this.isPendingPause = false;
		this.isPendingStop = false;
		this.isPendingSeek = false;
		this.isReady = false;
		this.naturalDuration = 0;
		this.seekPosition = 0;

		this.frameUpdateTimer = new Timer(MediaBase.FRAME_UPDATE_INTERVAL);
		this.frameUpdateTimer.addEventHandler(TimerEvent.TICK, this.frameUpdateTimerTick.asDelegate(this));
		
		this.initializeSourceElement();
	},

	getIsReady : function() {
		return this.isReady;
	},

	getIsPlaying : function() {
		return (this.getCurrentState() == MediaState.Playing);
	},

	getAutoPlay : function() {
		return this.autoPlayEnabled;
	},
	
	setAutoPlay : function(value) {
		this.autoPlayEnabled = value;
	},
	
	getLoop : function() {
		return this.loopingEnabled;
	},
	
	setLoop : function(value) {
		this.loopingEnabled = value;
	},
	
	getDefaultPlaybackSpeed : function() {
		return this.sourceElement.defaultPlaybackRate;
	},
	
	setDefaultPlaybackSpeed : function(value) {
		this.sourceElement.defaultPlaybackRate = value;
	},
	
	getPlaybackSpeed : function() {
		return this.sourceElement.playbackRate;
	},
	
	setPlaybackSpeed : function(value) {
		this.sourceElement.playbackRate = value;
	},
	
	getMuted : function() {
		return this.sourceElement.muted;
	},
	
	setMuted : function(value) {
		this.sourceElement.muted = value;
	},
	
	getVolume : function() {
		return this.sourceElement.volume;
	},

	setVolume : function(value) {
		this.sourceElement.volume = value;
	},

	getNaturalDuration : function() {
		return this.naturalDuration;
	},
	
	getCurrentPosition : function() {
		return this.sourceElement.currentTime;
	},

	addSource : function(source) {
		this.availableSources.push(source);
	},
	
	clearSources : function() {
		this.availableSources.clear();
		this.currentSourceIndex = -1;
	},

	getSourceAt : function(index) {
		return this.availableSources[index];
	},
	
	getSourceCount : function() {
		return this.availableSources.length;
	},

	getCurrentSource : function() {
		if(this.currentSourceIndex == -1)
			return null;
		
		return this.availableSources[this.currentSourceIndex];
	},

	getCurrentState : function() {
		return this.currentState;
	},

	setCurrentState : function(newState) {
		if(this.currentState != newState)
		{
			this.currentState = newState;
			this.raiseStateChangeEvent();
		}
	},
	
	getSourceElement : function() {
		return this.sourceElement;
	},

	initializeSourceElement : function() {
		this.initializeSourceElementImpl();
	},

	initializeSourceElementImpl : function() {
		this.sourceElement.autoplay = false;
		this.sourceElement.preload = "metadata";

		this.sourceElement.addEventListener("loadstart", this.handleLoadStartEvent.bind(this), false);
		this.sourceElement.addEventListener("loadedmetadata", this.handleLoadedMetadataEvent.bind(this), false);
		this.sourceElement.addEventListener("loadeddata", this.handleLoadedDataEvent.bind(this), false);
		this.sourceElement.addEventListener("canplay", this.handleCanPlayEvent.bind(this), false);
		this.sourceElement.addEventListener("pause", this.handlePauseEvent.bind(this), false);
		this.sourceElement.addEventListener("playing", this.handlePlayingEvent.bind(this), false);
		this.sourceElement.addEventListener("abort", this.handleAbortEvent.bind(this), false);
		this.sourceElement.addEventListener("ended", this.handleEndedEvent.bind(this), false);
		this.sourceElement.addEventListener("durationchange", this.handleDurationChangeEvent.bind(this), false);
		this.sourceElement.addEventListener("seeked", this.handleSeekedEvent.bind(this), false);
		this.sourceElement.addEventListener("suspend", this.handleSuspendEvent.bind(this), false);
		this.sourceElement.addEventListener("error", this.handleErrorEvent.bind(this), false);
	},

	play : function(loadMedia) {
		loadMedia = ValueOrDefault(loadMedia, false);

		if(loadMedia)
			this.load();

		this.resetPendingRequests();
		this.isPendingPlay = true;
		this.processPendingRequests();
	},
	
	playImpl : function() {
		this.isPendingPlay = false;
		this.sourceElement.play();
	},

	stop : function() {
		this.resetPendingRequests();
		this.isPendingStop = true;
		this.processPendingRequests();
	},
	
	stopImpl : function() {
		this.isPendingStop = false;

		this.wasStopRequested = true;
		this.seek(0);

		// the audio is already in a paused state, so just change
		// the state to stop, no need to call pause again
		if(this.getCurrentState() == MediaState.Paused)
		{
			this.wasStopRequested = false;
			this.setCurrentState(MediaState.Stopped);
		}
		else
		{
			this.pauseImpl();
		}
	},
	
	pause : function() {	
		this.resetPendingRequests();
		this.isPendingPause = true;
		this.processPendingRequests();
	},

	pauseImpl : function() {
		this.isPendingPause = false;
		this.sourceElement.pause();
	},

	seek : function(position) {
		this.isPendingSeek = true;
		this.seekPosition = position;
		this.processPendingRequests();
	},

	seekImpl : function(position) {
		this.isPendingSeek = false;
		this.seekPosition = 0;
		this.sourceElement.currentTime = position;
		
		if(this.getCurrentState() == MediaState.Stopped)
			this.sourceElement.pause();
	},

	load : function() {
		if(this.availableSources.length == 0)
			return;

		// find the best source to use
		var len = this.getSourceCount();
		var source = null;
		var canPlayResult = "";
		var bestSourceIndex = -1;

		for(var i = 0; i < len; ++i)
		{
			source = this.getSourceAt(i);
			
			if(source == null)
				continue;
			
			canPlayResult = this.sourceElement.canPlayType(source.toString());
			
			// this is the best available source, no need to keep checking the remaining sources
			if(canPlayResult == "probably")
			{
				bestSourceIndex = i;
				break;
			}

			// this is a possiblity, but we still need to keep checking all the remaining 
			// sources, if we end up not finding a better source then we should only use 
			// the first "maybe"
			if(canPlayResult == "maybe" && bestSourceIndex == -1)
				bestSourceIndex = i;
		}

		// could not find a source to use
		if(bestSourceIndex == -1)
		{
			DebugWrite("Unable to find a compatible media source.", DebugLevel.Warning);
			return;
		}

		// now start loading the media source
		this.isReady = false;
		this.currentSuspendRetryCount = 0;
		this.currentSourceIndex = bestSourceIndex;
		this.sourceElement.src = this.getCurrentSource().getUrl();
		this.sourceElement.load();
	},
	
	resetPendingRequests : function() {
		this.isPendingPause = false;
		this.isPendingPlay = false;
		this.isPendingStop = false;
	},
	
	processPendingRequests : function() {
		// do not process anything if the media is not yet ready
		if(!this.isReady)
			return;
		
		// if we have a pending seek then do that first
		if(this.isPendingSeek)
			this.seekImpl(this.seekPosition);

		if(this.isPendingStop)
			this.stopImpl();
		else if(this.isPendingPause)
			this.pauseImpl();
		else if(this.isPendingPlay)
			this.playImpl();
	},

	handleErrorEvent : function(evt) {
		var errorCode = this.sourceElement.error.code;
		var errorMessage = MediaBase.getErrorMessageFromCode(errorCode);
		var source = this.getCurrentSource();

		DebugWrite("#{0} url: '#{1}', code: #{2}", DebugLevel.Error, errorMessage, (source == null ? "Unknown" : source.getUrl()), errorCode);

		this.dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, errorCode, errorMessage));
	},
	
	handleSuspendEvent : function(evt) {
		// during a load the media can get suspended without receiving all of
		// it's data and thus not sending the 'canplay' event that we need to
		// get things all setup and ready, so if this happens, just try to load
		// the media again and if the retry count is exceeded then just fail
		if(!this.isReady && this.sourceElement.readyState <= this.sourceElement.HAVE_CURRENT_DATA)
		{
			if(this.currentSuspendRetryCount++ < MediaBase.MAX_SUSPEND_RETRY_COUNT)
				this.sourceElement.load();
		}
	},

	handleLoadStartEvent : function(evt) {
		this.setCurrentState(MediaState.Opening);
	},

	handleLoadedMetadataEvent : function(evt) {
		this.setCurrentState(MediaState.Buffering);
		this.frameReady();
	},

	handleLoadedDataEvent : function(evt) {
		this.raiseOpenedEvent();
	},

	handleCanPlayEvent : function(evt) {
		// we only want to run this if it's the first time a canplay has 
		// been fired since we've set a media source
		if(this.isReady)
			return;

		if(this.autoPlayEnabled)
			this.play();
		else
			this.setCurrentState(MediaState.Paused);

		this.isReady = true;
		this.frameReady();
		this.processPendingRequests();
	},

	handlePauseEvent : function(evt) {
		var newState = (this.wasStopRequested ? MediaState.Stopped : MediaState.Paused);
		
		this.wasStopRequested = false;
		this.setCurrentState(newState);
	},

	handlePlayingEvent : function(evt) {
		this.setCurrentState(MediaState.Playing);
		this.frameUpdateTimer.start();
	},
	
	handleSeekedEvent : function(evt) {
		// ensure that any implementors update their current frame, we
		// do this here because the update timer may or may not be running
		// and there is no harm even if it is running
		this.frameUpdate();
	},

	handleDurationChangeEvent : function(evt) {
		this.naturalDuration = this.sourceElement.duration;
	},

	handleAbortEvent : function(evt) {
		this.setCurrentState(MediaState.Closed);
		this.frameUpdateTimer.stop();
		
		this.dispatchEvent(new ErrorEvent(
			ErrorEvent.ERROR,
			MediaBase.ERR_ABORTED,
			MediaBase.getErrorMessageFromCode(MediaBase.ERR_ABORTED)));
	},

	handleEndedEvent : function(evt) {
		if(this.getLoop())
		{
			this.sourceElement.currentTime = 0;
			return;
		}

		this.frameUpdateTimer.stop();
		this.currentSuspendRetryCount = 0;
		this.setCurrentState(MediaState.Stopped);
		this.raiseEndedEvent();
	},
	
	frameReady : function() {
		/** override **/
	},

	frameUpdate : function() 
	{ 
		/** override **/
	},

	frameUpdateTimerTick : function(event) {
		this.frameUpdate();
	},
	
	raiseOpenedEvent : function() {
		this.dispatchEvent(new MediaEvent(MediaEvent.OPENED));
	},
	
	raiseEndedEvent : function() {
		this.dispatchEvent(new MediaEvent(MediaEvent.ENDED));
	},
	
	raiseStateChangeEvent : function() {
		this.dispatchEvent(new Event(Event.CHANGE));
	},

	FRAME_UPDATE_INTERVAL : 50,
	MAX_SUSPEND_RETRY_COUNT : 5,

	ERR_ABORTED		: 1,
	ERR_NETWORK		: 2,
	ERR_DECODE		: 3,
	ERR_SRC_BAD		: 4,

	ERR_ABORTED_MSG	: "User aborted the playback.",
	ERR_NETWORK_MSG	: "Unable to read from stream, general network error.",
	ERR_DECODE_MSG	: "Unable to decode the media or a bad frame found.",
	ERR_SRC_BAD_MSG	: "Unable to find a suitable media format for playback or the media was not found.",

	getErrorMessageFromCode : function(code) {
		switch(code)
		{
			case MediaBase.ERR_ABORTED:
				return MediaBase.ERR_ABORTED_MSG;
			case MediaBase.ERR_NETWORK:
				return MediaBase.ERR_NETWORK_MSG;
			case MediaBase.ERR_DECODE:
				return MediaBase.ERR_DECODE_MSG;
			case MediaBase.ERR_SRC_BAD:
				return MediaBase.ERR_SRC_BAD_MSG;
		}

		return "An unknown error occured.";
	}
};

export default MediaBase;
