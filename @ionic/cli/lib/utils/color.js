"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = void 0;
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}
function expandHex(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
        return r + r + g + g + b + b;
    });
    return `#${hex.replace('#', '')}`;
}
function hexToRGB(hex) {
    hex = expandHex(hex);
    hex = hex.replace('#', '');
    const intValue = parseInt(hex, 16);
    return {
        r: (intValue >> 16) & 255,
        g: (intValue >> 8) & 255,
        b: intValue & 255,
    };
}
function hslToRGB({ h, s, l }) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    if (s === 0) {
        l = Math.round(l * 255);
        return {
            r: l,
            g: l,
            b: l,
        };
    }
    const hue2rgb = (p, q, t) => {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + (1 / 3));
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - (1 / 3));
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}
function mixColors(color, mixColor, weight = .5) {
    const colorRGB = color.rgb;
    const mixColorRGB = mixColor.rgb;
    const mixColorWeight = 1 - weight;
    return {
        r: Math.round(weight * mixColorRGB.r + mixColorWeight * colorRGB.r),
        g: Math.round(weight * mixColorRGB.g + mixColorWeight * colorRGB.g),
        b: Math.round(weight * mixColorRGB.b + mixColorWeight * colorRGB.b),
    };
}
function rgbToHex({ r, g, b }) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function rgbToHSL({ r, g, b }) {
    r = Math.max(Math.min(r / 255, 1), 0);
    g = Math.max(Math.min(g / 255, 1), 0);
    b = Math.max(Math.min(b / 255, 1), 0);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = Math.min(1, Math.max(0, (max + min) / 2));
    let d;
    let h;
    let s;
    if (max !== min) {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
        }
        else if (max === g) {
            h = (b - r) / d + 2;
        }
        else {
            h = (r - g) / d + 4;
        }
        h = h / 6;
    }
    else {
        h = s = 0;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}
function rgbToYIQ({ r, g, b }) {
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}
class Color {
    constructor(value) {
        this.contrast = (threshold = 128) => {
            return new Color((this.yiq && this.yiq >= threshold ? '#000' : '#fff'));
        };
        this.mix = (from, amount = .5) => {
            const base = from instanceof Color ? from : new Color(from);
            return new Color(mixColors(this, base, amount));
        };
        this.shade = (weight = .12) => {
            return this.mix({ r: 0, g: 0, b: 0 }, weight);
        };
        this.tint = (weight = .1) => {
            return this.mix({ r: 255, g: 255, b: 255 }, weight);
        };
        if (typeof (value) === 'string' && /rgb\(/.test(value)) {
            const matches = /rgb\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)/.exec(value);
            if (matches) {
                value = { r: parseInt(matches[0], 10), g: parseInt(matches[1], 10), b: parseInt(matches[2], 10) };
            }
        }
        else if (typeof (value) === 'string' && /hsl\(/.test(value)) {
            const matches = /hsl\((\d{1,3}), ?(\d{1,3}%), ?(\d{1,3}%)\)/.exec(value);
            if (matches) {
                value = { h: parseInt(matches[0], 10), s: parseInt(matches[1], 10), l: parseInt(matches[2], 10) };
            }
        }
        if (typeof (value) === 'string') {
            value = value.replace(/\s/g, '');
            this.hex = expandHex(value);
            this.rgb = hexToRGB(this.hex);
            this.hsl = rgbToHSL(this.rgb);
        }
        else if ('r' in value && 'g' in value && 'b' in value) {
            this.rgb = value;
            this.hex = rgbToHex(this.rgb);
            this.hsl = rgbToHSL(this.rgb);
        }
        else if ('h' in value && 's' in value && 'l' in value) {
            this.hsl = value;
            this.rgb = hslToRGB(this.hsl);
            this.hex = rgbToHex(this.rgb);
        }
        else {
            throw new Error('Invalid color');
        }
        this.yiq = rgbToYIQ(this.rgb);
    }
    static isColor(value) {
        if (/rgb\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)/.test(value)) {
            return true;
        }
        return /(^#[0-9a-fA-F]+)/.test(value.trim());
    }
    toList() {
        const { r, g, b } = this.rgb;
        return `${r},${g},${b}`;
    }
}
exports.Color = Color;
