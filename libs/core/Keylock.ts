//-------------------------Click Board Keylock -----------------------------------
//% weight=701 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Keylock {
    export enum KeyPosition {
        //% block="position 1"
        one = clickIOPin.AN,
        //% block="position 2"
        two = clickIOPin.PWM,
        //% block="position 3"
        three = clickIOPin.INT
    }

    /**
     * Sets Motion Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Keylock the Motion Object
    */
    //% block=" $boardID $clickID"
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Keylock"
    //% weight=110
    export function createkeylock(boardID: BoardID, clickID: ClickID): keylock {
        return new keylock(boardID, clickID);
    }
    export class keylock {
        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }

        //% blockId=Keylock_getLockPosition
        //% block="$this Get lock position"
        //% weight=60 
        //% blockNamespace=Keylock
        //% this.shadow=variables_get
        //% this.defl="Keylock"
        getLockPosition(): number {
            if (bBoard_Control.digitalReadPin(clickIOPin.AN, this.myBoardID, this.myClickID) == 1) {
                return 1;
            } else if (bBoard_Control.digitalReadPin(clickIOPin.PWM, this.myBoardID, this.myClickID) == 1) {
                return 2;
            } else if (bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID) == 1) {
                return 3;
            } else {
                return 0;
            }
        }

        //% blockId=onKeylockPosition 
        //% block="$this on keylock $position" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=Keylock
        //% this.shadow=variables_get
        //% this.defl="Keylock"
        onMotionDetected(position: Keylock.KeyPosition, a: () => void): void {
            bBoard_Control.eventInit(bBoardEvents.CN_HIGH, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, parseInt(position.toString()), bBoardEvents.CN_HIGH) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.BLiX_INT_EVENT, bBoard_Control.getEventValue(this.myBoardID, this.myClickID, bBoardEvents.CN_HIGH), () => this.motionEvent(position, a)); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }

        motionEvent(position: Keylock.KeyPosition, a: () => void) //A Change notification interrupt has occured, but that could mean any pin on the PORT our interrupt is monitoring
        {
            if (bBoard_Control.pinEventCheck(this.myBoardID, this.myClickID, parseInt(position.toString()), bBoardEvents.CN_HIGH)) //Check the exact pin we are concerened with to see if it generated the interrupt
            {
                a() //Call the code that the user provided in the onButtonState block
            }
        }
    }
}