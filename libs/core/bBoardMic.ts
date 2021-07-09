//-------------------------Click Board Blocks Begin -----------------------------------
//% weight=500
//% color=#9E4894 
//% icon=""
//% advanced=true
//% labelLineWidth=1001
​
namespace bBoard_Mic {

 
const DEFAULT_MIC_THRESHOLD = 50;
​let currentMicThreshold = DEFAULT_MIC_THRESHOLD;
let ​micInitialized = false; 

    ​function micInit()
    {
        if(!micInitialized)
        {
            micEnable(micState.enabled)
            micInitialized = true
        }

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
    export enum micState {
        enabled = 1,
        disabled = 0
    }
    export enum soundLevel {
        loud = 1
    }
​
    //% blockId=onBLMicThresh 
    //% block="on $soundLevel sound" blockAllowMultiple=0
    //% afterOnStart=true                                       //This block will only execute after the onStart block is finished
    //% this.defl="bBoardMic"
    //% parts="bBoardMic"
    //% advanced=false
    export function onMicThresh(soundLevel: soundLevel, a: () => void): void { //Pass user blocks as a callback function "a". 
        micInit();
        bBoard_Control.eventInit(bBoardEvents.MIC_THRESHOLD, BoardID.zero, BUILT_IN_PERIPHERAL); 
        control.onEvent(bBoard_Control.BLiX_INT_EVENT, bBoard_Control.getEventValue(BoardID.zero,BUILT_IN_PERIPHERAL,bBoardEvents.MIC_THRESHOLD), () => BLMICEvent(a) )
    }
​
    function BLMICEvent(a:()=>void)
    {
        a()
        clearThresholdFlag()

    }

    //% blockId=Mic_Enable
    //% block="microphone $enable"
    //% advanced=true
    export function micEnable(enable: bBoard_Mic.micState) {
        let data = [enable]
        ​setThresholdLevel(currentMicThreshold);
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MIC_module_id, functionID.enable, data, null, 0)
        micBaseline();
     
    }
​
    //% blockId=Mic_baseline
    //% block="update microphone baseline"
    //% advanced=true
    export function micBaseline() {
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MIC_module_id, functionID.setBaseline, [], null, 0)
    }
​
    //% blockId=Mic_Sound_Level
    //% block="get sound level"
    //% advanced=false
    export function micSoundLevel(): number {
        micInit();
        let soundLevel: number
        soundLevel = bBoard_Control.readData16(clickIOPin.AN, moduleIDs.MIC_module_id, functionID.getRMS, [], BoardID.zero, BUILT_IN_PERIPHERAL)
        return soundLevel
    }
​
    //% blockId=Mic_Threshold_Flag
    //% block="has threshold been reached?"
    //% advanced=true
    export function micThresholdFlag(): boolean {
       
        let micThreshold: number
        micThreshold = bBoard_Control.readData16(clickIOPin.AN, moduleIDs.MIC_module_id, functionID.getThresholdFlag, [], BoardID.zero, BUILT_IN_PERIPHERAL)
        return micThreshold == 1 ? true : false
    }


    //% blockId=Mic_Set_Threshold
    //% block="set mic threshold level to %threshold"
    //% threshold.defl=50
    //% advanced=true
    export function setThresholdLevel(threshold: number) {
        if(threshold <= 0)
        {
            threshold = DEFAULT_MIC_THRESHOLD;
        }
       
            currentMicThreshold = threshold;
        
        let data = [threshold & 0x00FF, ((threshold & 0xFF00) >> 8)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MIC_module_id, functionID.setThreshold, data, null, 0)
    }
​
    //% blockId=Clear_Threshold_Flag
    //% block="clear threshold flag"
    //% advanced=true
    export function clearThresholdFlag() {
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MIC_module_id, functionID.getThresholdFlag, [], null, 0)
    }
}