/**
 * Well known colours for a BLixel strip
 */
enum BLiXelcolours {
    //% block=red
    //% block.loc.fr=rouge
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
 * Well known colours for a BLixel strip
 */
enum BLiXelIndex {
    //% block=1
    one = 0,
    //% block=2
    two = 1,
    //% block=3
    three = 2,
    //% block=4
    four = 3,
    //% block=5
    five = 4
  
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
    
    let currentBLiXelBuffer = pins.createBuffer(5*3);
    let currentColour:BLiXelcolours = null
    let currentBrightness = 100
   blixelsOff(); //Need to set all BLiXels to off whenever we start up to avoid reprogramming micro:bit but BLiXels still on on b.Board from old code
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


     
//     // let numBlixels = 5;


         /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param max maximum value, eg: 100
         * @param min maximum value, eg: 0
         */
        //% blockId=BLiXel_show_bar_graph 
        //% block="show BLiXel bar graph of variable $value|with max value $max ||min value $min"
        //% block.loc.fr="montrer BLiXel diagramme à barres de la variable $value|avec valeur max $max ||valeur min $min"
        //% weight=300
        //% min.defl=0
        //% expandableArgumentMode="toggle"
        export function showBarGraph(value: number, max: number, min?:number): void {
 
            //TODO: Make change on BLiX to allow minimum signed value
            let dynamicRange = max - min
            if(value < min)
            {
                value = min
            }
            if (value>max)
            {
                value = max
            }
            let blixelsToLight = Math.round(MAX_BBOARD_BLIXELS*((value-min)/dynamicRange))
            //let blixBuffer = pins.createBuffer(4);
            //blixBuffer.setNumber(NumberFormat.UInt16LE, 0, max)
            //blixBuffer.setNumber(NumberFormat.UInt16LE, 2, value)
            if(!currentColour) //If a current colour has not been set
            {
                currentColour = BLiXelcolours.Purple
                showColour(currentColour)
            }
            let red = (unpackR(currentColour)*currentBrightness)>>8;
            let green = (unpackG(currentColour)*currentBrightness)>>8;
            let blue = (unpackB(currentColour)*currentBrightness)>>8;

            
            for(let i =0;i<MAX_BBOARD_BLIXELS;i++)
            {
                if(i>=(blixelsToLight))
                {
                    currentBLiXelBuffer.fill(0,i*3)
                    break;
                }
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3,red)
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3+1,green)
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3+2,blue)
            }
            sendBLiXelBuffer(currentBLiXelBuffer)
           // bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_BAR_GRAPH, null,blixBuffer,0)
            show();

            }
           const MAX_BBOARD_BLIXELS = 5
         /**
         * Shows all LEDs to a given colour (range 0-255 for r, g, b).
         * @param rgb RGB colour of the LED
         */
        //% blockId="BLiXel_colour" 
        //% block="set all BLiXels to $rgb=BLiXel_colours" blockGap=9
        //% block.loc.fr="définir tous BLiXels à $rgb=BLiXel_colours"
        //% rgb.shadow="colorNumberPicker"
        //% weight=400 
        export function  showColour(rgb: number ) {

            let colourBuffer = pins.createBuffer(4);
            colourBuffer.setNumber(NumberFormat.UInt32LE, 0, rgb)
            for(let i=0; i<MAX_BBOARD_BLIXELS;i++)
            {
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3,(rgb&0xFF0000)>>16)
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3+1,(rgb&0xFF00)>>8)
                currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,i*3+2,rgb&0xFF)
            }
            currentColour = rgb;
            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_COLOUR, null,colourBuffer,0)
            show();
  

        }
                 /**
         * Turn off all BLiXels
         * 
         */
        //% blockId="BLiXel_off" 
        //% block="turn off all BLiXels" 
        //% block.loc.fr="fermer tous les BLiXels" 
        //% blockGap=9
        //% weight=10
        export function  blixelsOff() {

            let colourBuffer = pins.createBuffer(4);
            colourBuffer.setNumber(NumberFormat.UInt32LE, 0, 0)
            currentBLiXelBuffer.fill(0)
            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_COLOUR, null,colourBuffer,0)
            show();
  

        }

          /**
     * Gets the index of a BLiXel
     */
    //% blockGap=9
    //% blockId="BLiXel_Index" 
    //% block="%index"
    //% block.loc.fr="%index"
    //% blockHidden=true 
    //% advanced=true
      export function blixel_index(index: BLiXelIndex): number {
        return index;
    }


         /**
         * Set LED to a given colour (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the BLiXel in the strip
         * @param rgb RGB colour of the LED
         */
        //% blockId="BLiXel_set_pixel_colour" 
        //% block="set BLiXel $pixeloffset=BLiXel_Index to $rgb=BLiXel_colours"
        //% block.loc.fr="définir BLiXel $pixeloffset=BLiXel_Index to $rgb=BLiXel_colours"
        //% blockGap=9
        //% rgb.shadow="colorNumberPicker"
        //% advanced=false
        //% weight=200 
        export function setPixelColour(pixeloffset: number, rgb: number): void {

            let BLiXelBuffer = pins.createBuffer(5);
            if (pixeloffset >= 5)
            {
                pixeloffset = 4;
            }
            BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0, rgb)
            BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixeloffset)
            currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,pixeloffset*3,(rgb&0xFF0000)>>16)
            currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,pixeloffset*3+1,(rgb&0xFF00)>>8)
            currentBLiXelBuffer.setNumber(NumberFormat.UInt8LE,pixeloffset*3+2,rgb&0xFF)

            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null,BLiXelBuffer,0)
            show();
        }



       /**
   * Show all changes sent to the BLiXels
       * 
    */  
 //% blockId=bBoardBlixel_show
  //% block="show"
  //% block.loc.fr="montrer"
  //% advanced=true
        export function  show() {
      
                
                bBoard_Control.sendData(parseInt(clickIOPin.PWM.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)
      
    
        }

//          /**
//          * Turn off all LEDs.
//          * 
//          */
//         //% blockId="BLiXel_clear" block="clear"
//         //% advanced=true
//          function clear(): void {
//             currentBLiXelBuffer.fill(0)
//             showColour(BLiXelcolours.Black) 
//         }

      
    /**
      * Get the BLiXel Index
      * @param BLiXelIndex BLiXel pixel number (1 is leftmost, 5 is rightmost), eg: 1, 5
      */
    //% blockId=BLiXelPicker block="%BLiXelIndex"
    //% blockHidden=true 
    //% colorSecondary="#FFFFFF"
    //% BLiXelIndex.fieldEditor="numberdropdown" BLiXelIndex.fieldOptions.decompileLiterals=true
    //% BLiXelIndex.fieldOptions.data='[["1, 0], ["2", 1], ["3", 2], ["4", 3], ["5", 4]]'
    export function __BLiXelPicker(BLiXelIndex: number): number {
        return BLiXelIndex;
    }



         /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-100. eg: 50
         */
        //% blockId="BLiXel_set_brightness" 
        //% block="set brightness $brightness" 
        //% block.loc.fr="définir la luminosité $brightness"
        //% advanced=false
        //% brightness.min=0 brightness.max=100
        //% weight=200 
        export function setBrightness(brightness: number): void {
           
            currentBrightness = Math.min(Math.max(Math.round(brightness *2.55),0),255)

            sendBLiXelBuffer(currentBLiXelBuffer)
            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_BRIGHTNESS, [currentBrightness],null,0)
            show()

        }

    

   
        function sendBLiXelBuffer(blixelBuffer:Buffer)
        {

            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_WRITE_BUFFER_DATA, null,blixelBuffer,0)
        }
        // /**
        //  * Shift LEDs forward and clear with zeros.
        //  * You need to call ``show`` to make the changes visible.
        //  * @param offset number of pixels to shift forward, eg: 1
        //  */
        // //% blockId="BLiXel_shift" block="shift pixels by $offset" blockGap=9
        // export function shift(offset: number = 1): void {
         
        // }

//         // /**
//         //  * Rotate LEDs forward.
//         //  * You need to call ``show`` to make the changes visible.
//         //  * @param offset number of pixels to rotate forward, eg: 1
//         //  */
//         // //% blockId="BLiXel_rotate" block="rotate pixels by $offset" blockGap=9
//         // export function rotate(offset: number = 1): void {
  
//         // }

 
     
    

    /**
    * Converts red, green, blue channels into a RGB colour
    * @param red value of the red channel between 0 and 255. eg: 255
    * @param green value of the green channel between 0 and 255. eg: 255
    * @param blue value of the blue channel between 0 and 255. eg: 255
    */
    //% blockId="BLiXel_rgb" 
    //% block="red %red|green %green|blue %blue"
    //% block.loc.fr="rouge %red|vert %green|bleu %blue"
    //% advanced=true
    export  function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

     /**
     * Gets the RGB value of a known colour
     */
    //% blockGap=9
    //% blockId="BLiXel_colours" 
    //% block="%colour"
    //% advanced=true
    export  function colours(colour: BLiXelcolours): number {
        return colour;
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
     * Converts a hue saturation luminosity value into a RGB colour
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=BLiXelHSL 
    //% block="hue %h|saturation %s|luminosity %l"
    //% block.loc.fr="nuance %h|saturation %s|luminosité %l"
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
        let x = (c * (256 - (temp))) >> 8; //[0,255], second largest component of this colour
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