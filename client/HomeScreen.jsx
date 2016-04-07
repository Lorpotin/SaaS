var React = require('react');
var letters_pink = null, 
	letters_blue = null, 
	sMessage = "", 
	canvas = null, 
	ctx = null, 
	iStep = 0, 
	iDrawPhase = 0, 
	job = null, 
	iSpriteCol = null,
	iSpriteRow = null,
	LETTER_HEIGHT = 350, 
	LETTER_WIDTH = 266.7, 
	iStopPoint = null,
	bPink = true;

var HomeScreen = React.createClass({

	showStuff: function() {
        let $this = this;
        canvas = document.getElementById("canvas");
 		ctx = canvas.getContext("2d");
        letters_pink = new Image();
		letters_pink.src = "client/images/letters-pink.jpg";
		letters_pink.onload = $this.startAnim();
    },

    startAnim: function() {
    	let $this = this;
		clearInterval(job);
		iDrawPhase = 0;
		iStep = 0;
		sMessage = "KULLI KULLI KULLI KULLI KULLI";
		// Add 5 spaces padding so the text start off right
		sMessage = "    " + sMessage;
		// Start the timer
		job = setInterval($this.draw, 150);

	},

	drawLetter: function(iSpriteRow, iSpriteCol,  iPos) {

		var xPos = (LETTER_WIDTH * iPos) - iStep;

		
		if ((xPos > 0 - LETTER_WIDTH) && (xPos < 900 + LETTER_WIDTH)) {
				ctx.drawImage(letters_pink, iSpriteCol * LETTER_WIDTH, iSpriteRow, LETTER_WIDTH, LETTER_HEIGHT, xPos, 0, LETTER_WIDTH, LETTER_HEIGHT);
		}

	},

	draw: function() {
		let $this = this;
		var iCounter = 0, 
		iCharCode = 0;

		for ( iCounter = 0; iCounter < sMessage.length; iCounter++) {

			iCharCode = sMessage.charCodeAt(iCounter);

			if (iCharCode > 64 && iCharCode < 91) {
				iSpriteCol = Math.abs(65 - iCharCode) ;
				iSpriteRow = 0;
			} else {
				iSpriteCol = 26;
				iSpriteRow = 0;	
			}

			$this.drawLetter(iSpriteRow, iSpriteCol, iCounter);
		}

		iSpriteCol = 1;
		iSpriteRow = 5;

		for (iCounter; iCounter < sMessage.length + 10; iCounter++) {

			$this.drawLetter(iSpriteCol, iSpriteRow, iCounter);
		}

		iDrawPhase += 1;
		iStopPoint = (27 * sMessage.length);

		if (iDrawPhase < iStopPoint) {
			iStep += 38.2;
		} 

	},

	componentDidMount: function() {
		let $this = this;
  		React.render(
  			<div>
                <canvas id="canvas" width="900" height="400"></canvas>
            </div>,
  		document.getElementById('container')
  		);

		$this.showStuff();


	},


    render: function() {
		return (
			<div id="container"></div>
		);
	}



});

module.exports = HomeScreen;