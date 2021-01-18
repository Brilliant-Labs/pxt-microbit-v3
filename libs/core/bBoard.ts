



// Configuring command messages...


const enum BoardID{

    //% block="b.Board"
    zero = 0,
 }
//     //% block="Expansion 1"
//     one = 1,
//     //% block="Expansion 2"
//     two,
//     //% block="Expansion 3"
//     three,
//     //% block="Expansion 4"
//     four,
//     //% block="Expansion 5"
//     five,
//     //% block="Expansion 6"
//     six,
//     //% block="Expansion 7"
//     seven,
//     //% block="Expansion 8"
//     eight,
//     //% block="Expansion 9"
//     nine, 
//         //% block="Expansion 10"
//         ten,
//         //% block="Expansion 11"
//         eleven,
//         //% block="Expansion 12"
//         twelve,
//         //% block="Expansion 13"
//         thirteen,
//         //% block="Expansion 14"
//         fourteen,
//         //% block="Expansion 15"
//         fifteen,
//         //% block="Expansion 16"
//         sixteen,
//         //% block="Expansion 17"
//         seventeen,
//         //% block="Expansion 18"
//         eighteen,
//         //% block="Expansion 19"
//         nineteen, 
//         //% block="Expansion 20"
//         Twenty

// }


const enum ClickID{


//% block="Clickboard A"
A = 1,
 

//% block="Clickboard B"
B=2,

   //% block="No Click"
   Zero= 0

}
// function checkifexists(): number{
//     let retval=25;
//     for (var _i = 2; _i < 24; _i++) {
//         if(bBoard_Control.arrayClick.indexOf(_i) !== -1){
//             retval= 25;
//         }
//         else{
//             retval= _i;
//         }
//     }
//     console.log("RetVal "+retval)
//     return retval;
// }

enum clickIOPin {

AN = 0x0001,
RST = 0x0002,
CS = 0x0004,
SCK = 0x0008,
MISO = 0x0010,
MOSI = 0x0020,
SDA = 0x0400,
SCL = 0x0800,
TX = 0x1000,
RX = 0x2000,
INT = 0x4000,
PWM = 0x8000


}
enum IOPullDirection
{
  
    //% block="Pull Up"
    one = 1,
    //% block="Pull Down"
    two = 2,
    //% block="None"
    three = 3

}
enum ODCEnable
{
  
    //% block="Disable"
    zero = 0,
    //% block="Enable"
    one = 1,
 

}
enum clickADCPin {
AN = 0x0001,
RST = 0x0002,
PWM = 0x8000

}
enum SPIMode {

Mode0 = 0,
Mode1 = 1,
Mode2 = 2,
Mode3 = 3

}


enum clickPWMPin {
AN = 0x0001,
RST = 0x0002,
PWM = 0x8000,
INT = 0x4000
}

enum clickIODirection {

input = 3,
output = 2

}

enum bBoardEvents {

    UARTRx = 1,
    CN_HIGH = 2,
    CN_LOW = 4,
    MIC_THRESHOLD = 8

    
    }
enum moduleIDs
{

    // Module Ids
GPIO_module_id = 1,
 UART_module_id = 2,
 I2C_module_id = 4,
 SPI_module_id = 5,
 MOTOR_module_id = 6,
 MIC_module_id = 7,
 PWM_module_id = 8,
 ADC_module_id = 9,
 MUSIC_module_id = 10,
 EEPROM_module_id = 0xD,
 NEOPIXEL_module_id = 0xE,
 STATUS_module_id = 0x10
}




let callbackArrays:bBoard_Control.EventHandler[] = [] //Create an array of EventHandler objects
//-------------------------Click Board Blocks Begin -----------------------------------
/**
 * Custom clickBoard
 */
//% advanced=true
//% weight=100 color=#9E4894 icon=""
//% labelLineWidth=1001
namespace bBoard_Control {

       
let enabled = false

enum interruptState
{

    // Module Ids
active = 1,

}
function dummy(a:any):any
{

}
export class EventHandler
{
    
    public cbBody: (params:any) => void
    public cbFunction: (params:any) => any
    public cbFinal: (params:any) => any
      public boardID:number
    public clickID : number
        public eventID : number
        public cbFunctionParms: Array<any>
        public clickAddress:number
        public clickEventID: number


    constructor(boardID: BoardID, clickID:ClickID, eventID: number, params: Array<any>,cbFunction: (params:any) => any,cbBody: (params:any) => any,cbFinal: (params:any) => any){
        this.boardID=boardID;
        this.clickID=clickID;
        this.eventID = eventID;
        this.cbBody = cbBody;
        this.cbFunction = cbFunction;
        this.cbFinal = cbFinal
        this.cbFunctionParms = params;
        this.clickAddress = boardID*3 + clickID; 
        this.clickEventID = clickEventID(this.clickAddress)
    }

}




let onbBoardEventHandler: () => void; //Create an anonymous function and leave it uninitialized 

//% blockId=bBoardEvent block="bBoardEvent $boardID $clickID $eventID" blockAllowMultiple=1
//% afterOnStart=true                               //This block will only execute after the onStart block is finished
let eventStart = false;
//clearAllInterrupts();

function clearAllInterrupts()
{
    BLiX(0,0,STATUS_module_id,STATUS_INTERRUPT_ENABLE_MASK,pins.createBufferFromArray([0x00000000]),0); //Disable all interrupts (Only good for b.Board. Will have to address expansion boards)

}
export function clickEventID(clickAddress:number):number
{
    let clickEventID = 1;
return clickEventID<<clickAddress
}

export function ClickAddressID(clickEventID:number):number
{
    let index = 0; 
    if(clickEventID)
    {
        while(clickEventID !=1)
        {
            clickEventID>>=1;
            index++;
        }
        return index
    }
    return null
}
export function bBoardEvent(boardID: BoardID, clickID:ClickID, eventID: number, params: Array<any>,cbFunction: (params:any) => any,cbBody: (params:any) => any,cbFinal: (params:any) => any): void { //Pass user blocks as a callback function "a". 
    eventStart = true
    let eventHandler = new EventHandler(boardID,clickID,eventID,params,cbFunction,cbBody,cbFinal);
    if(!callbackArrays.find(o => (o.boardID == boardID && o.clickID == clickID && o.eventID == eventID))) //If a callback function has not already been provided
    {
        callbackArrays.push(eventHandler)  //Set our anonymous function to the callback "a" provided by user
    }
    


}

export function addEvent(event:EventHandler)
{
   
    if(!callbackArrays.find(o => (o.boardID === event.boardID && o.clickID === event.clickID && o.eventID === event.eventID))) //If a callback function has not already been provided
    {
        callbackArrays.push(event)  //Set our anonymous function to the callback "a" provided by user
        BLiX(event.clickAddress,0,STATUS_module_id,STATUS_INTERRUPT_ENABLE_MASK_SET,pins.createBufferFromArray([event.eventID]),0); //Set the interrupt pin

    }
}



export function eventInit(){
    eventStart = true;
 
}

export function pinEventCheck(clickAddress:number,pin:clickIOPin,direction: bBoardEvents):number
{
    let buf = pins.createBuffer(2);
    let functionID = direction==bBoardEvents.CN_HIGH? STATUS_INTERRUPT_CN_HIGH:STATUS_INTERRUPT_CN_LOW
    if(BLiX(clickAddress,pin,STATUS_module_id,functionID,null,2).getNumber(NumberFormat.UInt16LE,0))
    {
        return 1
    }
   
    return null
}
export function pinEventSet(clickAddress:number,pin:clickIOPin,direction: bBoardEvents)
{
    let functionID = direction==bBoardEvents.CN_HIGH? STATUS_INTERRUPT_ENABLE_CN_HIGH_SET:STATUS_INTERRUPT_ENABLE_CN_LOW_SET
    BLiX(clickAddress,pin,STATUS_module_id,functionID,null,0)
}

export function pinEventClear(clickAddress:number,pin:clickIOPin,direction: bBoardEvents)
{
    let functionID = direction==bBoardEvents.CN_HIGH? STATUS_INTERRUPT_ENABLE_CN_HIGH_CLR:STATUS_INTERRUPT_ENABLE_CN_LOW_CLR
    BLiX(clickAddress,pin,STATUS_module_id,functionID,null,0)
}

function eventCheck(event:EventHandler,boardID:number,eventID:number,clickID:number):boolean { 
    return (event.boardID === boardID && event.clickID === clickID && event.eventID == eventID)
  }


control.runInParallel( function(){ //Create another "thread" to run this code
let clickMask = 0;
let eventMask = 0;
let currentClickMask = 0;
let currentEventMask = 0;
let clickAddressID = 1;
let clickID = 0;
let boardID = 0;
let eventHandlerList:EventHandler[] =[]
let currentEventHandler:EventHandler = new EventHandler(null,null,null,null,null,null,null);
let cbFunctionResults: any;



while(1)
{

    if(eventStart)
    {
       
        //callbackArrays.find(function (ob) { return ob.clickID === clickID})
       
    if(pins.digitalReadPin(DigitalPin.P12) == interruptState.active) //Check to see if the P12 pin is active
    {
        clickMask = getClickEventMask() //Get the click mask (clear P12)
        
        while(clickMask > 0)  
        {
            for(let clickIndex = 0;clickIndex < 32;clickIndex++)
            {   if(clickMask == 0)
                {
                    break;
                }
                currentClickMask = (clickMask & (0x0001<< clickIndex));
                if(currentClickMask)
                {
                    clickMask = clickMask & ~(0x0001<< clickIndex)
         
                
                    clickAddressID = ClickAddressID(currentClickMask)
               
                  
                    boardID = Math.idiv(clickAddressID,3)
                    clickID = clickAddressID%3
       
         
              
                   
                    eventMask = getInterruptSource(boardID,clickID)

                    for(let eventIndex=0;eventIndex<64;eventIndex++)
                    {
                        if(eventMask == 0)
                        {
                            break;
                        }
                        if((eventMask & (0x0001<< eventIndex)))
                        {
                
                            eventMask = eventMask & ~(0x0001<< eventIndex)
                            currentEventMask = 0x0001 << eventIndex
                      
                            eventHandlerList =filterEvent(boardID,clickID,currentEventMask) 
                          

                            if(eventHandlerList)
                            {
                              for(let i=0;i<eventHandlerList.length;i++)
                              {
                                currentEventHandler = eventHandlerList[i]
                                if(currentEventHandler.cbFunction) //Is there a callback function to be executed?
                                {
                                  
                                  cbFunctionResults = currentEventHandler.cbFunction(currentEventHandler.cbFunctionParms);
                                  if(cbFunctionResults != null) //Did the callback function return a valid reply?
                                  {
                                      currentEventHandler.cbBody(<any>cbFunctionResults) //Fire callback body
                                      if(currentEventHandler.cbFinal)
                                      {
                                          currentEventHandler.cbFinal(null) //Fire callback body
                                      }
                                      
                                  }
                                }
                                else
                                {
                                  currentEventHandler.cbBody(null) //Fire callback body
                              
                                  if(currentEventHandler.cbFinal)
                                  {
                                 
                                      currentEventHandler.cbFinal(null) //Fire callback body
                                  }
                                }

                              }
        
                                
                            }
                            
                        }
                    }

                }





            }



        }


    }
    }

    basic.pause(20);
}
})



    function findEvent(boardID: BoardID, clickID: ClickID, eventID: bBoardEvents): EventHandler {
        if (callbackArrays) {
            let length = callbackArrays.length

            for (let i = 0; i < length; i++) {
                if (callbackArrays[i].boardID == boardID && callbackArrays[i].clickID == clickID && callbackArrays[i].eventID == eventID) {
                    return callbackArrays[i]
                }

            }
        }

        return null
    }

    function filterEvent(boardID: BoardID, clickID: ClickID, eventID: bBoardEvents): EventHandler[] {
        let events: EventHandler[] = [];
        
        if (callbackArrays) {
            let length = callbackArrays.length
           
            for (let i = 0; i < length; i++)
            {
                if (callbackArrays[i].boardID == boardID && callbackArrays[i].clickID == clickID && callbackArrays[i].eventID == eventID) {
                    events.push(callbackArrays[i])
                }

            }
        }

        return events
    }
   

    export let arrayClick: BoardID[]=[]

 //   export let arrayClickList: BoardID[]=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]



    //% block=" $boardID $clickID"
    //% blockSetVariable="PWMSettings"
    //% group="PWM"
    //% weight=110
    export function createPWMSettings(boardID:BoardID, clickID:ClickID): PWMSettings {
        return new PWMSettings(boardID, clickID);
   }

    //% block=" $boardID $clickID"
    //% blockSetVariable="UARTSettings"
    //% group="UART"
    //% weight=110
    export function createUARTSettings(boardID:BoardID, clickID:ClickID): UARTSettings {
        return new UARTSettings(boardID, clickID);
   }

    //% block=" $boardID $clickID"
    //% blockSetVariable="I2CSettings"
    //% advanced=true
    //% group="I2C"
    //% weight=110
    export function createI2cSettings(boardID:BoardID, clickID:ClickID): I2CSettings {
        return new I2CSettings(boardID, clickID);
   }


    //% block=" $boardID $clickID"
    //% blockSetVariable="SPISettings"
    //% advanced=true
    //% group="SPI"
    //% weight=110
    export function createSPISettings(boardID:BoardID, clickID:ClickID): SPIsetting {
        return new SPIsetting(boardID, clickID);
   }

    //% block=" $boardID $clickID"
    //% blockSetVariable="PinSettings"
    //% group="Pins"
    //% weight=110
    export function createPinSettings(boardID:BoardID, clickID:ClickID): PinSettings {
        return new PinSettings(boardID, clickID);
   }


    let AnalogValue = 0
    let BBOARD_BASE_ADDRESS = 40;
    let BBOARD_UART_TX_BUFF_SIZE = 128;
    let actionCount = 0
        
    let BBOARD_I2C_ADDRESS = 40

        
    let BBOARD_COMMAND_SW_VERSION = 9

    const enum RX_TX_Settings{

    BBOARD_COMMAND_CLEAR_TX_BUFFER = 1,
    BBOARD_COMMAND_READ_TX_BUFFER_DATA = 2,
    BBOARD_COMMAND_READ_TX_BUFFER_SIZE = 3,
    BBOARD_COMMAND_WRITE_RX_BUFFER_DATA = 4,
    BBOARD_COMMAND_READ_EVENT_CLICK_MASK = 6,
    BBOARD_COMMAND_CLEAR_RX_BUFFER = 0,
    BBOARD_COMMAND_EXECUTE_COMMAND = 7

    }

    // 'Clear BBoard tx buffer' command
    let CLEAR_BBOARD_TX_BUFFER = pins.createBuffer(1)
    CLEAR_BBOARD_TX_BUFFER.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_CLEAR_TX_BUFFER)

    // 'Clear BBoard rx buffer' command
    let CLEAR_BBOARD_RX_BUFFER = pins.createBuffer(1)
    CLEAR_BBOARD_RX_BUFFER.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_CLEAR_RX_BUFFER)

    // 'Read BBoard tx buffer size' command
    let READ_TX_BUFFER_SIZE = pins.createBuffer(1)
    READ_TX_BUFFER_SIZE.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_READ_TX_BUFFER_SIZE)

    // 'Execute BBoard command' command
    let EXECUTE_BBOARD_COMMAND = pins.createBuffer(1)
    EXECUTE_BBOARD_COMMAND.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_EXECUTE_COMMAND)

    // 'Read BBoard TX buffer' command
    let READ_BBOARD_TX_BUFFER = pins.createBuffer(1)
    READ_BBOARD_TX_BUFFER.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_READ_TX_BUFFER_DATA)

    // 'Read BBoard Event Click Mask' command
    let READ_EVENT_CLICK_MASK= pins.createBuffer(1)
    READ_EVENT_CLICK_MASK.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_READ_EVENT_CLICK_MASK)




// Module Ids
let GPIO_module_id = 1
let UART_module_id = 2
let I2C_module_id = 4
let SPI_module_id = 5
let PWM_module_id = 8
let ADC_module_id = 9
let STATUS_module_id = 0x10

// STATUS Ids
let Knock_Knock_id = 1
let FIRMWARE_VERSION_id = 2
let STATUS_INTERRUPT      =          0x05
let STATUS_INTERRUPT_ENABLE_MASK   = 0x06 //Used to set/clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_ENABLE_MASK_SET   = 0x07 //Used to set any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_ENABLE_MASK_CLR   = 0x08 //Used to clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_CN_HIGH       = 0x09 //Query the pin(s) that have caused the CN High Flag to be set
let STATUS_INTERRUPT_ENABLE_CN_HIGH =    0x0A //Set/Clear which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_HIGH_SET = 0x0B //Set which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_HIGH_CLR =0x0C //Clear which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_CN_LOW            = 0x0D //Query the pin(s) that have caused the CN High Flag to be set
let STATUS_INTERRUPT_ENABLE_CN_LOW     = 0x0E //Set/Clear which pin(s) can trigger a CN Low Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_LOW_SET = 0x0F//Set which pin(s) can trigger a CN Low Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_LOW_CLR = 0x10 //Clear which pin(s) can trigger a CN Low Interrupt event

// PWM Function Ids
let PWM_VAL_id = 1
let PWM_PR_id = 2
let PWM_channel_id
let PWM_dutyCycle

//Neopixel Function IDs

let NEOPIXEL_ADD     =          0x01
let NEOPIXEL_REMOVE    =        0x02
let NEOPIXEL_SHOW   =           0x03
let NEOPIXEL_HIDE    =          0x04
let NEOPIXEL_CLEAR      =       0x05
let NEOPIXEL_STRIP_WRITE_SINGLE_DATA =0x06
let NEOPIXEL_STRIP_WRITE_BUFFER_DATA =0x07
let NEOPIXEL_STRIP_READ_SINGLE_DATA  =0x08
let NEOPIXEL_STRIP_READ_BUFFER_DATA  =0x09

// ADC Function Ids
let ADC_READ_id = 16


export class peripheralSettings
{
    private clickBoardNumGlobalPeripheral:number
    private clickIDGlobalPeripheral:number
    private clickAddress : number

    constructor(boardID: BoardID, clickID:ClickID){
        this.clickBoardNumGlobalPeripheral=boardID;
        this.clickIDGlobalPeripheral=clickID;
        this.clickAddress = this.clickBoardNumGlobalPeripheral*3 + this.clickIDGlobalPeripheral 
    }

    sendCommand(clickPin: clickIOPin,moduleID:number,functionID:number)
    {
 
        //Derive the address of the click port (0= on board 1=A 2=B on b.Board)(3 = on board, 4=A, 5=B on Expansion 1 etc)
        BLiX(this.clickAddress,clickPin,moduleID,functionID,null,0)
    
    }


    sendData(clickPin: clickIOPin,moduleID:number,functionID:number, data: number[] )
    {
 
        BLiX(this.clickAddress,clickPin,moduleID,functionID,pins.createBufferFromArray(data),0)
        //Derive the address of the click port (0= on board 1=A 2=B on b.Board)(3 = on board, 4=A, 5=B on Expansion 1 etc)
       
 
    }
    readData16(clickPin: clickIOPin,moduleID:number,functionID:number, data: number[] ):number
    {

       
 
      
        let TX_BUFFER_DATAbuf =  BLiX(this.clickAddress,clickPin,moduleID,functionID,pins.createBufferFromArray(data),2)
        return (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256)


      
    }

    sendBuffer(clickPin: clickIOPin,moduleID:number,functionID:number, buff: Buffer )
    {
 
        BLiX(this.clickAddress,clickPin,moduleID,functionID,buff,0)
     

       



    }
  


    

}
    

   

    
    export class PWMSettings{
        pitchPin : number;
        pitchClick : number;
        private clickBoardNumGlobalPWM:number;

        constructor(boardID: BoardID, clickID: ClickID){
        this.pitchPin = clickPWMPin.PWM; 
        this.pitchClick = BoardID.zero;
        this.clickBoardNumGlobalPWM=boardID*3+clickID;
        }

        analogPitch(frequency:number,ms:number)
        {
      
            if (frequency <= 0) {
            
            this.setDuty(this.pitchPin,0);
            } else {
                this.setDuty(this.pitchPin,70);
                this.PWMFrequency(this.pitchPin,frequency*100);
            }
    
            if (ms > 0) {
                control.waitMicros(ms*1000)
                
                this.setDuty(this.pitchPin,0);
                // TODO why do we use wait_ms() here? it's a busy wait I think
                basic.pause(5);
            }
        
  
        }

    

        //%blockId=set_Duty
        //%block="$this set duty cycle on pin $clickPin to $duty"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% duty.min=0 duty.max=100 
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PWMSettings"
        //% group="PWM"
        setDuty( clickPin: clickPWMPin,duty: number){

           
            let dutyCycle = 0;
            duty = duty/100; 
            dutyCycle = duty * 1000; //the BLiX chip expects a value of 0-1000

            BLiX(this.clickBoardNumGlobalPWM,parseInt(clickPin.toString()),PWM_module_id,PWM_VAL_id,pins.createBufferFromArray([dutyCycle & 0x00FF,(dutyCycle & 0xFF00)>>8]),0)

      
        
    


    
        }

        //%blockId=PWM_frequency
        //%block="$this set PWM frequency on pin $clickPin to $PWMfreq"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PWMSettings"
        //% group="PWM"
        PWMFrequency( clickPin: clickPWMPin,PWMfreq: number){

            BLiX(this.clickBoardNumGlobalPWM,parseInt(clickPin.toString()),PWM_module_id,PWM_PR_id,pins.createBufferFromArray([PWMfreq & 0x00FF,(PWMfreq & 0xFF00)>>8]),0)

        
    


    
        }

        


    }

    /// End of PWM settings




        /// End of PWM functions

    ///Start of Class UARTSettings
    export class UARTSettings{
        //UART Function ids
        protected UART_STATUS : number
        protected UART_INTEN  : number
        protected UART_INTENCLR : number
        public UART_BAUD_id  : number
        protected UART_WRITE_TX_DATA : number
        protected UART_READ_RX_DATA : number
        public UART_READ_RX_DATA_BYTES : number
        protected UART_CLEAR_RX_DATA : number
        private clickBoardNumGlobalUART:number

        constructor(boardID:BoardID, clickID:ClickID){
        this.UART_STATUS = 0
        this.UART_INTEN =  2
        this.UART_INTENCLR = 3
        this.UART_BAUD_id = 4
        this.UART_WRITE_TX_DATA = 5
        this.UART_READ_RX_DATA = 6
        this.UART_READ_RX_DATA_BYTES = 7
        this.UART_CLEAR_RX_DATA = 8
        this.clickBoardNumGlobalUART=boardID*3+clickID;

        }

       getUARTDataSize():number{
    
    
 
        let TX_BUFFER_DATAbuf =     BLiX(this.clickBoardNumGlobalUART,0,UART_module_id,this.UART_STATUS,null,4)
        let UART_RX_SIZE = TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256
   // UART_TX_SIZE = TX_BUFFER_DATAbuf.getUint8(2) + TX_BUFFER_DATAbuf.getUint8(3) * 256

       
       return UART_RX_SIZE;
    }


    clearUARTRxBuffer(){

        BLiX(this.clickBoardNumGlobalUART,0,UART_module_id,this.UART_CLEAR_RX_DATA,null,0)


  
    }

    //%blockId=is_UART_Data_Avail
    //%block="$this is UART data available?"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="UARTSettings"
    //% group="UART"

    isUARTDataAvailable():boolean {

      
      
        if (this.getUARTDataSize()) 
        {
            
           return true;
           
        }
     return false;
    }
    
    /**
    * Set the UART baud rate
    * @param baud the baud rate, eg: 115200
    */
    //% weight=4 advanced=false
    //% blockId=bBoard_UART_frequency block="$this set UART baud to $baud"
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% baud.delf=115200
    //% this.defl="UARTSettings"
    //% group="UART"
    UARTFrequency(baud:number) {
        
        // (Note: BRG = Fp / baudrate)
        //(Note: Fp = 40000000)

        let Fp = 40000000; //Frequency of the dspic Peripheral clock
        let brg = Fp/baud 
        BLiX(this.clickBoardNumGlobalUART,0,UART_module_id,this.UART_BAUD_id,pins.createBufferFromArray([brg & 0x00FF,(brg & 0xFF00)>>8]),0)



    }

        //%blockId=send_UART_Buffer
        //%block="$this send buffer $buff"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="UARTSettings"
        //% group="UART"

        sendBuffer( buff: Buffer){

            BLiX(this.clickBoardNumGlobalUART,0,UART_module_id,this.UART_WRITE_TX_DATA,buff,0)

       
                }

    

   

    //%blockId=get_UART_Byte
    //%block="$this read string"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="UARTSettings"
    //% group="UART"

    getUARTData():string
    {


        let UART_Rx_BuffSize  = this.getUARTDataSize();
     
       if(UART_Rx_BuffSize>0) {
        return BLiX(this.clickBoardNumGlobalUART,0,UART_module_id,this.UART_READ_RX_DATA_BYTES, pins.createBufferFromArray([UART_Rx_BuffSize & 0x00FF ,(UART_Rx_BuffSize & 0xFF00)>>8 ]),UART_Rx_BuffSize).toString()
       }
       return ""
  

     }

        //%blockId=send_UART_String
        //%block="$this send string $UARTString"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="UARTSettings"
        //% group="UART"

        sendString( UARTString: string){
            let remainingBytes = UARTString.length
            
            while( remainingBytes )
            {
                let messageLength = Math.min(remainingBytes+ 6,128);
                let UARTBuf = pins.createBuffer(messageLength);

                UARTBuf.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
                UARTBuf.setNumber(NumberFormat.UInt8LE, 1, this.clickBoardNumGlobalUART)
                UARTBuf.setNumber(NumberFormat.UInt8LE, 2, UART_module_id)
                UARTBuf.setNumber(NumberFormat.UInt8LE, 3,  5)
                UARTBuf.setNumber(NumberFormat.UInt8LE, 4,  0)
                UARTBuf.setNumber(NumberFormat.UInt8LE, 5,  0)

                for(let i=4; i<messageLength;i++)
                {
                        UARTBuf.setNumber(NumberFormat.UInt8LE, i, UARTString.charCodeAt(UARTString.length - remainingBytes + i - 6));
                }

                // Send a message to the UART TX Line to ask for data
                pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
                pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, UARTBuf, false)
                pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
                remainingBytes =remainingBytes - messageLength + 6;
            }

        }
   
    

    }
    ///END of Class UARTSettings  

     // End of UART functions


    ///Start of PinSettings
    export class PinSettings {

            
        // GPIO Function Ids
        protected DIRSET_id : number
        protected DIRCLR_id : number
        public GPIO_id : number
        public SET_id : number
        // ADC Function Ids
public ADC_READ_id: number

        public CLR_id : number
        protected TOGGLE_id : number
        protected GPIOPULLENSET_id : number
        protected ODC_id : number
        private clickBoardNumGlobalIO : number

        private clickBoardNumGlobalPin: number;
     
        constructor(boardID: BoardID, clickID: ClickID){
        this.DIRSET_id = 2
        this.DIRCLR_id = 3
        this.GPIO_id = 4
        this.SET_id = 5
        this.CLR_id = 6
        this.TOGGLE_id = 7
        this.GPIOPULLENSET_id = 0x0B
        this.ODC_id = 0x0D
        this.ADC_READ_id = 16
        this.clickBoardNumGlobalIO=boardID*3 + clickID;
        }


        //%blockId=set_IO_direction
        //%block="$this set pin $clickPin to $direction"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="Pins"
        //% group="Pins"
        setIODirection(clickPin: clickIOPin,direction: clickIODirection){
            
            let directionID = direction == clickIODirection.output? this.DIRSET_id:this.DIRCLR_id

            BLiX(this.clickBoardNumGlobalIO,clickPin,GPIO_module_id,directionID,pins.createBufferFromArray([directionID]),0)
     




        }

        //%blockId=Open_Drain_set
        //%block="$this $ODC_Enable open drain on $clickPin"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PinSettings"
        //% group="Pins"
        setOpenDrain(ODC_Enable: ODCEnable,clickPin: clickIOPin){
           
            BLiX(this.clickBoardNumGlobalIO,clickPin,GPIO_module_id,this.ODC_id,pins.createBufferFromArray([ODC_Enable]),0)
     

           


        }

   
        //%blockId=GPIO_pull_set
        //%block="$this set pin $clickPin to $pullDirection"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PinSettings"
        //% group="Pins"

        setPullDirection(clickPin: clickIOPin,pullDirection: IOPullDirection ){
            BLiX(this.clickBoardNumGlobalIO,clickPin,GPIO_module_id,this.GPIOPULLENSET_id,pins.createBufferFromArray([pullDirection]),0)
     


        }





        //%blockId=digital_Read_Pin
        //%block="$this digital read pin $clickPin"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PinSettings"
        //% group="Pins"
        digitalReadPin( clickPin: clickIOPin):number
        {

            let TX_BUFFER_DATAbuf  = BLiX(this.clickBoardNumGlobalPin,clickPin,GPIO_module_id,this.GPIO_id,null,2)

            let pinStatus = (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256) & clickPin;
    
            return pinStatus == 0 ? 0:1
        
        }
    
        //%blockId=write_pin
        //%block="$this write pin $clickPin to $value"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PinSettings"
        //% group="Pins"

        writePin(value: number, clickPin: clickIOPin){
        
            if(value > 0){
                this.setPin(clickPin);
            
            }

            else{
                this.clearPin(clickPin);
            }
        
    
        }

    

        

        setPin(clickPin: clickIOPin){

            BLiX(this.clickBoardNumGlobalIO,clickPin,GPIO_module_id,this.SET_id,null,0)
        // 'Set clickboard output pins values HIGH' command
       
        }

     

        clearPin( clickPin: clickIOPin){
        
        // 'Set clickboard output pins values LOW' command

        BLiX(this.clickBoardNumGlobalIO,clickPin,GPIO_module_id,this.CLR_id,null,0)
     

   
    
    
        }

            //%blockId=Analog_Read
    //%block="$this analog read pin %clickPin"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
        //% this.defl="PinSettings"
        //% group="Pins"

    analogRead(clickPin: clickADCPin, boardID: BoardID, clickID : ClickID): number{


        let TX_BUFFER_DATAbuf  = BLiX(this.clickBoardNumGlobalIO,parseInt(clickPin.toString()),ADC_module_id,this.ADC_READ_id, null,2)


        return (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256)


      
    }


       
    }


    ///END of class PinSettings

     

   /// End of pinsettings functions


    //%blockId=getFirmwareVersion
    //%block="Get firmware version of $boardID at slot $clickID"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    

    export function getFirmwareVersion(boardID: BoardID, clickID : ClickID): number{
        let clickNumSlot=boardID*3+clickID
   
        let VERSIONBuffer = BLiX(clickNumSlot,0,STATUS_module_id,FIRMWARE_VERSION_id,null,2)

       
        
        let versionInt = VERSIONBuffer.getUint8(1);
        let versionDec = VERSIONBuffer.getUint8(0);


        return (versionInt + versionDec/100);

    }

  //%blockId=getClickEventMask
    //%block="Get click event mask"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    

    export function getClickEventMask(): number{
    
        let analogValue = 0;


        let interruptMask = 0



        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_EVENT_CLICK_MASK, false)
        //control.waitMicros(500)
        //pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
        let MASKBuffer = pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, 4, false)
        

        interruptMask = MASKBuffer.getUint8(0) | MASKBuffer.getUint8(1) << 8 |  MASKBuffer.getUint8(2) <<16 | MASKBuffer.getUint8(3) <<24 
        


    
        return interruptMask;

    }


    //%blockId=getInterruptSource
    //%block="Get Interrupt source on $boardID at slot $clickID"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    

    export function getInterruptSource(boardID: BoardID, clickID : ClickID): number{
        let clickNumSlot=boardID*3+clickID
     
        let interruptMask = 0

        let GET_INTERRUPT_COMMAND = pins.createBuffer(4)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 1, clickNumSlot)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 2, STATUS_module_id)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 3, STATUS_INTERRUPT )


        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, GET_INTERRUPT_COMMAND, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
        control.waitMicros(500)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
        let MASKBuffer = pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, 8, false)
        
        interruptMask =  MASKBuffer.getUint8(0) | MASKBuffer.getUint8(1) << 8 |  MASKBuffer.getUint8(2) <<16 | MASKBuffer.getUint8(3) <<24 |MASKBuffer.getUint8(4) << 32 | MASKBuffer.getUint8(5) << 40 |  MASKBuffer.getUint8(6) <<48 | MASKBuffer.getUint8(7) <<56
        


    
        return interruptMask;
    }
    




    ///START of SPISettings
    export class SPIsetting{
        // SPI Function Ids
        public SPI_WRITE_id : number
        public SPI_READ_id : number
        public SPI_CONFIG_id : number
        public SPI_WRITEBULK_id : number
        protected SPI_WRITEBULK_CS_id : number
        protected  SPI_READBULK_CS_id : number
        public SPI_BAUD_id : number
        public SPI_CONFIG_CS_id : number
        private clickBoardGlobalNumSPI : number

        constructor(boardID:BoardID,clickID:ClickID){
        this.SPI_WRITE_id = 1
        this.SPI_READ_id = 2
        this.SPI_CONFIG_id = 3
        this.SPI_WRITEBULK_id = 4
        this.SPI_WRITEBULK_CS_id = 5
        this. SPI_READBULK_CS_id = 6
        this.SPI_BAUD_id = 7
        this.SPI_CONFIG_CS_id = 8
        this.clickBoardGlobalNumSPI=boardID*3+clickID;

        }
 
        
    //%blockId=spi_Write
    //%block="$this spi write $value"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"

    SPIWrite(value: number){
       
        

        BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_WRITE_id,pins.createBufferFromArray([value]),0)
        

    }


    //%blockId=spi_Write_array
    //%block="$this spi write array $arrayValues"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"

    SPIWriteArray(arrayValues: number[]){
       
        
        BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_WRITEBULK_id,pins.createBufferFromArray(arrayValues),0)
      


  
    }
    /**
    * Set the SPI frequency
    * @param frequency the clock frequency, eg: 1000000
    */
    //% help=pins/spi-frequency weight=4 advanced=true
    //% blockId=bBoard_spi_frequency block="$this spi set frequency $frequency"
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"
    spiFrequency(frequency:number) {
        
        let Fp = 40000000; //Frequency of the dspic Peripheral clock
        let brgl = (Fp/(2*frequency))-1 

        BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_WRITEBULK_id, pins.createBufferFromArray([brgl&0x00FF,(brgl&0xFF00)>>8]),null)


        // (Note: BRG = ( Fp / (2 * BaudRate) ) - 1   )
       // (Note: Fp = 40000000)

      

    }


    //%blockId=spi_Write_buffer
    //%block="$this spi write buffer $bufferValues"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"
    SPIWriteBuffer(bufferValues: Buffer){
       

        
        BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_WRITEBULK_id, bufferValues,null)

        

 
    }

    //%blockId=spi_Mode_Select
    //%block="$this spi set mode to $mode"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"

    SPIModeSelect(mode: SPIMode){
        let SPI_CKE = 1
        let SPI_CKP = 0


       switch(mode)
       {
        case SPIMode.Mode0:
            SPI_CKE = 1
            SPI_CKP = 0
            break;

        case SPIMode.Mode1:
            SPI_CKE = 0
            SPI_CKP = 0
            break;

        case SPIMode.Mode2:
            SPI_CKE = 1
            SPI_CKP = 1
        break;
        case SPIMode.Mode3:
            SPI_CKE = 0
            SPI_CKP = 1
        break;
       }
      

       let BLiXDataBuff = pins.createBufferFromArray([SPI_CKE, SPI_CKP])
     BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_CONFIG_id, BLiXDataBuff,null)

      
  
    }



    //%blockId=spi_Read
    //%block="$this spi read $numBytes bytes"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="SPISettings"
    //% group="SPI"

    SPIread(numBytes: number):number{
   

        let BLiXDataBuff = pins.createBufferFromArray([numBytes])
        return BLiX(this.clickBoardGlobalNumSPI,0,SPI_module_id,this.SPI_READ_id, BLiXDataBuff,numBytes).getUint8(0)



      
        }

        /**
        * Set the SPI Chip Select Pin
        */
        //% weight=4 advanced=true
        //% blockId=bBoard_spi_CS block="$this spi assign CS Pin to pin $clickPin"
        //% blockNamespace=bBoard_Control
        //% this.shadow=variables_get
         //% this.defl="SPISettings"
         //% group="SPI"

        spiCS(clickPin: clickIOPin) {
        
    
        
    
            BLiX(this.clickBoardGlobalNumSPI,clickPin,SPI_module_id,this.SPI_CONFIG_CS_id,null,0)
      
    

        }
    


    }



    ///END  of class SPISettings



    //End of SPIsetting functions


    ///START of I2CSettings
        export class I2CSettings{

            // I2C Function Ids
            public I2C_WRITE_id : number
            public I2C_READ_id : number
            public I2C_WRITE_NO_MEM_id : number
            public I2C_READ_NO_MEM_id : number
            private clickBoardGlobalNumI2C : number

            constructor(boardID:BoardID, clickID:ClickID ){
                this.I2C_WRITE_id = 1
                this.I2C_READ_id = 2
                this.I2C_WRITE_NO_MEM_id = 3
                this.I2C_READ_NO_MEM_id = 4
                this.clickBoardGlobalNumI2C=boardID*3+clickID;

            }

 


        //%blockId=i2c_ReadNoMem
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=true
        //% blockNamespace=bBoard_Control
        //% block="$this i2c read $numBytes bytes at i2c address $address" weight=6

        //% this.shadow=variables_get
        //% this.defl="I2CSettings"
        //% group="I2C"
        

        I2CreadNoMem(address:number, numBytes: number):Buffer{
    

                            
        
    
            let BLiXDataBuff = pins.createBufferFromArray([address,numBytes])
            return BLiX(this.clickBoardGlobalNumI2C,0,I2C_module_id,this.I2C_READ_NO_MEM_id,BLiXDataBuff,numBytes)



      
        
        }



            //%blockId=i2c_Read
            //% blockGap=7
            //% weight=90   color=#9E4894 icon=""
             //% block="$this i2c read $numBytes bytes |at memory address $memAddress |at i2c address $address" weight=6
            //% advanced=true
            //% blockNamespace=bBoard_Control
            //% this.shadow=variables_get
            //% this.defl="I2CSettings"
            //% group="I2C"
            
        

            I2Cread(address:number, memAddress:number,numBytes: number):number{
        
   
        
                let BLiXDataBuff = pins.createBufferFromArray([address,memAddress,numBytes])
                return BLiX(this.clickBoardGlobalNumI2C,0,I2C_module_id,this.I2C_READ_id,BLiXDataBuff,numBytes).getUint8(0)


            
            }


        

        


    /**
     * Write one number to a 7-bit I2C address.
     */
    //% blockId=i2c_write_number
    //% block="i2c $this write number $value|to i2c address $address|of format $format | repeated $repeated" weight=6
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% this.shadow=variables_get
    //% this.defl="I2CSettings"
    //% group="I2C"

    i2cWriteNumber(address:number, value: number, format:NumberFormat, repeated: boolean)
    {
      
        let tempBuf = pins.createBuffer(pins.sizeOf(format))
        let disableStop = repeated == true? 1:0;
        tempBuf.setNumber(format,0,value)

        let concatBuff = Buffer.concat([pins.createBufferFromArray([address,disableStop]),tempBuf]) //Add the two control bytes to the beginning of the buffer
        BLiX(this.clickBoardGlobalNumI2C,0,I2C_module_id,this.I2C_WRITE_id,concatBuff,0)
   
    }


             /**
     * Write a buffer to a 7-bit I2C address.
     */
    //% help=pins/i2c-write-number blockGap=8
    //% blockNamespace=bBoard_Control

    i2cWriteBuffer(address:number, buf: Buffer)
    {
  
        
      let concatBuff = Buffer.concat([pins.createBufferFromArray([address,0]),buf]) //Add the two control bytes to the beginning of the buffer
        BLiX(this.clickBoardGlobalNumI2C,0,I2C_module_id,this.I2C_WRITE_id,concatBuff,0)
      
       
    }
}
    ///END of I2CSettings
        
        


      ///  End of I2C settings functions




  
      export function BLiX(clickAddress:number,clickPin: clickIOPin,moduleID:number,functionID:number, data: Buffer, returnBytes: number ): Buffer
      {
        let BLiXCommandBuff = pins.createBuffer(6)
        let BLiXDataBuff:Buffer;
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 1, clickAddress)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 2, moduleID)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 3, functionID)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 4, clickPin & 0x00FF)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 5, (clickPin & 0xFF00)>>8)
  
          pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
          if(returnBytes > 0)
          {
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
          }
         
          if(data)
          {
            BLiXCommandBuff = Buffer.concat([BLiXCommandBuff, data])
          }
          pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, BLiXCommandBuff, false)
    
          pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
          if(returnBytes >0)
          {
           // pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
            //control.waitMicros(5000)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
            control.waitMicros(500)
            return  pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, returnBytes, false)

          }
        
          return null

      }
      
     
  

}



