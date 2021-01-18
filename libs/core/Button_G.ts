//% weight=700 color=#F4B820 icon=""
//% advanced=true
  //% labelLineWidth=1003
  namespace Button_G {


    
    export enum Light{
        Off = 0,
        On = 1
    
    }


    export enum buttonState{
        Released = 0,
        Pressed = 1
    
    }
    



    /**
     * Sets Button G object.
     * @param boardID the boardID
     *  @param Button_G the Button_G Object
     */
    //% block=" $boardID $clickID"
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Button_G"
    //% weight=110
    export function createButton_G(boardID: BoardID, clickID:ClickID): Button_G {
        return new Button_G(boardID, clickID);
   }


    export class Button_G extends bBoard_Control.PinSettings{
        private boardIDGlobal:number
        private clickIDNumGlobal:number
        private PWMs : bBoard_Control.PWMSettings;
        private clickAddress:number
        constructor(boardID: BoardID, clickID:ClickID){
            super(boardID, clickID);
            this.boardIDGlobal=boardID;
            this.clickIDNumGlobal=clickID;
            this.PWMs= new bBoard_Control.PWMSettings(boardID, clickID);
            this.clickAddress = boardID*3 + clickID
        }
    
        //% blockId=ButtonG_SetLight
        //% block="$this Turn button light $onOff"
        //% blockNamespace=Button_G
        //% this.shadow=variables_get
        //% this.defl="Button_G"
    setLight(onOff:Light)
 {
    this.writePin(onOff,clickIOPin.PWM)
 }
      //% blockId=onButtonG block="$this on button $state" blockAllowMultiple=0
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="Button_G"
      
                //% advanced=false
                onButtonState(state:buttonState, a: () => void): void {  
                    bBoard_Control.eventInit(); //Initialize the event processor if not already initialized
                    let eventID = state== buttonState.Pressed? bBoardEvents.CN_HIGH:bBoardEvents.CN_LOW
                    let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal,this.clickIDNumGlobal,eventID,[this.clickAddress,clickIOPin.INT,eventID],<any>bBoard_Control.pinEventCheck(this.clickAddress,clickIOPin.INT,eventID),<any>a,null);
                    bBoard_Control.pinEventSet(this.clickAddress,clickIOPin.INT,eventID)
                    bBoard_Control.addEvent(eventHandler)
               
                
                }
                
    
        //% blockId=ButtonG_SetLight_PWM
        //% block="$this Set button light to $brightness brightness"
        //% brightness.min=0 brightness.max=100
        //% blockNamespace=Button_G
        //% this.shadow=variables_get
        //% this.defl="Button_G"
        setLightPWM(brightness:number)
        {
            this.PWMs.setDuty(clickPWMPin.PWM,brightness)
        }

    
        //% blockId=ButtonG_getSwitch
        //% block="$this Read button state"
        //% advanced=true
        //% blockNamespace=Button_G
        //% this.shadow=variables_get
        //% this.defl="Button_G"
        getSwitch():number
        {
           return this.digitalReadPin(clickIOPin.INT)
        }

    }

}

