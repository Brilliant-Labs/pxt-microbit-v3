
/**
 * Custom blocks
 */
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
     *  @param Reed the Reed Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Reed"
    //% weight=110
    export function createReed(boardID: BoardID, clickID: ClickID): Reed {
        return new Reed(boardID, clickID);
    }

    export class Reed extends bBoard_Control.PinSettings {

        isInitialized: Array<number>;

        private boardIDGlobal: number
        private clickIDNumGlobal: number
        private clickAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            super(boardID, clickID);
          
            this.boardIDGlobal = boardID;
            this.clickIDNumGlobal = clickID;
            this.clickAddress = boardID*3 +clickID
        }

        initialize() {

         
            this.setPullDirection(clickIOPin.CS, IOPullDirection.two)
        }



        //% blockId=onMagnetDetected block="$this on magnet detected" blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="Reed"

        //% advanced=false
        onMagnetDetected(a: () => void): void {
            bBoard_Control.eventInit(); //Initialize the event processor if not already initialized

            let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal, this.clickIDNumGlobal, bBoardEvents.CN_HIGH, [this.clickAddress, clickIOPin.CS, bBoardEvents.CN_HIGH], <any>bBoard_Control.pinEventCheck(this.clickAddress, clickIOPin.CS, bBoardEvents.CN_HIGH), <any>a, null);
            bBoard_Control.pinEventSet(this.clickAddress, clickIOPin.CS, bBoardEvents.CN_HIGH)
            bBoard_Control.addEvent(eventHandler)


        }


        //%blockId=Reed_isActivated
        //%block="For $this Has reed been activated"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Reed
        //% this.shadow=variables_get
        //% this.defl="Reed"
        isActivated(): boolean {
            if (this.isInitialized[this.boardIDGlobal] == 0) {
                this.initialize()

            }

            if (this.digitalReadPin(clickIOPin.CS) == reed.Activated) {
                return true
            }
            return false;

        }

    }
}