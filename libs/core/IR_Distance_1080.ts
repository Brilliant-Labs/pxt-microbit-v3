//-------------------------Click Board RI_Distance -----------------------------------
//% weight=100 color=#33BEBB icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace IR_Distance_1080 {
    /**
     * Sets IR_Distance_1080 object.
     * @param PortID the portID
     * @param IR_Distance_1080 the IR_Distance_1080 Object
     */
    //% block="$portID"
    //% advanced=false
    //% blockSetVariable="IR_Distance_1080"
    //% weight=110
    export function createIR_Distance_1080(portID: AnalogPin): IR_Distance_1080 {
        return new IR_Distance_1080(portID);
    }
    export class IR_Distance_1080 {
        private myPortID: AnalogPin

        constructor(portID: AnalogPin) {
            this.myPortID = portID;
        }

        //% blockId=IRDistance1080_getDistance
        //% block="$this get distance"
        //% advanced=false
        //% blockNamespace=IR_Distance_1080
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_1080"
        //note:  this sensor not read under 5 cm distance
        getDistance(): number {
            //TODO: use altern waiting solve Math.pow
            let read = pins.analogReadPin(this.myPortID)
            let x = Math.round(read)*1.00001
            let y = ((x) ** (1.35))
            let z = Math.roundWithPrecision ((250000 / y), 1)
            let altern = Math.round (100 / Math.exp(0.0011 * read))     
            return altern
        }

        //% blockId=IRDistance1080_getValue
        //% block="$this get value"
        //% advanced=true
        //% blockNamespace=IR_Distance_1080
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_1080"
        //note:  this sensor not read under 5 cm distance
        getValue(): number {
            let read = pins.analogReadPin(this.myPortID)
            return read
        }
    }
}