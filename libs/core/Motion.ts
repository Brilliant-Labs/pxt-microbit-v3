//-------------------------Click Board Motion -----------------------------------
//% weight=800 color=#33BEBB icon="\u27A0"
//% advanced=true
//% labelLineWidth=1002
namespace Motion {
    enum motion {
        detected = 1,
        none = 0,
    }
    export enum motionState {
        enabled = 1,
        disabled = 0
    }

    /**
     * Sets Motion Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Motion the Motion Object
    */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Motion"
    //% weight=110
    export function createMotion(boardID: BoardID, clickID: ClickID): Motion {
        return new Motion(boardID, clickID);
    }
    export class Motion {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }

        //% blockId=Motion_Enabled
        //% block="$this $enable motion"
        //% advanced=true
        //% blockNamespace=Motion
        //% this.shadow=variables_get
        //% this.defl="Motion"
        motionEnable(enable: Motion.motionState) {
            bBoard_Control.writePin(enable, clickIOPin.RST, this.myBoardID, this.myClickID)
        }

        //% blockId=Motion_isDetected
        //% block="$this Has motion been detected?"
        //% advanced=false
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Motion
        //% this.shadow=variables_get
        //% this.defl="Motion"
        isDetected(): boolean {
            if (bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID) == motion.detected) {
                return true
            }
            return false;
        }

        //% blockId=onMotionDetected 
        //% block="$this on motion detected" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=Motion
        //% this.shadow=variables_get
        //% this.defl="Motion"
        onMotionDetected(a: () => void): void {
            bBoard_Control.eventInit(bBoardEvents.CN_HIGH, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEvents.CN_HIGH) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.BLiX_INT_EVENT, bBoard_Control.getEventValue(this.myBoardID, this.myClickID, bBoardEvents.CN_HIGH), () => this.motionEvent(a)); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }

        motionEvent(a: () => void) //A Change notification interrupt has occured, but that could mean any pin on the PORT our interrupt is monitoring
        {
            if (bBoard_Control.pinEventCheck(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEvents.CN_HIGH)) //Check the exact pin we are concerened with to see if it generated the interrupt
            {
                a() //Call the code that the user provided in the onButtonState block
            }
        }
    }
}