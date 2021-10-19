//% weight=100 color=#F4B820 icon=""
//% advanced=true

namespace Keylock {


    
    export enum MotorDirection {
        //% block="Forward"
        Forward,
        //% block="Reverse"
        Reverse
    }
    
    
    
      
    
    
        //% blockId=Keylock_getLockPosition
        //% block="Get lock position on click%clickBoardNum"
        //% weight=60 color=#0fbc11
        export function getLockPosition(clickBoardNum: clickBoardID): number {
            
          
       
            if(bBoard.digitalReadPin(clickIOPin.AN,clickBoardNum) ==1)
            {
                return 1;
            }

                   
            if( bBoard.digitalReadPin(clickIOPin.PWM,clickBoardNum) ==1)
            {
                return 2;
            }

            if( bBoard.digitalReadPin(clickIOPin.INT,clickBoardNum) ==1)
            {
                return 3;
            }

        return 0;

           
        }

    }