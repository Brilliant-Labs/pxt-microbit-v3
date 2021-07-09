// Configuring command messages...

const enum BoardID {
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

const BUILT_IN_PERIPHERAL = 0
const enum ClickID {
    //% block="Clickboard A"
    A = 1,
    //% block="Clickboard B"
    B = 2,
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
enum IOPullDirection {
    //% block="Pull Up"
    one = 1,
    //% block="Pull Down"
    two = 2,
    //% block="None"
    three = 3
}
enum ODCEnable {
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
enum moduleIDs {
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
    BLiXel_module_id = 0xE,
    STATUS_module_id = 0x10
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
let READ_EVENT_CLICK_MASK = pins.createBuffer(1)
READ_EVENT_CLICK_MASK.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_READ_EVENT_CLICK_MASK)

let AnalogValue = 0
let BBOARD_BASE_ADDRESS = 40;
let BBOARD_UART_TX_BUFF_SIZE = 128;
let actionCount = 0
let BBOARD_I2C_ADDRESS = 40
let BBOARD_COMMAND_SW_VERSION = 9

const enum RX_TX_Settings {
    BBOARD_COMMAND_CLEAR_TX_BUFFER = 1,
    BBOARD_COMMAND_READ_TX_BUFFER_DATA = 2,
    BBOARD_COMMAND_READ_TX_BUFFER_SIZE = 3,
    BBOARD_COMMAND_WRITE_RX_BUFFER_DATA = 4,
    BBOARD_COMMAND_READ_EVENT_CLICK_MASK = 6,
    BBOARD_COMMAND_CLEAR_RX_BUFFER = 0,
    BBOARD_COMMAND_EXECUTE_COMMAND = 7
}

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
let STATUS_INTERRUPT = 0x05
let STATUS_INTERRUPT_ENABLE_MASK = 0x06 //Used to set/clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_ENABLE_MASK_SET = 0x07 //Used to set any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_ENABLE_MASK_CLR = 0x08 //Used to clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
let STATUS_INTERRUPT_CN_HIGH = 0x09 //Query the pin(s) that have caused the CN High Flag to be set
let STATUS_INTERRUPT_ENABLE_CN_HIGH = 0x0A //Set/Clear which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_HIGH_SET = 0x0B //Set which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_HIGH_CLR = 0x0C //Clear which pin(s) can trigger a CN High Interrupt event
let STATUS_INTERRUPT_CN_LOW = 0x0D //Query the pin(s) that have caused the CN High Flag to be set
let STATUS_INTERRUPT_ENABLE_CN_LOW = 0x0E //Set/Clear which pin(s) can trigger a CN Low Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_LOW_SET = 0x0F//Set which pin(s) can trigger a CN Low Interrupt event
let STATUS_INTERRUPT_ENABLE_CN_LOW_CLR = 0x10 //Clear which pin(s) can trigger a CN Low Interrupt event

// PWM Function Ids
let PWM_VAL_id = 1
let PWM_PR_id = 2
let PWM_channel_id
let PWM_dutyCycle

//BLiXel Function IDs
let BLiXel_ADD = 0x01
let BLiXel_REMOVE = 0x02
let BLiXel_SHOW = 0x03
let BLiXel_HIDE = 0x04
let BLiXel_CLEAR = 0x05
let BLiXel_STRIP_WRITE_SINGLE_DATA = 0x06
let BLiXel_STRIP_WRITE_BUFFER_DATA = 0x07
let BLiXel_STRIP_READ_SINGLE_DATA = 0x08
let BLiXel_STRIP_READ_BUFFER_DATA = 0x09
let BLiXel_STRIP_SET_COLOUR = 0x0A
let BLiXel_STRIP_SET_PIXEL = 0x0B
let BLiXel_STRIP_BAR_GRAPH = 0x0C
let BLiXel_STRIP_SET_BRIGHTNESS = 0x0D
let UART_STATUS = 0
let UART_INTEN = 2
let UART_INTENCLR = 3
let UART_BAUD_id = 4
let UART_WRITE_TX_DATA = 5
let UART_READ_RX_DATA = 6
let UART_READ_RX_DATA_BYTES = 7
let UART_CLEAR_RX_DATA = 8

//GPIO Function IDs
let DIRSET_id = 2
let DIRCLR_id = 3
let GPIO_id = 4
let SET_id = 5
let CLR_id = 6
let TOGGLE_id = 7
let GPIOPULLENSET_id = 0x0B
let ODC_id = 0x0D
let ADC_READ_id = 16

//SPI function IDs
let SPI_WRITE_id = 1
let SPI_READ_id = 2
let SPI_CONFIG_id = 3
let SPI_WRITEBULK_id = 4
let SPI_WRITEBULK_CS_id = 5
let SPI_READBULK_CS_id = 6
let SPI_BAUD_id = 7
let SPI_CONFIG_CS_id = 8

//I2C function IDs
let I2C_WRITE_id = 1
let I2C_READ_id = 2
let I2C_WRITE_NO_MEM_id = 3
let I2C_READ_NO_MEM_id = 4

//-------------------------Click Board Blocks Begin -----------------------------------
/**
 * Custom clickBoard
 */
//% advanced=true
//% weight=100 color=#9E4894 icon=""
//% labelLineWidth=1001
namespace bBoard_Control {
    let enabled = false
    enum interruptState {
        // Module Ids
        active = 1,
    }

    //% blockId=bBoardEvent block="bBoardEvent $boardID $clickID $eventID" blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    let eventStart = false;
    //clearAllInterrupts();

    function clearAllInterrupts() {
        BLiX(0, 0, 0, STATUS_module_id, STATUS_INTERRUPT_ENABLE_MASK, [0x00000000], null, 0); //Disable all interrupts (Only good for b.Board. Will have to address expansion boards)
    }

    export function clickEventID(clickAddress: number): number {
        let clickEventID = 1;
        return clickEventID << clickAddress
    }

    export function ClickAddressID(clickEventID: number): number {
        let index = 0;
        if (clickEventID) {
            while (clickEventID != 1) {
                clickEventID >>= 1;
                index++;
            }
            return index
        }
        return null
    }

    export function eventInit(eventID: number, boardID: BoardID, clickID: ClickID) {
        eventStart = true;
        BLiX(boardID, clickID, 0, STATUS_module_id, STATUS_INTERRUPT_ENABLE_MASK_SET, [eventID], null, 0)
    }

    export function pinEventCheck(boardID: BoardID, clickID: ClickID, pin: clickIOPin, direction: bBoardEvents): number {
        let buf = pins.createBuffer(2);
        let functionID = direction == bBoardEvents.CN_HIGH ? STATUS_INTERRUPT_CN_HIGH : STATUS_INTERRUPT_CN_LOW
        if (BLiX(boardID, clickID, pin, STATUS_module_id, functionID, null, null, 2).getNumber(NumberFormat.UInt16LE, 0)) {
            return 1
        }
        return null
    }

    export function pinEventSet(boardID: BoardID, clickID: ClickID, pin: clickIOPin, direction: bBoardEvents) {
        let absoluteClickAddress = boardID * 3 + clickID;
        let functionID = direction == bBoardEvents.CN_HIGH ? STATUS_INTERRUPT_ENABLE_CN_HIGH_SET : STATUS_INTERRUPT_ENABLE_CN_LOW_SET
        BLiX(boardID, clickID, pin, STATUS_module_id, functionID, null, null, 0)
    }

    export function pinEventClear(boardID: BoardID, clickID: ClickID, pin: clickIOPin, direction: bBoardEvents) {
        let functionID = direction == bBoardEvents.CN_HIGH ? STATUS_INTERRUPT_ENABLE_CN_HIGH_CLR : STATUS_INTERRUPT_ENABLE_CN_LOW_CLR
        BLiX(boardID, clickID, pin, STATUS_module_id, functionID, null, null, 0)
    }

    control.runInParallel(function () { //Create another "thread" to run this code
        let clickMask = 0;
        let eventMask = 0;
        let currentClickMask = 0;
        let currentEventMask = 0;
        let clickID = 0;
        let boardID = 0;

        while (1) {
            if (eventStart) {
                //callbackArrays.find(function (ob) { return ob.clickID === clickID})
                if (pins.digitalReadPin(DigitalPin.P12) == interruptState.active) //Check to see if the P12 pin is active
                {
                    clickMask = getClickEventMask() //Get the click mask (clear P12)
                    while (clickMask > 0) {
                        for (let clickIndex = 0; clickIndex < 32; clickIndex++) {
                            if (clickMask == 0) {
                                break;
                            }
                            currentClickMask = (clickMask & (0x0001 << clickIndex));
                            if (currentClickMask) {
                                clickMask = clickMask & ~(0x0001 << clickIndex)
                                boardID = Math.idiv(clickIndex, 3)
                                clickID = clickIndex % 3
                                eventMask = getInterruptSource(boardID, clickID)
                                for (let eventIndex = 0; eventIndex < 64; eventIndex++) {
                                    if (eventMask == 0) {
                                        break;
                                    }
                                    if ((eventMask & (0x0001 << eventIndex))) {
                                        eventMask = eventMask & ~(0x0001 << eventIndex)
                                        currentEventMask = 0x0001 << eventIndex
                                        control.raiseEvent(BLiX_INT_EVENT, getEventValue(getBoardID(clickIndex), getClickID(clickIndex), currentEventMask))
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

    function getBoardID(absoluteClickAddress: number) {
        return Math.idiv(absoluteClickAddress, 3)
    }

    function getClickID(absoluteClickAddress: number) {
        return absoluteClickAddress % 3
    }

    export let BLiX_INT_EVENT = 28000

    export function getEventValue(boardID: BoardID, clickID: ClickID, eventNumber: number): number {
        eventNumber = eventNumber << 8;
        return (eventNumber | (boardID * 3 + clickID))
    }

    export let arrayClick: BoardID[] = []

    //   export let arrayClickList: BoardID[]=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let AnalogValue = 0
    let BBOARD_BASE_ADDRESS = 40;
    let BBOARD_UART_TX_BUFF_SIZE = 128;
    let actionCount = 0
    let BBOARD_I2C_ADDRESS = 40
    let BBOARD_COMMAND_SW_VERSION = 9

    const enum RX_TX_Settings {
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
    let READ_EVENT_CLICK_MASK = pins.createBuffer(1)
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
    let STATUS_INTERRUPT = 0x05
    let STATUS_INTERRUPT_ENABLE_MASK = 0x06 //Used to set/clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
    let STATUS_INTERRUPT_ENABLE_MASK_SET = 0x07 //Used to set any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
    let STATUS_INTERRUPT_ENABLE_MASK_CLR = 0x08 //Used to clear any of the 64 possible interrupt sources that will trigger the P12 Interrupt Pin
    let STATUS_INTERRUPT_CN_HIGH = 0x09 //Query the pin(s) that have caused the CN High Flag to be set
    let STATUS_INTERRUPT_ENABLE_CN_HIGH = 0x0A //Set/Clear which pin(s) can trigger a CN High Interrupt event
    let STATUS_INTERRUPT_ENABLE_CN_HIGH_SET = 0x0B //Set which pin(s) can trigger a CN High Interrupt event
    let STATUS_INTERRUPT_ENABLE_CN_HIGH_CLR = 0x0C //Clear which pin(s) can trigger a CN High Interrupt event
    let STATUS_INTERRUPT_CN_LOW = 0x0D //Query the pin(s) that have caused the CN High Flag to be set
    let STATUS_INTERRUPT_ENABLE_CN_LOW = 0x0E //Set/Clear which pin(s) can trigger a CN Low Interrupt event
    let STATUS_INTERRUPT_ENABLE_CN_LOW_SET = 0x0F//Set which pin(s) can trigger a CN Low Interrupt event
    let STATUS_INTERRUPT_ENABLE_CN_LOW_CLR = 0x10 //Clear which pin(s) can trigger a CN Low Interrupt event

    // PWM Function Ids
    let PWM_VAL_id = 1
    let PWM_PR_id = 2
    let PWM_channel_id
    let PWM_dutyCycle

    //BLiXel Function IDs
    let BLiXel_ADD = 0x01
    let BLiXel_REMOVE = 0x02
    let BLiXel_SHOW = 0x03
    let BLiXel_HIDE = 0x04
    let BLiXel_CLEAR = 0x05
    let BLiXel_STRIP_WRITE_SINGLE_DATA = 0x06
    let BLiXel_STRIP_WRITE_BUFFER_DATA = 0x07
    let BLiXel_STRIP_READ_SINGLE_DATA = 0x08
    let BLiXel_STRIP_READ_BUFFER_DATA = 0x09

    // ADC Function Ids
    let ADC_READ_id = 16

    export function sendCommand(clickPin: clickIOPin, moduleID: number, functionID: number, boardID: BoardID, clickID: ClickID) {
        //Derive the address of the click port (0= on board 1=A 2=B on b.Board)(3 = on board, 4=A, 5=B on Expansion 1 etc)
        BLiX(boardID, clickID, clickPin, moduleID, functionID, null, null, 0)
    }

    export function sendData(clickPin: clickIOPin, moduleID: number, functionID: number, data: number[], boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, moduleID, functionID, data, null, 0)
        //Derive the address of the click port (0= on board 1=A 2=B on b.Board)(3 = on board, 4=A, 5=B on Expansion 1 etc)
    }

    export function readData16(clickPin: clickIOPin, moduleID: number, functionID: number, data: number[], boardID: BoardID, clickID: ClickID): number {
        let TX_BUFFER_DATAbuf = BLiX(boardID, clickID, clickPin, moduleID, functionID, data, null, 2)
        return (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256)
    }

    export function sendBuffer(clickPin: clickIOPin, moduleID: number, functionID: number, buff: Buffer, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, moduleID, functionID, null, buff, 0)
    }

    export function analogPitch(frequency: number, ms: number, boardID: BoardID, clickID: ClickID) {
        if (frequency <= 0) {
            setDuty(clickPWMPin.PWM, 0, boardID, clickID);
        } else {
            setDuty(clickPWMPin.PWM, 70, boardID, clickID);
            PWMFrequency(clickPWMPin.PWM, frequency * 100, boardID, clickID);
        }
        if (ms > 0) {
            control.waitMicros(ms * 1000)
            setDuty(clickPWMPin.PWM, 0, boardID, clickID);
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
    //% shadow=variables_get
    //% defl="PWMSettings"
    //% group="PWM"
    export function setDuty(clickPin: clickPWMPin, duty: number, boardID: BoardID, clickID: ClickID) {
        let dutyCycle = 0;
        duty = duty / 100;
        dutyCycle = duty * 1000; //the BLiX chip expects a value of 0-1000
        BLiX(boardID, clickID, parseInt(clickPin.toString()), PWM_module_id, PWM_VAL_id, [dutyCycle & 0x00FF, (dutyCycle & 0xFF00) >> 8], null, 0)
    }

    //%blockId=PWM_frequency
    //%block="$this set PWM frequency on pin $clickPin to $PWMfreq"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PWMSettings"
    //% group="PWM"
    export function PWMFrequency(clickPin: clickPWMPin, PWMfreq: number, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, parseInt(clickPin.toString()), PWM_module_id, PWM_PR_id, [PWMfreq & 0x00FF, (PWMfreq & 0xFF00) >> 8], null, 0)
    }

    /// End of PWM settings
    function getUARTDataSize(boardID: BoardID, clickID: ClickID): number {
        let TX_BUFFER_DATAbuf = BLiX(boardID, clickID, 0, UART_module_id, UART_STATUS, null, null, 4)
        let UART_RX_SIZE = TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256
        // UART_TX_SIZE = TX_BUFFER_DATAbuf.getUint8(2) + TX_BUFFER_DATAbuf.getUint8(3) * 256
        return UART_RX_SIZE;
    }

    export function clearUARTRxBuffer(boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, 0, UART_module_id, UART_CLEAR_RX_DATA, null, null, 0)
    }

    //%blockId=is_UART_Data_Avail
    //%block="$this is UART data available?"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="UARTSettings"
    //% group="UART"
    export function isUARTDataAvailable(boardID: BoardID, clickID: ClickID): boolean {
        if (getUARTDataSize(boardID, clickID)) {
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
    //% shadow=variables_get
    //% baud.delf=115200
    //% defl="UARTSettings"
    //% group="UART"
    export function UARTFrequency(baud: number, boardID: BoardID, clickID: ClickID) {
        // (Note: BRG = Fp / baudrate)
        //(Note: Fp = 40000000)
        let Fp = 40000000; //Frequency of the dspic Peripheral clock
        let brg = Fp / baud
        BLiX(boardID, clickID, 0, UART_module_id, UART_BAUD_id, [brg & 0x00FF, (brg & 0xFF00) >> 8], null, 0)
    }

    //%blockId=send_UART_Buffer
    //%block="$this send buffer $buff"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="UARTSettings"
    //% group="UART"
    export function UARTSendBuffer(buff: Buffer, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, 0, UART_module_id, UART_WRITE_TX_DATA, null, buff, 0)
    }

    //%blockId=get_UART_Byte
    //%block="$this read string"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="UARTSettings"
    //% group="UART"
    export function getUARTData(boardID: BoardID, clickID: ClickID): string {
        let UART_Rx_BuffSize = getUARTDataSize(boardID, clickID);
        if (UART_Rx_BuffSize > 0) {
            return BLiX(boardID, clickID, 0, UART_module_id, UART_READ_RX_DATA_BYTES, [UART_Rx_BuffSize & 0x00FF, (UART_Rx_BuffSize & 0xFF00) >> 8], null, UART_Rx_BuffSize).toString()
        }
        return ""
    }

    //%blockId=send_UART_String
    //%block="$this send string $UARTString"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="UARTSettings"
    //% group="UART"
    export function UARTSendString(UARTString: string, boardID: BoardID, clickID: ClickID) {
        let remainingBytes = UARTString.length
        let clickBoardNum = boardID * 3 + clickID
        while (remainingBytes) {
            let messageLength = Math.min(remainingBytes + 6, 128);
            let UARTBuf = pins.createBuffer(messageLength);
            UARTBuf.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
            UARTBuf.setNumber(NumberFormat.UInt8LE, 1, clickBoardNum)
            UARTBuf.setNumber(NumberFormat.UInt8LE, 2, UART_module_id)
            UARTBuf.setNumber(NumberFormat.UInt8LE, 3, 5)
            UARTBuf.setNumber(NumberFormat.UInt8LE, 4, 0)
            UARTBuf.setNumber(NumberFormat.UInt8LE, 5, 0)
            for (let i = 4; i < messageLength; i++) {
                UARTBuf.setNumber(NumberFormat.UInt8LE, i, UARTString.charCodeAt(UARTString.length - remainingBytes + i - 6));
            }
            // Send a message to the UART TX Line to ask for data
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, UARTBuf, false)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
            remainingBytes = remainingBytes - messageLength + 6;
        }
    }

    //%blockId=set_IO_direction
    //%block="$this set pin $clickPin to $direction"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="Pins"
    //% group="Pins"
    export function setIODirection(clickPin: clickIOPin, direction: clickIODirection, boardID: BoardID, clickID: ClickID) {
        let directionID = direction == clickIODirection.output ? DIRSET_id : DIRCLR_id
        BLiX(boardID, clickID, clickPin, GPIO_module_id, directionID, [directionID], null, 0)
    }

    //%blockId=Open_Drain_set
    //%block="$this $ODC_Enable open drain on $clickPin"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PinSettings"
    //% group="Pins"
    export function setOpenDrain(ODC_Enable: ODCEnable, clickPin: clickIOPin, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, GPIO_module_id, ODC_id, [ODC_Enable], null, 0)
    }

    //%blockId=GPIO_pull_set
    //%block="$this set pin $clickPin to $pullDirection"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PinSettings"
    //% group="Pins"
    export function setPullDirection(clickPin: clickIOPin, pullDirection: IOPullDirection, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, GPIO_module_id, GPIOPULLENSET_id, [pullDirection], null, 0)
    }

    //%blockId=digital_Read_Pin
    //%block="$this digital read pin $clickPin"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PinSettings"
    //% group="Pins"
    export function digitalReadPin(clickPin: clickIOPin, boardID: BoardID, clickID: ClickID): number {
        let TX_BUFFER_DATAbuf = BLiX(boardID, clickID, clickPin, GPIO_module_id, GPIO_id, null, null, 2)
        let pinStatus = (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256) & clickPin;
        return pinStatus == 0 ? 0 : 1
    }

    //%blockId=write_pin
    //%block="$this write pin $clickPin to $value"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PinSettings"
    //% group="Pins"
    export function writePin(value: number, clickPin: clickIOPin, boardID: BoardID, clickID: ClickID) {
        if (value > 0) {
            setPin(clickPin, boardID, clickID);
        }
        else {
            clearPin(clickPin, boardID, clickID);
        }
    }

    export function setPin(clickPin: clickIOPin, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, GPIO_module_id, SET_id, null, null, 0)
        // 'Set clickboard output pins values HIGH' command
    }

    export function clearPin(clickPin: clickIOPin, boardID: BoardID, clickID: ClickID) {
        // 'Set clickboard output pins values LOW' command
        BLiX(boardID, clickID, clickPin, GPIO_module_id, CLR_id, null, null, 0)
    }

    //%blockId=Analog_Read
    //%block="$this analog read pin %clickPin"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=false
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="PinSettings"
    //% group="Pins"
    export function analogRead(clickPin: clickADCPin, boardID: BoardID, clickID: ClickID): number {
        let TX_BUFFER_DATAbuf = BLiX(boardID, clickID, parseInt(clickPin.toString()), ADC_module_id, ADC_READ_id, null, null, 2)
        return (TX_BUFFER_DATAbuf.getUint8(0) + TX_BUFFER_DATAbuf.getUint8(1) * 256)
    }

    ///END of class PinSettings
    /// End of pinsettings functions

    //%blockId=getFirmwareVersion
    //%block="Get firmware version of $boardID at slot $clickID"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    export function getFirmwareVersion(boardID: BoardID, clickID: ClickID): number {
        let clickBoardNum = boardID * 3 + clickID
        let VERSIONBuffer = BLiX(boardID, clickID, 0, STATUS_module_id, FIRMWARE_VERSION_id, null, null, 2)
        let versionInt = VERSIONBuffer.getUint8(1);
        let versionDec = VERSIONBuffer.getUint8(0);
        return (versionInt + versionDec / 100);
    }

    //%blockId=getClickEventMask
    //%block="Get click event mask"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    export function getClickEventMask(): number {
        let analogValue = 0;
        let interruptMask = 0
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_EVENT_CLICK_MASK, false)
        //control.waitMicros(500)
        //pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
        let MASKBuffer = pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, 4, false)
        interruptMask = MASKBuffer.getUint8(0) | MASKBuffer.getUint8(1) << 8 | MASKBuffer.getUint8(2) << 16 | MASKBuffer.getUint8(3) << 24
        return interruptMask;
    }

    //%blockId=getInterruptSource
    //%block="Get Interrupt source on $boardID at slot $clickID"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% group="_____________"
    export function getInterruptSource(boardID: BoardID, clickID: ClickID): number {
        let clickNumSlot = boardID * 3 + clickID
        let interruptMask = 0
        let GET_INTERRUPT_COMMAND = pins.createBuffer(4)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 1, clickNumSlot)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 2, STATUS_module_id)
        GET_INTERRUPT_COMMAND.setNumber(NumberFormat.UInt8LE, 3, STATUS_INTERRUPT)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, GET_INTERRUPT_COMMAND, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
        control.waitMicros(500)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
        let MASKBuffer = pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, 8, false)
        interruptMask = MASKBuffer.getUint8(0) | MASKBuffer.getUint8(1) << 8 | MASKBuffer.getUint8(2) << 16 | MASKBuffer.getUint8(3) << 24 | MASKBuffer.getUint8(4) << 32 | MASKBuffer.getUint8(5) << 40 | MASKBuffer.getUint8(6) << 48 | MASKBuffer.getUint8(7) << 56
        return interruptMask;
    }

    //%blockId=spi_Write
    //%block="$this spi write $value"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function SPIWrite(value: number, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, 0, SPI_module_id, SPI_WRITE_id, [value], null, 0)
    }

    //%blockId=spi_Write_array
    //%block="$this spi write array $arrayValues"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function SPIWriteArray(arrayValues: number[], boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, 0, SPI_module_id, SPI_WRITEBULK_id, arrayValues, null, 0)
    }

    /**
    * Set the SPI frequency
    * @param frequency the clock frequency, eg: 1000000
    */
    //% help=pins/spi-frequency weight=4 advanced=true
    //% blockId=bBoard_spi_frequency block="$this spi set frequency $frequency"
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function spiFrequency(frequency: number, boardID: BoardID, clickID: ClickID) {
        let Fp = 40000000; //Frequency of the dspic Peripheral clock
        let brgl = (Fp / (2 * frequency)) - 1
        BLiX(boardID, clickID, 0, SPI_module_id, SPI_WRITEBULK_id, [brgl & 0x00FF, (brgl & 0xFF00) >> 8], null, null)
        // (Note: BRG = ( Fp / (2 * BaudRate) ) - 1   )
        // (Note: Fp = 40000000)
    }

    //%blockId=spi_Write_buffer
    //%block="$this spi write buffer $bufferValues"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function SPIWriteBuffer(bufferValues: Buffer, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, 0, SPI_module_id, SPI_WRITEBULK_id, null, bufferValues, null)
    }

    //%blockId=spi_Mode_Select
    //%block="$this spi set mode to $mode"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function SPIModeSelect(mode: SPIMode, boardID: BoardID, clickID: ClickID) {
        let SPI_CKE = 1
        let SPI_CKP = 0
        switch (mode) {
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
        BLiX(boardID, clickID, 0, SPI_module_id, SPI_CONFIG_id, [SPI_CKE, SPI_CKP], null, null)
    }

    //%blockId=spi_Read
    //%block="$this spi read $numBytes bytes"
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function SPIread(numBytes: number, boardID: BoardID, clickID: ClickID): number {
        return BLiX(boardID, clickID, 0, SPI_module_id, SPI_READ_id, [numBytes], null, numBytes).getUint8(0)
    }

    /**
    * Set the SPI Chip Select Pin
    */
    //% weight=4 advanced=true
    //% blockId=bBoard_spi_CS block="$this spi assign CS Pin to pin $clickPin"
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="SPISettings"
    //% group="SPI"
    export function spiCS(clickPin: clickIOPin, boardID: BoardID, clickID: ClickID) {
        BLiX(boardID, clickID, clickPin, SPI_module_id, SPI_CONFIG_CS_id, null, null, 0)
    }

    ///END  of class SPISettings
    //End of SPIsetting functions

    //%blockId=i2c_ReadNoMem
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% block="$this i2c read $numBytes bytes at i2c address $address" weight=6
    //% shadow=variables_get
    //% defl="I2CSettings"
    //% group="I2C"
    export function I2CreadNoMem(address: number, numBytes: number, boardID: BoardID, clickID: ClickID): Buffer {
        return BLiX(boardID, clickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [address, numBytes], null, numBytes)
    }

    //%blockId=i2c_Read
    //% blockGap=7
    //% weight=90   color=#9E4894 icon=""
    //% block="$this i2c read $numBytes bytes |at memory address $memAddress |at i2c address $address" weight=6
    //% advanced=true
    //% blockNamespace=bBoard_Control
    //% shadow=variables_get
    //% defl="I2CSettings"
    //% group="I2C"
    export function I2Cread(address: number, memAddress: number, numBytes: number, boardID: BoardID, clickID: ClickID): number {
        return BLiX(boardID, clickID, 0, I2C_module_id, I2C_READ_id, [address, memAddress, numBytes], null, numBytes).getUint8(0)
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
    //% shadow=variables_get
    //% defl="I2CSettings"
    //% group="I2C"
    export function i2cWriteNumber(address: number, value: number, format: NumberFormat, repeated: boolean, boardID: BoardID, clickID: ClickID) {
        let tempBuf = pins.createBuffer(pins.sizeOf(format))
        let disableStop = repeated == true ? 1 : 0;
        tempBuf.setNumber(format, 0, value)
        let concatBuff = Buffer.concat([pins.createBufferFromArray([address, disableStop]), tempBuf]) //Add the two control bytes to the beginning of the buffer
        BLiX(boardID, clickID, 0, I2C_module_id, I2C_WRITE_id, null, concatBuff, 0)
    }

    /**
    * Write a buffer to a 7-bit I2C address.
    */
    //% help=pins/i2c-write-number blockGap=8
    //% blockNamespace=bBoard_Control
    export function i2cWriteBuffer(address: number, buf: Buffer, boardID: BoardID, clickID: ClickID) {
        let concatBuff = Buffer.concat([pins.createBufferFromArray([address, 0]), buf]) //Add the two control bytes to the beginning of the buffer
        BLiX(boardID, clickID, 0, I2C_module_id, I2C_WRITE_id, null, concatBuff, 0)
    }

    ///END of I2CSettings
    ///  End of I2C settings functions
    export function BLiX(boardID: BoardID, clickID: ClickID, clickPin: clickIOPin, moduleID: number, functionID: number, dataA: number[], dataB: Buffer, returnBytes: number): Buffer {
        let clickAddress = boardID * 3 + clickID;
        let BLiXCommandBuff = pins.createBuffer(6)
        let BLiXDataBuff: Buffer;
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 0, RX_TX_Settings.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 1, clickAddress)
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 2, moduleID)
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 3, functionID)
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 4, clickPin & 0x00FF)
        BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 5, (clickPin & 0xFF00) >> 8)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
        if (returnBytes > 0) {
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_TX_BUFFER, false)
        }
        if (dataA || dataB) {
            if (dataA) {
                dataB = pins.createBufferFromArray(dataA)
            }
            BLiXCommandBuff = Buffer.concat([BLiXCommandBuff, dataB])
        }
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, BLiXCommandBuff, false)
        pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
        if (returnBytes > 0) {
            // pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
            //control.waitMicros(5000)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, READ_BBOARD_TX_BUFFER, false)
            control.waitMicros(500)
            return pins.i2cReadBuffer(BBOARD_I2C_ADDRESS, returnBytes, false)
        }
        return null
    }
}