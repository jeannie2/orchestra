/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//does not accurately draw pitches more than 1000
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var recording = true; //added
var sourceNode = null;
var analyser = null;
var mediaStreamSource = null;
var detectorElem, //opacity of text
	//canvasElem, 
	pitchElem, 
	noteElem
	//detuneElem, 
	//detuneAmount; 
var music = true;
var last;
var x = 1;
var y = 1;
var width = $(window).width()

var canvas = document.getElementById("myCanvas"); 
canvas.width  = window.innerWidth;
var ctx = canvas.getContext("2d"); //create a drawing object QQ

//styles before draw
ctx.strokeStyle = "black";
ctx.lineWidth = 0.65;


window.onload = function() {
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/5000));	// corresponds to a 5kHz signal

	detectorElem = document.getElementById( "detector" ); 
	//canvasElem = document.getElementById( "output" ); 
	pitchElem = document.getElementById( "pitch" ); 
	noteElem = document.getElementById( "note" ); 
	//detuneElem = document.getElementById( "detune" );
	//detuneAmount = document.getElementById( "detune_amt" );
} 


function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
		navigator.getUserMedia(dictionary, callback, error);
		console.log("running function getusermedia") //added
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
	updatePitch();
	console.log("running functions gotstream and updatePitch") //added
}


//toggle record button
function hideOnClk(id){
	if(id == "start"){
	  document.getElementById("stop").style.display="block";
	  document.getElementById(id).style.display="none";
	}else{
	  document.getElementById("start").style.display="block";
	  document.getElementById(id).style.display="none"; 
	 return recording === false; //added. if press stop, then click allow audio, still runs. issue with toggle options after click stop
	 
 }
}

//DRAWING//
function drawing() {
	var roundedpitch = Math.round(pitch)

       if(pitch !== last) { //only draw if there is a sound
           checker()
           if(music) { //left to right
			   console.log("music is " + music)
               //console.log("X: " + x + ", PITCH: " + roundedpitch);
			 
			   if(roundedpitch > 500 && roundedpitch <= 1000) { 
                ctx.lineTo(x, 640 - 500 - (0.14 * roundedpitch)) 
                ctx.stroke(); 
             	console.log("x:" + x  + ", pitch: " + roundedpitch + ", Y value: " + (640 - 500 - Math.round((0.14 * roundedpitch))) + ", pitch more than 500 less than 1000")
                x++
			    last = roundedpitch;
             	}   
			 
			   else if (roundedpitch <= 500) {
               ctx.lineTo(x, 640 - roundedpitch)  
               ctx.stroke(); 
               console.log("x:" + x  + ", pitch: " + roundedpitch + ", Y value: " + (640 - roundedpitch) + ", pitch less than or equal to 500")
               x++ 
               last = roundedpitch;
			   }
			 
			   //still draw even if pitch > 1000, draw to same value as pitch = 1000 (max y value)
			   else if (roundedpitch > 1000) {
			    ctx.lineTo(x, 0)
			    ctx.stroke(); 
				console.log("x:" + x  + ", pitch: " + roundedpitch + " , pitch more than 1000 so plotted to max Y value")
				x++
				last = roundedpitch;
			 	} 
			 } //music
			 //right to left, music false
             else {
				 console.log("music is " + music)
				
			   if(roundedpitch > 500 && roundedpitch <= 1000) { 
				ctx.lineTo(x, 640 - 500 - (0.14 * roundedpitch)) 
				ctx.stroke(); 
				console.log("x:" + x  + ", pitch: " + roundedpitch + ", Y value: " + (640 - 500 - Math.round((0.14 * roundedpitch))) + ", pitch more than 500 less than 1000")
				x--
				last = roundedpitch;
				}   

				else if (roundedpitch <= 500) {
				ctx.lineTo(x, 640 - roundedpitch)  
				ctx.stroke(); 
				console.log("x:" + x  + ", pitch: " + roundedpitch + ", Y value: " + (640 - roundedpitch) + ", pitch less than or equal to 500")
				x--
				last = roundedpitch;
				}

				//still draw even if pitch > 1000, draw to same value as pitch = 1000 (max y value)
				else if (roundedpitch > 1000) {
				ctx.lineTo(x, 0)
				ctx.stroke(); 
				console.log("x:" + x  + ", pitch: " + roundedpitch + " , pitch more than 1000 so plotted to max Y value")
				x--
				last = roundedpitch;
				 } 
			   
			 }
			 
			//drawing direction 
           function checker() {
             if (x === width) { //if x at max width
                 music = false; 
             } else if (x === 0) { //if x at start 
                 music  = true;
             }
             }
     
         } 
           //else {
              //console.log("pitch is same as last") //draws horizontal if same
		  //}
		}


function toggleLiveInput(id) {
	if(recording) { //added
     if (isPlaying) {
		console.log("console toggleLiveInput function isPlaying") //added
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
	}
	
    getUserMedia(
    	{
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
		}, gotStream);
		
//added from togglePlayback. need all code? QQ
	sourceNode = audioContext.createBufferSource();
    //sourceNode.buffer = theBuffer;
    sourceNode.loop = true;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    sourceNode.start( 0 );
    isPlaying = true;
    isLiveInput = false;
    updatePitch();
	//return "stop";
	//added from togglePlayback
	} 
	else {  //if recording is false
	console.log("recording false")
	return; //added
	}
} 

var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array( buflen );

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
	return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}


var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}

function updatePitch( time ) {
	var cycles = new Array;
	analyser.getFloatTimeDomainData( buf );
	var ac = autoCorrelate( buf, audioContext.sampleRate );
	

 	if (ac == -1) {  //wont console.log this part
 		detectorElem.className = "vague"; 
		 pitchElem.innerText = "--";  
		 //console.log("pitch  ---")//added
		noteElem.innerText = "-"; 
		//console.log("note  ---")//added 
		//console.log("detuneAmount --")//removed or else continuously logged after press stop recording
		//detuneElem.className = "";
		//detuneAmount.innerText = "--";
	 } 
	 else {
	 	detectorElem.className = "confident"; 
         pitch = ac;
		 pitchElem.innerText = Math.round( pitch ) ; 
		 //console.log("pitch " + Math.round( pitch )) //no need log twice
         var note =  noteFromPitch( pitch );
		noteElem.innerHTML = noteStrings[note%12]; 
		console.log("note " + noteStrings[note%12]) 
		var detune = centsOffFromPitch( pitch, note ); 
		drawing();

		if (detune == 0 ) {
			//detuneElem.className = "";
			//detuneAmount.innerHTML = "--";
			console.log("detune = 0, detuneAmount is " + "--")//added. seems rarely printed
		} else {
			if (detune < 0) {
				//detuneElem.className = "flat";
				console.log("detune < 0, flat")
			}
			else {
				//detuneElem.className = "sharp";
				console.log("detune > 0,  sharp")
                console.log("detuneAmount is " + Math.abs(detune)) //added 
				//detuneAmount.innerHTML = Math.abs( detune );
			}
            
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
		//console.log("console window.requestanimationframe") //added
	rafID = window.requestAnimationFrame( updatePitch );
}



