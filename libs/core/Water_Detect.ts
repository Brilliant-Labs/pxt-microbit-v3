//-------------------------Click Board Water_Detect -----------------------------------
//% weight=907 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Water_Detect {
    /**
     * Sets Water_Detect object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Water_Detect the Water_Detect Object
     */
    //% block=" $boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Water_Detect"
    //% weight=110
    export function createWater_Detect(boardID: BoardID, clickID: ClickID): Water_Detect {
        return new Water_Detect(boardID, clickID);
    }
    export class Water_Detect {
        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
        }

        //% blockId=Water_Detect_isWater
        //% block="$this Is water detected"
        //% advanced=false
        //% blockNamespace=Water_Detect
        //% this.shadow=variables_get
        //% this.defl="Water_Detect"
        isWater(): number {
            return bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID)
        }

        //% blockId=onWater_Detect 
        //% block="$this on water detect" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=Water_Detect
        //% this.shadow=variables_get
        onButtonState(a: () => void): void {
            bBoard_Control.eventInit(bBoardEvents.CN_HIGH, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEventsMask.CN_HIGH) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, bBoardEvents.CN_HIGH), clickIOPin.INT, a); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }
    }
}