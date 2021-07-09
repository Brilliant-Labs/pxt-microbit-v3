/**
 * Well known colors for a BLixel strip
 */
enum BLiXelColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}





/**
 * export functions to operate BLiXel strips.
 */
//% weight=400 
//% color=#9E4894 
//% icon="\uf110"
//% labelLineWidth=1001
//% advanced=true
namespace BLiXel {

    /**
     * Different modes for RGB or RGB+W BLiXel strips
    */
    enum BLiXelMode {
        //% block="RGB (GRB format)"
        RGB = 0,
        //% block="RGB+W"
        RGBW = 1,
        //% block="RGB (RGB format)"
        RGB_RGB = 2
    }


     let pin = clickIOPin.PWM; //The BLiX protocol uses virtual pin PWM on click 0 for BLiXels
    // let numBlixels = 5;


         /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, eg: 65535
         */
        //% blockId=BLiXel_show_bar_graph block="show bar graph of $value|up to $high"
        //% weight=300
        export function showBarGraph(value: number, high: number): void {
            if (high <= 0) {
                high = 0;
            }

            let blixBuffer = pins.createBuffer(4);
            blixBuffer.setNumber(NumberFormat.UInt16LE, 0, high)
            blixBuffer.setNumber(NumberFormat.UInt16LE, 2, value)
            
            bBoard_Control.BLiX(0,0,pin, moduleIDs.BLiXel_module_id, BLiXel_STRIP_BAR_GRAPH, null,blixBuffer,0)
            show();

            }

         /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="BLiXel_colour" block="show color $rgb=BLiXel_colors" blockGap=9
        //% weight=400 
        export function  showColour(rgb: number ) {

            let colourBuffer = pins.createBuffer(4);
            colourBuffer.setNumber(NumberFormat.UInt32LE, 0, rgb)
            
            bBoard_Control.BLiX(0,0,pin, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_COLOUR, null,colourBuffer,0)
            show();
  

        }
                 /**
         * Turn off all BLiXels
         * 
         */
        //% blockId="BLiXel_off" block="turn off BLiXels" blockGap=9
        //% weight=350
        export function  blixelsOff() {

            let colourBuffer = pins.createBuffer(4);
            colourBuffer.setNumber(NumberFormat.UInt32LE, 0, 0)
            
            bBoard_Control.BLiX(0,0,pin, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_COLOUR, null,colourBuffer,0)
            show();
  

        }

         /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the BLiXel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="BLiXel_set_pixel_colour" block="set pixel color at $pixeloffset|to $rgb=BLiXel_colors"
        //% blockGap=9
        //% advanced=true
        //% weight=200 
        export function setPixelColour(pixeloffset: number, rgb: number): void {

            let BLiXelBuffer = pins.createBuffer(5);
            if (pixeloffset >= 5)
            {
                pixeloffset = 4;
            }
            BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0, rgb)
            BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixeloffset)


            bBoard_Control.BLiX(0,0,pin, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null,BLiXelBuffer,0)
            
        }



       /**
   * Show all changes sent to the BLiXels
       * 
    */  
 //% blockId=bBoardBlixel_show
  //% block="show"
  //% advanced=true
        export function  show() {
      
                
                bBoard_Control.sendData(parseInt(pin.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)
      
    
        }

         /**
         * Turn off all LEDs.
         * 
         */
        //% blockId="BLiXel_clear" block="clear"
        //% advanced=true
        export function clear(): void {
            showColour(BLiXelColors.Black) 
        }

      

         /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="BLiXel_set_brightness" block="set brightness $brightness" 
        //% advanced=false
        //% weight=200 
        export function setBrightness(brightness: number): void {
           
            
            bBoard_Control.BLiX(0,0,pin, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_BRIGHTNESS, [brightness],null,0)
            

        }

    

   

        // /**
        //  * Shift LEDs forward and clear with zeros.
        //  * You need to call ``show`` to make the changes visible.
        //  * @param offset number of pixels to shift forward, eg: 1
        //  */
        // //% blockId="BLiXel_shift" block="shift pixels by $offset" blockGap=9
        // export function shift(offset: number = 1): void {
         
        // }

        // /**
        //  * Rotate LEDs forward.
        //  * You need to call ``show`` to make the changes visible.
        //  * @param offset number of pixels to rotate forward, eg: 1
        //  */
        // //% blockId="BLiXel_rotate" block="rotate pixels by $offset" blockGap=9
        // export function rotate(offset: number = 1): void {
  
        // }

 
     
    

    /**
    * Converts red, green, blue channels into a RGB color
    * @param red value of the red channel between 0 and 255. eg: 255
    * @param green value of the green channel between 0 and 255. eg: 255
    * @param blue value of the blue channel between 0 and 255. eg: 255
    */
    //% blockId="BLiXel_rgb" block="red %red|green %green|blue %blue"
    //% advanced=true
    export  function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

     /**
     * Gets the RGB value of a known color
     */
    //% blockGap=9
    //% blockId="BLiXel_colors" block="%color"
    //% advanced=true
    export  function colors(color: BLiXelColors): number {
        return color;
    }
    export function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    export function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    export function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    export function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

     /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=BLiXelHSL block="hue %h|saturation %s|luminosity %l"
    //% advanced=true
    export  function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60); //[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60); //[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8; //[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }
}