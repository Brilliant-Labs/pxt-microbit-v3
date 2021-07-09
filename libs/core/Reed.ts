//-------------------------Click Board Reed -----------------------------------
//% weight=600 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Reed {
    enum reed {
        Activated = 1,
        Not_Activated = 0,
    }

    /**
     * Sets Reed Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Reed the Button_G Object
     */
    //% block=" $boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Reed"
    //% weight=110
    export function createReed(boardID: BoardID, clickID: ClickID): Reed {
        return new Reed(boardID, clickID);
    }
    export class Reed {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            bBoard_Control.setPullDirection(clickIOPin.CS, IOPullDirection.two, this.myBoardID, this.myClickID)
        }

        //% blockId=Reed_getSwitch
        //% block="$this Read reed state"
        //% advanced=false
        //% blockNamespace=Reed
        //% this.shadow=variables_get
        //% this.defl="Reed"
        getSwitch(): number {
            return bBoard_Control.digitalReadPin(clickIOPin.CS, this.myBoardID, this.myClickID);
        }

        //% blockId=onMagnetDetected 
        //% block="$this on magnet detected" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=Reed
        //% this.shadow=variables_get
        //% this.defl="Reed"
        onMagnetDetected(a: () => void): void {
            bBoard_Control.eventInit(bBoardEvents.CN_HIGH, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.CS, bBoardEvents.CN_HIGH) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.BLiX_INT_EVENT, bBoard_Control.getEventValue(this.myBoardID, this.myClickID, bBoardEvents.CN_HIGH), () => this.reedEvent(a)); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }

        reedEvent(a: () => void) //A Change notification interrupt has occured, but that could mean any pin on the PORT our interrupt is monitoring
        {
            if (bBoard_Control.pinEventCheck(this.myBoardID, this.myClickID, clickIOPin.CS, bBoardEvents.CN_HIGH)) //Check the exact pin we are concerened with to see if it generated the interrupt
            {
                a() //Call the code that the user provided in the onButtonState block
            }
        }
    }
}