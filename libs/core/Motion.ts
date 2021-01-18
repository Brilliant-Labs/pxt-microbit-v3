
/**
 * Custom blocks
 */
//% weight=800 color=#33BEBB icon="\u27A0"
//% advanced=true
//% labelLineWidth=1002
namespace Motion{


    
    
    enum motion{
        detected = 1,
        none = 0,
    }

     /**
     * Sets Thermo Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Thermo the Motion Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Motion"
    //% weight=110
    export function createThermo(boardID: BoardID, clickID:ClickID): Motion {
        return new Motion(boardID, clickID);
   }


    export class Motion{

        private boardIDGlobal : BoardID
        private clickIDGlobal : ClickID
        private clickAddress: number
        constructor(boardID: BoardID, clickID:ClickID){
            this.boardIDGlobal=boardID;
            this.clickIDGlobal=clickID;
            this.clickAddress = boardID*3 + clickID
        }
    
       //% blockId=onMotionDetected block="$this on motion detected" blockAllowMultiple=0
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="Motion"
      
                //% advanced=false
                onMotionDetected( a: () => void): void {  
                    bBoard_Control.eventInit(); //Initialize the event processor if not already initialized
                   
                    let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal,this.clickIDGlobal,bBoardEvents.CN_HIGH,[this.clickAddress,clickIOPin.INT,bBoardEvents.CN_HIGH],<any>bBoard_Control.pinEventCheck(this.clickAddress,clickIOPin.INT,bBoardEvents.CN_HIGH),<any>a,null);
                    bBoard_Control.pinEventSet(this.clickAddress,clickIOPin.INT,bBoardEvents.CN_HIGH)
                    bBoard_Control.addEvent(eventHandler)
               
                
                }

        //%blockId=Motion_isDetected
        //%block="$this Has motion been detected?"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Motion
        //% this.shadow=variables_get
        //% this.defl="Motion"
    isDetected():boolean
    {
        let PINs = new bBoard_Control.PinSettings(this.boardIDGlobal, this.clickIDGlobal);
        if(PINs.digitalReadPin(clickIOPin.INT) == motion.detected)
        {
            return true
        }
        return false;
    
    }

}
}