//-------------------------Click Board Stepper_5 -----------------------------------
//% weight=100 color=#EF697B icon=""
//% advanced=true
//% labelLineWidth=1005
namespace Stepper_5 {
    export enum Rotation {
        //% block="Forward"
        Forward = 0,
        //% block="Backwards"
        Backwards = 1
    }

    /**
     * Sets Stepper object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Stepper the Stepper Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Stepper"
    //% weight=110
    export function createStepper(boardID: BoardID, clickID: ClickID): Stepper {
        return new Stepper(boardID, clickID);
    }
    export class Stepper {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }

        //% blockId=step
        //% block="Single step motor %direction on click%clickBoardNum"
        //% weight=100
        //% blockGap=7
        step(direction: Stepper_5.Rotation): void {
            bBoard_Control.setPin(clickIOPin.PWM, this.myBoardID, this.myClickID)
            basic.pause(1)
            bBoard_Control.clearPin(clickIOPin.PWM, this.myBoardID, this.myClickID)
        }

        //% blockId=stepNum
        //% block="Step motor %numSteps times %direction on click%clickBoardNum"
        //% weight=100
        //% blockGap=7
        stepNumber(numSteps: number, direction: Stepper_5.Rotation): void {
            bBoard_Control.writePin(direction, clickIOPin.RST, this.myBoardID, this.myClickID)
            for (let i = 0; i < numSteps; i++) {
                bBoard_Control.setPin(clickIOPin.PWM, this.myBoardID, this.myClickID)
                control.waitMicros(500);
                bBoard_Control.clearPin(clickIOPin.PWM, this.myBoardID, this.myClickID)
                control.waitMicros(500);
            }
        }
    }
}