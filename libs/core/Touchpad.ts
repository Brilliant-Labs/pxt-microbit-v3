//------------------------- Click Board Touchpad -----------------------------------
//% weight=100 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Touchpad {
    export enum gestures {
        Single_Click = 0x10,
        Click_Hold = 0x11,
        Double_Click = 0x20,
        Down_Swipe = 0x31,
        Down_Swipe_Hold = 0x32,
        Right_Swipe = 0x41,
        Right_Swipe_Hold = 0x42,
        Up_Swipe = 0x51,
        Up_Swipe_Hold = 0x52,
        Left_Swipe = 0x61,
        Left_Swipe_Hold = 0x62
    }


    /**
     * Sets ButtonG object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Touchpad the Touchpad Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Touchpad"
    //% weight=110
    export function createTouchpad(boardID: BoardID, clickID: ClickID): Touchpad {
        return new Touchpad(boardID, clickID);
    }

    // An individual player. Holds properties and behavior for one player
class GestureCallback {
    private gesture:gestures
    private cb:() => void

    constructor(gesture:gestures,cb:()=> void) {
        this.gesture = gesture; 
        this.cb = cb;
    }
    getGesture()
    {
        return this.gesture
    }
    call()
    {
        this.cb()
    }
  }


class GestureCallbacks {
    private gestureCallbackList:GestureCallback[];
    constructor(){
      this.gestureCallbackList = [] //init array of callbacks
    }
    // create a new player and save it in the collection
    addCB(gesture:gestures,cb:()=>void){
      
      if(this.CBIndex(gesture)==-1) //Is there already a callback associated with the current gesture?
      {
        this.gestureCallbackList.push(new GestureCallback(gesture,cb)) //If not, add the current callback to the list. 
      }
      
    }
    CBIndex(gesture:gestures):number //Find the index if there is a callback function assigned to a gesture already
    {
    
        for(let i=0;i<this.gestureCallbackList.length;i++) //Loop through any(if there are) gesture callback classes instances
        {
            if(this.gestureCallbackList[i].getGesture() == gesture) //if the current class instance has the same gesture
            {
                return i; //return true
            }
        }

        return -1
    }

    call(gesture:gestures)
    {
      
     
        let index = this.CBIndex(gesture)
        if(index >=0)
        {
            
            this.gestureCallbackList[index].call(); //call the callback
        }
    }
  }





    export class Touchpad {

        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x25
        private readonly FWMAJOR = 0x00
        private readonly FWMINOR = 0x01
        private readonly APPIDH = 0x02
        private readonly APPIDL = 0x03
        private readonly CMD = 0x04
        private readonly MODE = 0x05
        private readonly MODECON = 0x06
        private readonly TOUCH_STATE = 0x10
        private readonly TOUCH_XREG = 0x11
        private readonly TOUCH_YREG = 0x12
        private readonly GESTURESTATE = 0x14
        private readonly HYSTERESIS = 0x2A
        //Masks
        private readonly touch_mask = 0x01
        private readonly gesture_mask = 0x02

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number
        private currentMode:number
        private touchIntEnabled:boolean
        private gestureIntEnabled:boolean
        private gestureCBClass: GestureCallbacks


        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
          
            this.initialize()
        }



        initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
            bBoard_Control.setPin(clickIOPin.RST,this.myBoardID,this.myClickID)
            this.currentMode = this.touch_mask|this.gesture_mask;
            this.writeMTCH6102(this.currentMode, this.MODE) //Set the mode to full 
            this.writeMTCH6102(0x01, this.CMD) //Force baseline reset 
            this.writeMTCH6102(0x06,this.HYSTERESIS)
             this.touchIntEnabled = false
             this.gestureIntEnabled = false
        }

        //%blockId=Touchpad_getX
        //%block="$this x"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Touchpad
        //% this.defl="Touchpad"
        getX(): number {
            return this.readMTCH6102(this.TOUCH_XREG);
        }

        //%blockId=Touchpad_getY
        //%block="$this y"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Touchpad
        //% this.defl="Touchpad"
        getY(): number {
            return this.readMTCH6102(this.TOUCH_YREG);
        }


        isTouched(): boolean {
            return this.readMTCH6102(this.TOUCH_STATE) & this.touch_mask ? true : false;
        }


        isGesture(): boolean {
            let gestureState = this.readMTCH6102(this.TOUCH_STATE)
            if (((gestureState & this.gesture_mask) >> 1) == 1) {
                return true
            }
            return false;
        }


        private touchPadCallback: (x: number, y: number) => void;
 

    
    //% blockId=onTouch 
    //% block="$this on touch" 
    //% block.loc.fr="$this lorsque touché"
    //% blockAllowMultiple=0
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% draggableParameters=reporter
    //% advanced=false
    //% blockNamespace=Touchpad
    //% this.shadow=variables_get
    //% this.defl="Touchpad"
     onTouch(cb: (x: number, y: number) => void): void { //Pass user blocks as a callback export function "a". 
        this.currentMode = this.currentMode | this.touch_mask; //turn on touch mode
        this.writeMTCH6102(this.currentMode, this.MODE) //Set the mode 
        this.touchIntEnabled = true
        this.touchPadCallback = cb
        bBoard_Control.eventInit(bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
        bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
        
        control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, bBoardEvents.CN_LOW), clickIOPin.INT, () => this.touchPadEventParser()) //Set interrupt mb
     
    }
  

    //% blockId=onGesture 
    //% block="$this on gesture $currentGesture" 
    //% block.loc.fr="$this lorsque geste $currentGesture"
    //% blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% draggableParameters=reporter
    //% advanced=false
    //% blockNamespace=Touchpad
    //% this.shadow=variables_get
    //% this.defl="Touchpad"
    onGesture(currentGesture: gestures,cb: ( ) => void): void { //Pass user blocks as a callback export function "a". 
        if(!this.gestureCBClass) //Has a gesture callback class been created yet?
        {
            this.gestureCBClass = new GestureCallbacks()//create one and add the gesture and callback
        }
        this.currentMode = this.currentMode | this.gesture_mask; //turn on touch mode
        this.writeMTCH6102(this.currentMode, this.MODE) //Set the mode 
        this.gestureIntEnabled = true
        this.gestureCBClass.addCB(currentGesture,cb)

        bBoard_Control.eventInit(bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
        bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
        
        control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, bBoardEvents.CN_LOW), clickIOPin.INT, () => this.touchPadEventParser()) //Set interrupt mb
     
    }
  


    touchPadEventParser()
    {

        if(this.touchIntEnabled == true) //Is touch int enabled?
        {
         
            if(this.isTouched() == true)
            {
                if(this.touchPadCallback) //Is there a callback function?
                {
                    let x = this.getX()
                    let y = this.getY()
    
                    this.touchPadCallback(x,y); // call the callback function
                }

               
            }
        }
        if(this.gestureIntEnabled == true) //Is touch int enabled?
        {

            if(this.isGesture() == true)
            {
             
                let gesture  = this.getGesture();
                if(this.gestureCBClass) //Has a gesture callback class been created yet?
                {
                  
                    this.gestureCBClass.call(gesture) //Call the callback for the gesture detected (if any)
                }
               
            }
        }
   
    }

        //%blockId=Touchpad_getGestureName
        //%block="Convert gesture ID %gestureID to a friendly name on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true    
        getGestureName(gestureID: number): string {
            switch (gestureID) {
                case gestures.Single_Click:
                    return "Single Click"
                    break;

                case gestures.Click_Hold:
                    return "Click & Hold"
                    break;

                case gestures.Double_Click:
                    return "Double Click"
                    break;

                case gestures.Down_Swipe:
                    return "Down"
                    break;

                case gestures.Down_Swipe_Hold:
                    return "Down Hold"
                    break;

                case gestures.Right_Swipe:
                    return "Right"
                    break;

                case gestures.Right_Swipe_Hold:
                    return "Right Hold"
                    break;

                case gestures.Up_Swipe:
                    return "Up"
                    break;

                case gestures.Up_Swipe_Hold:
                    return "Up Hold"
                    break;

                case gestures.Left_Swipe:
                    return "Left"
                    break;

                case gestures.Left_Swipe_Hold:
                    return "Left Hold"
                    break;
            }
            return "None"
        }

        //%blockId=Touchpad_getTouchState
        //%block="Get touch status on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        getTouchState(): number {
            return this.readMTCH6102(this.TOUCH_STATE);
        }

        //%blockId=Touchpad_getGesture
        //%block="Get gesture on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        getGesture(): number {
            return this.readMTCH6102(this.GESTURESTATE);
        }

        //%blockId=Touchpad_write
        //%block="Write %value to register%register on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        writeMTCH6102(value: number, register: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID);
        }

        //%blockId=Touchpad_read
        //%block="Read from register%register on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        readMTCH6102(register: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.Int8LE, true, this.myBoardID, this.myClickID)
            return bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID).getUint8(0);
        }
    }
}