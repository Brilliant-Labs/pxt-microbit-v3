
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon="↦"
//% advanced=true
namespace Proximity_2{

declare const INTERRUPT_STATUS= 0x00
declare const MAIN_CONFIGURATION = 0x01
declare const RECEIVE_CONFIGURATION=   0x02
declare const TRANSMIT_CONFIGURATION=  0x03
declare const ADC_HIGH_ALS =   0x04
declare const ADC_LOW_ALS= 0x05
declare const ADC_BYTE_PROX=   0x16
declare const ALS_UPPER_THRESHOLD_HIGH =0x06
declare const ALS_UPPER_THRESHOLD_LOW = 0x07
declare const ALS_LOWER_THRESHOLD_HIGH =   0x08
declare const ALS_LOWER_THRESHOLD_LOW =0x09
declare const THRESHOLD_PERSIST_TIMER= 0x0A
declare const PROX_THRESHOLD_INDICATOR =   0x0B
declare const PROX_THRESHOLD = 0x0C
declare const DIGITAL_GAIN_TRIM_GREEN =0x0F
declare const DIGITAL_GAIN_TRIM_INFRARED = 0x10

declare const ADDRESS = 0b1001010;

let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
enum Proximity2_Interrupts {ALS_INT, PROX_INT, NO_INT};

// Read a byte from register 'reg'
function Read_Proximity2_Register( reg:number,clickBoardNum:clickBoardID):number
{
    let i2cBuffer = pins.createBuffer(2);

    bBoard.i2cWriteNumber(ADDRESS,reg,NumberFormat.Int8LE,clickBoardNum,true)
   
    i2cBuffer = bBoard.I2CreadNoMem(ADDRESS,1,clickBoardNum);
   
   
    return i2cBuffer.getUint8(0)
}

// Write byte 'byte' to register 'reg'
function Write_Proximity2_Register(reg:number,  byte:number,clickBoardNum:clickBoardID) 
{
    let i2cBuffer = pins.createBuffer(2)

    i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, reg)
    i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, byte) 
   

    bBoard.i2cWriteBuffer(ADDRESS,i2cBuffer,clickBoardNum);

   
}

function Proximity2_Read_Interrupt(clickBoardNum:clickBoardID):number
{
    let val = Read_Proximity2_Register(INTERRUPT_STATUS,clickBoardNum);
    if (val & 0b1) 
    {
        return Proximity2_Interrupts.ALS_INT;
    } 
    else if (val & 0b10) 
    {
        return Proximity2_Interrupts.PROX_INT;
    } 
    else 
    {
        return Proximity2_Interrupts.NO_INT;
    }
}

     //%blockId=Proximity2_ReadProximity
    //%block="Get proximity reading on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function Proximity2_Read_Proximity(clickBoardNum:clickBoardID):number
{
    if(isInitialized[clickBoardNum] == 0)
    {
        Proximity2_Initialize(clickBoardNum)
        
    }
    let val = Read_Proximity2_Register(ADC_BYTE_PROX,clickBoardNum);
    return val;
}

function Proximity2_Set_Threshold(  thresh:number,clickBoardNum:clickBoardID)
{
    Write_Proximity2_Register(PROX_THRESHOLD, thresh,clickBoardNum);
}

// Setup the chip for proximity sensing
function Proximity2_Initialize(clickBoardNum:clickBoardID)
{
    isInitialized[clickBoardNum] = 1;
    Write_Proximity2_Register(MAIN_CONFIGURATION, 0b110000,clickBoardNum);
    Write_Proximity2_Register(PROX_THRESHOLD_INDICATOR, 0b01000000,clickBoardNum);
    Write_Proximity2_Register(PROX_THRESHOLD_INDICATOR, 0b01000000,clickBoardNum);
    Write_Proximity2_Register(TRANSMIT_CONFIGURATION, 0b00001111,clickBoardNum);
}

     //%blockId=Proximity2_ReadALS
    //%block="Get ambient light reading on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function Proximity2_Read_Als(clickBoardNum:clickBoardID):number
{
    if(isInitialized[clickBoardNum] == 0)
    {
        Proximity2_Initialize(clickBoardNum)
        
    }
    let val = (Read_Proximity2_Register(ADC_HIGH_ALS,clickBoardNum) << 8) | Read_Proximity2_Register(ADC_LOW_ALS,clickBoardNum);
    return val;
}

function Proximity2_Set_Als_Upper_Threshold(thresh:number,clickBoardNum:clickBoardID)
{
    Write_Proximity2_Register( ALS_UPPER_THRESHOLD_HIGH, thresh >> 8,clickBoardNum);;
    Write_Proximity2_Register( ALS_UPPER_THRESHOLD_LOW, thresh & 0xFF,clickBoardNum);
}

function Proximity2_Set_Als_Lower_Threshold(thresh:number,clickBoardNum:clickBoardID)
{
    Write_Proximity2_Register( ALS_LOWER_THRESHOLD_HIGH, thresh >> 8,clickBoardNum);
    Write_Proximity2_Register( ALS_LOWER_THRESHOLD_LOW, thresh & 0xFF,clickBoardNum);
}
}