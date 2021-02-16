//-------------------------Click Board ButtonG -----------------------------------
//% weight=700 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace ButtonG {
    export enum Light {
        On = 1,
        Off = 0
    }
    export enum buttonPress {
        Pressed = 1,
        Released = 0
    }

    /**
     * Sets ButtonG object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param ButtonG the ButtonG Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="ButtonG"
    //% weight=110
    export function createButtonG(boardID: BoardID, clickID: ClickID): ButtonG {
        return new ButtonG(boardID, clickID);
    }
    export class ButtonG {
        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }

        //% blockId=ButtonG_SetLight
        //% block="$this Turn button light $onOff"
        //% advanced=false
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        setLight(onOff: Light) {
            bBoard_Control.writePin(onOff, clickIOPin.PWM, this.myBoardID, this.myClickID)
        }

        //% blockId=ButtonG_SetLight_PWM
        //% block="$this Set button light to $brightness brightness"
        //% advanced=false
        //% brightness.min=0 brightness.max=100
        //% brightness.defl=50
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        setLightPWM(brightness: number) {
            //TODO: Check setLightPWM function
            let dutyCycle = 0;
            dutyCycle = brightness * 10; //the BLiX chip expects a value of 0-1000
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, parseInt(clickPWMPin.PWM.toString()), PWM_module_id, PWM_PR_id, [dutyCycle & 0x00FF, (dutyCycle & 0xFF00) >> 8], null, 0)
        }

        //% blockId=ButtonG_getSwitch
        //% block="$this Read button state"
        //% advanced=true
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        getSwitch(): number {
            return bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID);
        }

        //% blockId=onButtonG 
        //% block="$this on button $state" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        onButtonState(state: buttonPress, a: () => void): void {
            bBoard_Control.eventInit((state == buttonPress.Pressed) ? bBoardEventsMask.CN_HIGH : bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, (state == buttonPress.Pressed) ? bBoardEventsMask.CN_HIGH : bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, (state == buttonPress.Pressed) ? bBoardEvents.CN_HIGH : bBoardEvents.CN_LOW), clickIOPin.INT, a); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }
    }
}
