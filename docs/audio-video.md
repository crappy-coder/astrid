## Table of Contents
1. Introduction
1. Using Audio
1. Using Video
1. Supported Formats

## Introduction

astrid allows both audio and video playback through the use of the Audio and Video classes. Both of these classes 
implement the MediaBase, which provides the basic support for media playback, it exposes a number of playback related 
events that you can use for providing media controls and other media related functionality.
 
## Using Audio

You can playback audio either through the Audio class or the AudioManager class. Which one you use is your preference 
but both will accomplish the same task. The AudioManager allows you to add multiple audio sources and manage them all at 
once or individually. The Audio class, however, allows you to play a single audio source, you can have multiple audio 
sources playing at any given time.
 
Both Audio and AudioManager exposes methods to play, pause, stop, seek and resume playback of audio sources. 
In astrid, audio is represented by an audio source, not all platforms support the same audio formats, because of this, 
you can specify multiple audio sources with different formats and astrid will determine which one is the best to play, 
depending on the platform that your code is currently running on.
 
The following example shows how to play a simple wave file through the Audio class:

```js
// create the wave audio source
var source = new AudioSource("audio.wav", "wave");
// create the audio object
var audio = Audio.create("one", source);
// play it, true specifies that it should load the media
// right away
audio.play(true);
```
 
See the Audio module for more information.
 
## Using Video

TODO

## Supported Formats

TODO
