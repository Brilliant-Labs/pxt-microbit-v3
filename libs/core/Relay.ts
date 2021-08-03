
//-------------------------Click Board Relay -----------------------------------
//% weight=100 color=#F4B820  icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Relay {
    export enum relay {
        Relay1 = 1,
        Relay2 = 2
    }
    export enum onOff {
        On = 1,
        Off = 0
    }

    /**
     * Sets Relay object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Relay the Relay Object
    */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Relay"
    //% weight=110
    export function createRelay(boardID: BoardID, clickID: ClickID): Relay {
        return new Relay(boardID, clickID);
    }
    export class Relay {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.Initialize()
        }

        Initialize() {
            bBoard_Control.writePin(onOff.Off, clickIOPin.PWM, this.myBoardID, this.myClickID)
            bBoard_Control.writePin(onOff.Off, clickIOPin.CS, this.myBoardID, this.myClickID)
        }


        //% blockId=Relay_relayOnOff
        //% block="$this turn $onOff relay $relayNum"
        //% block.loc.fr="$this éteindre $onOff relai $relayNum"
        //% advanced=false
        //% blockNamespace=Relay
        //% this.shadow=variables_get
        //% this.defl="Relay"
        relayOnOff(onOff: onOff, relayNum: relay) {
            switch (relayNum) {
                case relay.Relay1:
                    bBoard_Control.writePin(onOff, clickIOPin.PWM, this.myBoardID, this.myClickID)
                    break;
                case relay.Relay2:
                    bBoard_Control.writePin(onOff, clickIOPin.CS, this.myBoardID, this.myClickID)
                    break;
            }
        }
    }
}