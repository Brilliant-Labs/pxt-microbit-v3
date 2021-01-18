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

    //% block=" $boardID $clickID"
    //% blockSetVariable="Keylock"
    //% weight=110
    export function createkeylock(boardID: BoardID, clickID: ClickID): keylock {
        return new keylock(boardID, clickID);
    }



    export class keylock extends bBoard_Control.PinSettings {
        private boardIDGlobal: number
        private clickIDNumGlobal: number
        private clickAddress: number


        constructor(boardID: BoardID, clickID: ClickID) {
            super(boardID, clickID);
            this.boardIDGlobal = boardID;
            this.clickIDNumGlobal = clickID;
            this.clickAddress = boardID*3 + clickID
        }

        //% blockId=onKeylockPosition block="$this on keylock $position" blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="Keylock"
        //% advanced=false
        onKeylockPosition(position:Keylock.KeyPosition,a: () => void): void {
            bBoard_Control.eventInit(); //Initialize the event processor if not already initialized

            let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal, this.clickIDNumGlobal, bBoardEvents.CN_HIGH, [this.clickAddress, position, bBoardEvents.CN_HIGH], <any>bBoard_Control.pinEventCheck(this.clickAddress, clickIOPin.CS, bBoardEvents.CN_HIGH), <any>a, null);
            bBoard_Control.pinEventSet(this.clickAddress, parseInt(position.toString()), bBoardEvents.CN_HIGH)
            bBoard_Control.addEvent(eventHandler)


        }

        //% blockId=Keylock_getLockPosition
        //% block="$this Get lock position"
        //% weight=60 color=#0fbc11
        //% blockNamespace=Keylock
        //% this.shadow=variables_get
        //% this.defl="Keylock"
        getLockPosition(): number {



            if (this.digitalReadPin(clickIOPin.AN) == 1) {
                return 1;
            }


            if (this.digitalReadPin(clickIOPin.PWM) == 1) {
                return 2;
            }

            if (this.digitalReadPin(clickIOPin.INT) == 1) {
                return 3;
            }

            return 0;


        }

    }

}