//-------------------------Click Board ButtonG -----------------------------------
//% weight=100 color=#F20D0D icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Noise {
    enum threshold {
        triggered = 0x01
    }
    enum noise {
        detected = 1,
        none = 0,
    }
    export enum noiceState {
        enabled = 1,
        disabled = 0
    }

    /**
     * Sets Noise Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Noise the Noise Object
    */
    //% block=" $boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Noise"
    //% weight=110
    export function createNoise(boardID: BoardID, clickID: ClickID): Noise {
        return new Noise(boardID, clickID);
    }
    export class Noise {
        private myBoardID: number
        private myClickID: number
        private myState: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
        }

        //% blockId=Motion_Enabled
        //% block="$this $enable motion"
        //% advanced=false
        //% blockNamespace=Motion
        //% this.shadow=variables_get
        //% this.defl="Motion"
        noiceEnable(enable: Noise.noiceState) {
            bBoard_Control.writePin(enable, clickIOPin.RST, this.myBoardID, this.myClickID)
            this.myState = enable
        }

        //% blockId=Noise_getNoiseLevel
        //% block="$this Get raw noise level"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Noise
        //% this.shadow=variables_get
        //% this.defl="Noise"
        getNoiseLevel(): number {
            if (this.myState == noiceState.disabled) {
                this.noiceEnable(noiceState.enabled)
            }
            return bBoard_Control.analogRead(clickADCPin.AN, this.myBoardID, this.myClickID)
        }

        //% blockId=Noise_isThresholdTriggered
        //% block="$this Has noise threshold been triggered"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Noise
        //% this.shadow=variables_get
        //% this.defl="Noise"
        isThresholdTriggered(): boolean {
            if (this.myState == noiceState.disabled) {
                this.noiceEnable(noiceState.enabled)
            }
            return (bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID) == threshold.triggered)             
        }

        //%blockId=Noise_setThreshold
        //%block="$this Set noise threshold to $threshold"
        //% blockGap=7
        //% advanced=false
        //% threshold.min=0 threshold.max=100
        //% blockNamespace=Noise
        //% this.shadow=variables_get
        //% this.defl="Noise"
        setThreshold(threshold: number) {
            if (this.myState == noiceState.disabled) {
                this.noiceEnable(noiceState.enabled)
            }
            let config = 0x7000; //DACa, Buffered output, 1x Gain, Shutdown disabled
            if (threshold > 100) {
                threshold = 100
            }
            if (threshold < 0) {
                threshold = 0
            }
            threshold = threshold * 40.96 - 1 //Convert to a 12 bit number
            this.write(threshold | config);

        }

        //% blockId=Noise_write
        //% block="$this Write $value"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Noise
        //% this.shadow=variables_get
        //% this.defl="Noise"
        write(value: number) {
            if (this.myState == noiceState.disabled) {
                this.noiceEnable(noiceState.enabled)
            }
            let valueArray: number[] = [value >> 8, value & 0xFF]; //Split the value to be written into a LSB and MSB
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, SPI_module_id, SPI_WRITEBULK_id, valueArray, null, 0) 
        }

    }
}