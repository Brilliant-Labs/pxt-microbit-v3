//------------------------- Device IR_Distance_GP2Y0A -----------------------------------
//% weight=100 color=#A8AA36 icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace IR_Distance_GP2Y0A {
    /**
     * Sets IR_Distance_GP2Y0A object.
     * @param PortID the portID
     * @param IR_Distance_GP2Y0A the IR_Distance_GP2Y0A Object
     */
    //% block="$portID"
    //% advanced=false
    //% blockSetVariable="IR_Distance_GP2Y0A"
    //% weight=110
    
    //TODO: limit AnalogPin to bBoard Ports
    export function createIR_Distance_GP2Y0A(portID: AnalogPin): IR_Distance_GP2Y0A {
        return new IR_Distance_GP2Y0A(portID);
    }
    export class IR_Distance_GP2Y0A {
        private myPortID: AnalogPin

        constructor(portID: AnalogPin) {
            this.myPortID = portID;
        }

        //% blockId=IRDistance1080_getDistance
        //% block="$this get distance"
        //% advanced=false
        //% blockNamespace=IR_Distance_GP2Y0A
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_GP2Y0A"
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
        //% blockNamespace=IR_Distance_GP2Y0A
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_GP2Y0A"
        //note:  this sensor not read under 5 cm distance
        getValue(): number {
            let read = pins.analogReadPin(this.myPortID)
            return read
        }
    }
}