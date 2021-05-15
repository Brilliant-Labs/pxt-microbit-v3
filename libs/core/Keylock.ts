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
        //% block.loc.fr="$this Obtenir la position de la serrure"
        //% weight=60 
        //% blockNamespace=Keylock 
        //% advanced=true
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
        //% block.loc.fr="$this sur la serrure $position"
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=Keylock
        //% this.shadow=variables_get
        //% this.defl="Keylock"
        onMotionDetected(position: Keylock.KeyPosition, a: () => void): void {
            bBoard_Control.eventInit(bBoardEventsMask.CN_HIGH, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, parseInt(position.toString()), bBoardEventsMask.CN_HIGH) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID,this.myClickID,bBoardEvents.CN_HIGH),position, a); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }
    }
}