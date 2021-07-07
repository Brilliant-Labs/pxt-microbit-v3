//-------------------------Click Board Force -----------------------------------
//% color=#33BEBB weight=601 icon="\uf00a"
//% advanced=true
//% labelLineWidth=1002
namespace Force {
    /**
     * Sets Force Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Force the Force Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Force"
    //% weight=110
    export function createForceSettings(boardID: BoardID, clickID: ClickID): Force {
        return new Force(boardID, clickID);
    }

    export class Force {
        private readonly rangefactor = 20 / 3.3;
        private readonly Vadc_3 = 3.3 / 4096;

        private myBoardID: number;
        private myClickID: number;

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }


        /**
         * Measures force and returns value. 0.2 - 20N
         */
        //% blockId=force
        //% block="$this force"
        //% help=Force/Force/forceclickstring
        //% advanced=false
        //% blockNamespace=Force
        //% this.shadow=variables_get
        //% this.defl="Force"
        //% weight=90 blockGap=12 color=#9E4894 icon=""

        forceclick(): number {
            let A: number
            let sumA: number
            let Force_voltage: number
            let Force_val: number
            
            for (let i = 1; i <= 20; i++) {
                A = (bBoard_Control.analogRead(clickADCPin.AN, this.myBoardID, this.myClickID))
                sumA += A;
            }
            sumA = sumA / 20;
            Force_voltage = sumA * this.Vadc_3; //Voltage for the force click board
            Force_val = Force_voltage * this.rangefactor;
            return Force_val
        }
    }
}