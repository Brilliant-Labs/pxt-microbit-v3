//------------------------- Device IR_Distance_20150 -----------------------------------
//% weight=100 color=#A8AA36 icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace IR_Distance_20150 {
    /**
     * Sets IR_Distance_20150 object.
     * @param PortID the portID
     * @param IR_Distance_20150 the IR_Distance_20150 Object
     */
    //% block="$portID"
    //% advanced=false
    //% blockSetVariable="IR_Distance_20150"
    //% weight=110

    //TODO: limit AnalogPin to bBoard Ports
    export function createIR_Distance_20150(portID: AnalogPin): IR_Distance_20150 {
        return new IR_Distance_20150(portID);
    }
    export class IR_Distance_20150 {
        private myPortID: AnalogPin

        constructor(portID: AnalogPin) {
            this.myPortID = portID;
        }

        //% blockId=IRDistance20150_getDistance
        //% block="$this get distance"
        //% advanced=false
        //% blockNamespace=IR_Distance_20150
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_20150"
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

        //% blockId=IRDistance20150_getValue
        //% block="$this get value"
        //% advanced=true
        //% blockNamespace=IR_Distance_20150
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_20150"
        //note:  this sensor not read under 5 cm distance
        getValue(): number {
            let read = pins.analogReadPin(this.myPortID)
            return read
        }
    }
}