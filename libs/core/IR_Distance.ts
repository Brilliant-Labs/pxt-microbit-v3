
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon="↔"
//% advanced=true
namespace IR_Distance{


    
    

    let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


 function initialize(clickBoardNum:clickBoardID)
{
    enable(clickBoardNum) //Enable the module
    isInitialized[clickBoardNum]  = 1

}

       //%blockId=IRDistance_getDistance
        //%block="Get distance on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
    export function getDistance(clickBoardNum:clickBoardID):number
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(clickBoardNum)
            
        }
       return 2700-bBoard.analogRead(clickADCPin.AN,clickBoardNum)
    
    }

         //%blockId=IRDistance_enable
        //%block="Enable device on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        export function enable(clickBoardNum:clickBoardID)
        {
            bBoard.setPin(clickIOPin.RST,clickBoardNum); //Enable the module
          
        
        }

               //%blockId=IRDistance_disable
        //%block="Disable device on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        export function disable(clickBoardNum:clickBoardID)
        {
            bBoard.clearPin(clickIOPin.RST,clickBoardNum); //Enable the module
          
        
        }
}