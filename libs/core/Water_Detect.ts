/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% advanced=true
namespace Water_Detect {


 
     //% blockId=Water_Detect_isWater
     //% block="Is water detected on click%clickBoardNum ?"
     //% weight=100
     //% blockGap=7
     export function isWater(clickBoardNum: clickBoardID): number {
            if(bBoard.digitalReadPin(clickIOPin.INT,clickBoardNum) == 1)
            {
                return 1;
            }
            else{
                return 0;
            }
   
     }

    }