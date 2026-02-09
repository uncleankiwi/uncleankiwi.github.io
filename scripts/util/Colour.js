//Note: RGB and HSV values all range from 0-1.
export class Colour {
    constructor(colourString) {
        this.raw = "";
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.h = 0;
        this.s = 0;
        this.v = 0;
        this.raw = colourString;
        this.stringToRGB();
        this.convertToHSV();
    }
    //step: how much the hue should be increased by.
    increment(step) {
        this.h += (step / 100);
        this.h %= 1;
        this.convertToRGB();
        this.RGBToString();
        return this.raw;
    }
    //Write the RGB values given the rgb(xx, yy, zz) input string.
    stringToRGB() {
        [this.r, this.g, this.b] = this.raw.match(/\d+/g).map(Number);
        this.r /= 255;
        this.g /= 255;
        this.b /= 255;
    }
    //Write RGB string.
    RGBToString() {
        this.raw = `rgb(${Math.floor(this.r * 255)},${Math.floor(this.g * 255)},${Math.floor(this.b * 255)})`;
        // 	this.raw = "#" + Math.floor(this.r * 255).toString(16) +
        // 		Math.floor(this.g * 255).toString(16) +
        // 		Math.floor(this.b * 255).toString(16);
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
        if (this.h < 60 / 360) {
            this.r = max;
            this.g = otherColour;
            this.b = min;
        }
        else if (this.h < 120 / 360) {
            this.r = otherColour;
            this.g = max;
            this.b = min;
        }
        else if (this.h < 180 / 360) {
            this.r = min;
            this.g = max;
            this.b = otherColour;
        }
        else if (this.h < 240 / 360) {
            this.r = min;
            this.g = otherColour;
            this.b = max;
        }
        else if (this.h < 300 / 360) {
            this.r = otherColour;
            this.g = min;
            this.b = max;
        }
        else {
            this.r = max;
            this.g = min;
            this.b = otherColour;
        }
    }
}
