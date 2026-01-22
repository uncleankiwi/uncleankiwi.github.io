
//Note: RGB and HSV values all range from 0-1.
export class Colour {
	hex = "";
	r = 0;
	g = 0;
	b = 0;
	h = 0;
	s = 0;
	v = 0;
	constructor(hex) {
		this.hex = hex;
	}

	//step: how much the hue should be increased by.
	increment(step) {
		this.stringToRGB();
		this.convertToHSV();
		this.h += (step / 100);
		this.h %= 1;
		this.convertToRGB();
		this.RGBToString();
		return this.hex;
	}

	//Write the RGB values given the hex colour string.
	stringToRGB() {
		let decimal = parseInt(this.hex, 16);
		this.r = Math.floor(decimal / (255 * 255)) / 255;
		this.g = Math.floor((decimal % 255) / 255) / 255;
		this.b = (decimal % 255) / 255;
	}

	//Write RGB string.
	RGBToString() {
		this.hex = "#" + (this.r * 255).toString(16) +
			(this.g * 255).toString(16) +
			(this.b * 255).toString(16);
	}

	//Convert this object's RGB values into HSV.
	convertToHSV() {
		let max = Math.max(this.r, this.g, this.b);
		let min = Math.min(this.r, this.g, this.b);
		this.v = max;
		if (max === 0) {
			this.h = 0;
			this.s = 0;
		}
		else {
			this.s = 1 - min / max;
		}
		let rDiff = (max - this.r) / (max - min);
		let gDiff = (max - this.g) / (max - min);
		let bDiff = (max - this.b) / (max - min);
		if (this.r === max) {
			// noinspection PointlessArithmeticExpressionJS
			this.h = 0 + bDiff - gDiff;
		}
		else if (this.g === max) {
			this.h = 2 + rDiff - bDiff;
		}
		else {
			this.h = 4 + gDiff - rDiff;
		}
	}

	//Convert this object's HSV values back into RGB.
	convertToRGB() {
		let max = this.v;
		let min = max * (1 - this.s);
		let diff = (max - min) * (1 - Math.abs((this.h * 6) % 2 - 1));
		let otherColour = min + diff;
		if (h < 60/360) {
			this.r = max;
			this.g = otherColour;
			this.b = min;
		}
		else if (h < 120/360) {
			this.r = otherColour;
			this.g = max;
			this.b = min;
		}
		else if (h < 180/360) {
			this.r = min;
			this.g = max;
			this.b = otherColour;
		}
		else if (h < 240/360) {
			this.r = min;
			this.g = otherColour;
			this.b = max;
		}
		else if (h < 300/360) {
			this.r = otherColour;
			this.g = min;
			this.b = max;
		}
		else {
			this.r = max;
			this.g = min;
			this.b =otherColour;
		}
	}

}