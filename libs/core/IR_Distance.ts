//-------------------------Click Board RI_Distance -----------------------------------
//% weight=100 color=#33BEBB icon="↔"
//% advanced=true
//% labelLineWidth=1002
namespace IR_Distance {
    export enum IR_enable {
        On = 1,
        Off = 0
    }

    /**
     * Sets IR_Distance object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param IR_Distance the IR_Distance Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="IR_Distance"
    //% weight=110
    export function createIR_Distance(boardID: BoardID, clickID: ClickID): IR_Distance {
        return new IR_Distance(boardID, clickID);
    }
    export class IR_Distance {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }

        //% blockId=IRDistance_getDistance
        //% block="$this get distance"
        //% advanced=false
        //% blockNamespace=IR_Distance
        //% this.shadow=variables_get
        //% this.defl="IR_Distance"
        getDistance(): number {
            return 2700 - bBoard_Control.analogRead(clickADCPin.AN, this.myBoardID, this.myClickID)
        }

        //% blockId=IRDistance_Enable
        //% block="$this Turn $enable"
        //% advanced=true
        //% blockNamespace=IR_Distance
        //% this.shadow=variables_get
        //% this.defl="IR_Distance"
        enable(enable: IR_Distance.IR_enable) {
            bBoard_Control.writePin(enable, clickIOPin.RST, this.myBoardID, this.myClickID)
        }
    }
}