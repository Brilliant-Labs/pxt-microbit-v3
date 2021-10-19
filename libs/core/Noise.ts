


/**
 * Custom blocks
 */
//% weight=100 color=#F20D0D icon=""
//% advanced=true
namespace Noise{

enum threshold{
    triggered = 0x01
}
    

let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


function initialize(clickBoardNum:clickBoardID)
{
 
    isInitialized[clickBoardNum]  = 1
    bBoard.clearPin(clickIOPin.RST,clickBoardNum) // Enable the device



}


          //%blockId=Noise_getNoiseLevel
        //%block="Get raw noise level on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
    export function  getNoiseLevel(clickBoardNum:clickBoardID):number
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(clickBoardNum)
            
        }
        return bBoard.analogRead(clickADCPin.AN,clickBoardNum)
    }
          //%blockId=Noise_isThresholdTriggered
        //%block="Has noise threshold been triggered on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=false
export function isThresholdTriggered(clickBoardNum:clickBoardID):boolean
{   
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(clickBoardNum)
        
    }
    if(bBoard.digitalReadPin(clickIOPin.INT,clickBoardNum) == threshold.triggered)
    {
        return true;
    }
    else
    {
        return false;
    }
 }
       //%blockId=Noise_setThreshold
        //%block="Set noise threshold to %threshold on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        //% threshold.min=0 threshold.max=100
        export function setThreshold(threshold:number,clickBoardNum:clickBoardID)
        {
            if(isInitialized[clickBoardNum] == 0)
            {
                initialize(clickBoardNum)
                
            }
            let config = 0x7000; //DACa, Buffered output, 1x Gain, Shutdown disabled
            if(threshold > 100)
            {
                threshold = 100
            }
            if(threshold < 0)
            {
                threshold = 0
            }
            threshold = threshold * 40.96 - 1 //Convert to a 12 bit number

            write(threshold|config,clickBoardNum);

        }
       //%blockId=Noise_write
        //%block="Write %value on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
    export function write(value:number,clickBoardNum:clickBoardID)
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(clickBoardNum)
            
        }
        let valueArray:number[] = [value>>8,value&0xFF]; //Split the value to be written into a LSB and MSB
        bBoard.spiCS(clickIOPin.CS,clickBoardNum)//Set the CS pin
        bBoard.SPIWriteArray(valueArray,clickBoardNum)
    }
}