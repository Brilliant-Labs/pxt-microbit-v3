//-------------------------Click Board Button_G -----------------------------------
//% weight=700 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Button_G {
  export enum Light {    
    On = 1,
    Off = 0
  }
  export enum buttonPress {
    Pressed = 1,
    Released = 0
  }
​
  /**
   * Sets Button G object.
   * @param boardID the boardID
   * @param clickID the ClickID
   * @param Button_G the Button_G Object
   */
  //% block="$boardID $clickID"
  //% advanced=false
  //% $boardID.shadow="BoardID.zero"
  //% blockSetVariable="Button_G"
  //% weight=110
  export function createButton_G(boardID: BoardID, clickID: ClickID): Button_G {
    return new Button_G(boardID, clickID);
  }
  export class Button_G {
    private myBoardID: BoardID
    private myClickID: ClickID

    constructor(boardID: BoardID, clickID: ClickID) {
      this.myBoardID = boardID;
      this.myClickID = clickID;
    }
​
    //% blockId=ButtonG_SetLight
    //% block="$this Turn button light $onOff"
    //% advanced=false
    //% blockNamespace=Button_G
    //% this.shadow=variables_get
    //% this.defl="Button_G"
    setLight(onOff: Light) {
      bBoard_Control.writePin(onOff, clickIOPin.PWM, this.myBoardID, this.myClickID)
    }
​
    //% blockId=ButtonG_SetLight_PWM
    //% block="$this Set button light to $brightness brightness"
    //% advanced=false
    //% brightness.min=0 brightness.max=100
    //% brightness.defl=50
    //% blockNamespace=Button_G
    //% this.shadow=variables_get
    //% this.defl="Button_G"
    setLightPWM(brightness: number) {
      let dutyCycle = 0;
      dutyCycle = brightness * 10; //the BLiX chip expects a value of 0-1000
      bBoard_Control.BLiX(this.myBoardID, this.myClickID, parseInt(clickPWMPin.PWM.toString()), PWM_module_id, PWM_PR_id, [dutyCycle & 0x00FF, (dutyCycle & 0xFF00) >> 8], null, 0)
    }
​
    //% blockId=ButtonG_getSwitch
    //% block="$this Read button state"
    //% advanced=true
    //% blockNamespace=Button_G
    //% this.shadow=variables_get
    //% this.defl="Button_G"
    getSwitch(): number {
      return bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID);
    }
​
    //% blockId=onButtonG 
    //% block="$this on button $state" 
    //% advanced=false
    //% blockAllowMultiple=0
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% blockNamespace=Button_G
    //% this.shadow=variables_get
    //% this.defl="Button_G"
    onButtonState(state: buttonPress, a: () => void): void {
      bBoard_Control.eventInit((state==buttonPress.Pressed)?bBoardEventsMask.CN_HIGH:bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
      bBoard_Control.pinEventSet(this.myBoardID,this.myClickID,clickIOPin.INT,(state==buttonPress.Pressed)?bBoardEventsMask.CN_HIGH:bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
      control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID,this.myClickID,(state==buttonPress.Pressed)?bBoardEvents.CN_HIGH:bBoardEvents.CN_LOW),clickIOPin.INT, () => this.buttonEvent(state, a)); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
    }
​
    buttonEvent(state: buttonPress, a:()=>void) //A Change notification interrupt has occured, but that could mean any pin on the PORT our interrupt is monitoring
    {    
  
        a() //Call the code that the user provided in the onButtonState block
      
    }
  }
}
