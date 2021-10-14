

/**
 * Custom blocks
 */
//% weight=100 color=#EF697B icon=""
//% advanced=true
namespace Stepper_5 {

   export enum Rotation
    {
          
            //% block="Forward"
            Forward = 0,
            //% block="Backwards"
            Backwards = 1
         
    
    }

    //% blockId=step
    //% block="Single step motor %direction on click%clickBoardNum"
    //% weight=100
    //% blockGap=7
    export function step(direction:Stepper_5.Rotation,clickBoardNum: clickBoardID): void {
        bBoard.setPin(clickIOPin.PWM,clickBoardNum)
        basic.pause(1)
        bBoard.clearPin(clickIOPin.PWM,clickBoardNum)
    }

        //% blockId=stepNum
    //% block="Step motor %numSteps times %direction on click%clickBoardNum"
    //% weight=100
    //% blockGap=7
    export function stepNumber(numSteps: number, direction:Stepper_5.Rotation,clickBoardNum: clickBoardID): void {
        bBoard.writePin(direction,clickIOPin.RST,clickBoardNum)
        for(let i=0;i<numSteps;i++)
        {
            bBoard.setPin(clickIOPin.PWM,clickBoardNum)
            control.waitMicros(500);
            bBoard.clearPin(clickIOPin.PWM,clickBoardNum)
            control.waitMicros(500);

        }
  
    }
}
