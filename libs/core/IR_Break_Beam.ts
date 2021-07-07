//------------------------- device IR_Break_Beam -----------------------------------
//% weight=100 color=#33BEBB icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace IR_Break_Beam {
    export enum beamState {
        Open = 1,
        Close = 0
    }

    /**
     * Sets IR_Break_Beam object.
     * @param PortID the portID
     * @param IR_Break_Beam the IR_Break_Beam Object
     */
    //% block="$portID"
    //% advanced=false
    //% blockSetVariable="IR_Break_Beam"
    //% weight=110

    export function createIR_Break_Beam(portID: DigitalPin): IR_Break_Beam {
        return new IR_Break_Beam(portID);
    }
    export class IR_Break_Beam {
        private myDigitalPin: DigitalPin

        constructor(digitalPin: DigitalPin) {
            this.myDigitalPin = digitalPin;

            pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
        }


        //% blockId=onIRBreakBeam 
        //% block="$this on $digitalPin $state" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=IR_Break_Beam
        //% this.shadow=variables_get
        //% this.defl="IR_Break_Beam"
        onIRBreakBeam(state: beamState, a: () => void): void {
            if (state == beamState.Open) {
                pins.onPulsed(this.myDigitalPin, PulseValue.Low, a)
//                input.onPinReleased(TouchPin.P1, a)
            } else if (state == beamState.Close) {
                pins.onPulsed(this.myDigitalPin, PulseValue.High, a)
            }
        }
    }
}

