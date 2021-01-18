//-------------------------Click Board Blocks Begin -----------------------------------
//% weight=500
//% color=#9E4894 
//% icon=""
//% advanced=true
//% labelLineWidth=1001

namespace bBoard_Mic {

    /**
    * Sets mic object.
    * @param boardID the click
    * @param clickID the bus
    *  @param mic the neopixel Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="bBoardMic"
    //% advanced=true
    //% weight=110
    export function createMic0(): bBoardMic {
        return new bBoardMic(BoardID.zero, ClickID.Zero);
    }


    /**
    * Sets mic object.
    */
    //% block="bBoard $enable""
    //% blockSetVariable="bBoardMic"
    //% weight=98
    export function createMic(enable: micEnable): bBoardMic {
        let handle = new bBoardMic(BoardID.zero, ClickID.Zero);
        handle.micEnable(enable)
        return handle
    }

    enum functionID {
        // FunctionIds
        getSoundLevel = 1,
        setThreshold = 2,
        getThresholdFlag = 3,
        clearThresholdFlag = 4,
        enable = 5,
        getRMS = 6,
        setBaseline = 7
    }
    export enum micEnable {
        enabled = 1,
        disabled = 0

    }

    export enum soundLevel {
        loud = 1


    }
    export class bBoardMic extends bBoard_Control.peripheralSettings {
        //Motor Click
        private threshold: number
        //private board: BoardID;
        //private clickPort: ClickID;
        private boardIDGlobal: number
        private clickIDGlobal: number

        constructor(boardID: BoardID, clickID: ClickID) {
            super(boardID, clickID)
            this.boardIDGlobal = boardID;
            this.clickIDGlobal = clickID;
            this.threshold = 50
        }
        get threshVal() {
            return this.threshold
        }
        set threshVal(value) {
            this.threshold = value
        }


        //% blockId=onBLMicThresh block="$this on $soundLevel sound" blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"
        //% advanced=false
        onMicThresh(soundLevel: soundLevel, a: () => void): void { //Pass user blocks as a callback function "a". 
            bBoard_Control.eventInit(); //Initialize the event processor if not already initialized

            let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal, this.clickIDGlobal, bBoardEvents.MIC_THRESHOLD, [soundLevel], null, <any>a, () => this.clearThresholdFlag());

            bBoard_Control.addEvent(eventHandler)
            this.setThresholdLevel(this.threshold)

        }




        //% blockId=Mic_Enable
        //% block="$this $enable"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"

        micEnable(enable: bBoard_Mic.micEnable) {
            this.sendData(0, moduleIDs.MIC_module_id, functionID.enable, [enable]) //Enable module
            this.sendData(0, moduleIDs.MIC_module_id, functionID.setBaseline, []) //Get a baseline reading
        }

        //% blockId=Mic_baseline
        //% block="$this update microphone baseline"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"
        micBaseline() {
            this.sendData(0, moduleIDs.MIC_module_id, functionID.setBaseline, []) //Get a baseline reading
        }

        //% blockId=Mic_Sound_Level
        //% block="$this get sound level"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"
        micSoundLevel(): number {
            let soundLevel: number
            soundLevel = this.readData16(0, moduleIDs.MIC_module_id, functionID.getRMS, [])
            return soundLevel
        }

        //% blockId=Mic_Threshold_Flag
        //% block="$this has threshold been reached?"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"
        micThresholdFlag(): boolean {
            let micThreshold: number
            micThreshold = this.readData16(0, moduleIDs.MIC_module_id, functionID.getThresholdFlag, [])
            return micThreshold == 1 ? true : false
        }

        //% blockId=Mic_Set_Threshold
        //% block="$this set mic threshold level to %threshold"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"
        setThresholdLevel(threshold: number) {
            this.sendData(0, moduleIDs.MIC_module_id, functionID.setThreshold, [threshold & 0x00FF, ((threshold & 0xFF00) >> 8)])
        }

        //% blockId=Clear_Threshold_Flag
        //% block="$this clear threshold flag"
        //% advanced=false
        //% blockNamespace=bBoard_Mic
        //% this.shadow=variables_get
        //% this.defl="bBoardMic"
        //% parts="bBoardMic"

        clearThresholdFlag() {
            this.sendData(0, moduleIDs.MIC_module_id, functionID.clearThresholdFlag, [])
        }
    }
}