//------------------------- Device IR_Distance_GP2Y0A -----------------------------------
//% weight=100 color=#A8AA36 icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace IR_Distance_GP2Y0A {
    export enum distanceRange {
        Short_10_80 = 1,
        Long_20_150 = 2
    }

    export enum portPin {
        P0 = AnalogPin.P0,
        P1 = AnalogPin.P1,
        P2 = AnalogPin.P2,
    }
    /**
     * Sets IR_Distance_GP2Y0A object.
     * @param portID the portID
     * @param sensorType the sensorType
     * @param IR_Distance_GP2Y0A the IR_Distance_GP2Y0A Object
     */
    //% block="$portID range $sensorType"
    //% block.loc.fr="$portID gamme $sensorType"
    //% advanced=false
    //% blockSetVariable="IR_Distance_GP2Y0A"
    //% weight=110

    //TODO: limit AnalogPin to bBoard Ports
    export function createIR_Distance_GP2Y0A(portID: portPin, sensorType: distanceRange): IR_Distance_GP2Y0A {
        switch (portID) {
            case portPin.P0:
                return new IR_Distance_GP2Y0A(AnalogPin.P0, sensorType);
            case portPin.P1:
                return new IR_Distance_GP2Y0A(AnalogPin.P1, sensorType);
            case portPin.P2:
                return new IR_Distance_GP2Y0A(AnalogPin.P2, sensorType);
            default:
                return new IR_Distance_GP2Y0A(AnalogPin.P0, sensorType);
        }
    }
    export class IR_Distance_GP2Y0A {
        private myPortID: AnalogPin
        private mySentorType: distanceRange

        constructor(portID: AnalogPin, sensorType: distanceRange) {
            this.myPortID = portID;
            this.mySentorType = sensorType
        }

        //% blockId=IRDistance1080_getDistance
        //% block="$this get distance"
        //% block.loc.fr="$this obtenir la distance"
        //% advanced=false
        //% blockNamespace=IR_Distance_GP2Y0A
        //% this.shadow=variables_get
        //% this.defl="IR_Distance_GP2Y0A"
        //note:  this sensor not read under 5 cm distance
        getDistance(): number {
            // //TODO: use altern waiting solve Math.pow
            let read = pins.analogReadPin(this.myPortID)
            // var x = 0
            // var y = 0
            // var z = 0
            let altern = 0
            switch (this.mySentorType) {
                case distanceRange.Short_10_80: {
                    // x = Math.round(read) * 1.00001
                    // y = ((x) ** (1.35))
                    // z = Math.roundWithPrecision((250000 / y), 1)
                    // altern = Math.round(100 / Math.exp(0.0011 * read))
                    //altern = Math.roundWithPrecision ((16569 / (read + 25)) - 11, 1)
                    altern = Math.roundWithPrecision ((16569 / (read + 25)) - 21, 1)
                    // altern = 15
                }
                case distanceRange.Long_20_150: {
                    // x = Math.round(read) * 1.00001
                    // y = ((x) ** (1.35))
                    // z = Math.roundWithPrecision((250000 / y), 1)
                    // altern = Math.round(100 / Math.exp(0.0011 * read))
                    altern = Math.roundWithPrecision ((16569 / (read + 25)) - 21, 1)
                }
            }
            return altern
        }

        //% blockId=IRDistance1080_getValue
        //% block="$this get value"
        //% block.loc.fr="$this obtenir la valeur"
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