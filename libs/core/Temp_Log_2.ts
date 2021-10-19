/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% advanced=true
namespace Temp_Log_2{

declare const	TMP116_REG_TEMP	= 0x00;
declare const	TMP116_REG_CONFIG = 0x01;
declare const	TMP116_REG_HIGH_LIMIT = 0x02;
declare const	TMP116_REG_LOW_LIMIT= 0x03;	
declare const	TMP116_REG_DEVICE_ID = 0x0F;
declare const  TMP116_DEVICE_ADDRESS = 0x48;

let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
{
    //setTMP116Addr(deviceAddr,clickBoardNum)
    isInitialized[clickBoardNum]  = 1
    setTMP116Addr(deviceAddr,clickBoardNum)
    writeTMP116(TMP116_REG_CONFIG,0x0220,clickBoardNum) //Initialize the Config register

}
function setTMP116Addr(deviceAddr:number,clickBoardNum:clickBoardID)
{
    deviceAddress[clickBoardNum] = deviceAddr;
}
function getTMP116Addr(clickBoardNum:clickBoardID):number
{
    return deviceAddress[clickBoardNum];
}
function readTMP116Reg(register:number,clickBoardNum:clickBoardID):number{
    return readTMP116(TMP116_REG_CONFIG,clickBoardNum)
}

function readT(clickBoardNum:clickBoardID):number
{
	return readTemperatureC(clickBoardNum);
}


function writeTMP116(register:number,value:number,clickBoardNum:clickBoardID)
{


    let i2cBuffer = pins.createBuffer(3)

    i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
    i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value >> 8) 
    i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF)

    bBoard.i2cWriteBuffer(getTMP116Addr(clickBoardNum),i2cBuffer,clickBoardNum);
 
}
//Reads two consecutive bytes from a given location
//Stores the result at the provided outputPointer
function readTMP116( register:number, clickBoardNum:clickBoardID):number
{
    let i2cBuffer = pins.createBuffer(2);

 bBoard.i2cWriteNumber(getTMP116Addr(clickBoardNum),register,NumberFormat.Int8LE,clickBoardNum,true)

 i2cBuffer = bBoard.I2CreadNoMem(getTMP116Addr(clickBoardNum),2,clickBoardNum);


 let msb = i2cBuffer.getUint8(0)
 let lsb = i2cBuffer.getUint8(1)

return  (msb << 8 | lsb)


}

     //%blockId=Temp_Log_readTemperatureC
    //%block="Get temperature in Celcius on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function readTemperatureC(clickBoardNum:clickBoardID):number
{


    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(TMP116_DEVICE_ADDRESS,clickBoardNum)
        
    }
	return (readTMP116(TMP116_REG_TEMP,clickBoardNum) * 0.0078125)
}
  //%blockId=Temp_Log_readTemperatureF
    //%block="Get temperature in Fahrenheit on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function readTemperatureF(clickBoardNum:clickBoardID):number
{
  
	return ((readTemperatureC(clickBoardNum))* 9.0/5.0 + 32.0)
}

function readHighLimit(clickBoardNum:clickBoardID):number
{
	return  (readTMP116(TMP116_REG_HIGH_LIMIT,clickBoardNum) * 0.0078125)
}

function readLowLimit(clickBoardNum:clickBoardID): number
{

	return  (readTMP116(TMP116_REG_LOW_LIMIT,clickBoardNum) * 0.0078125)
}

function writeHighLimit( limit:number,clickBoardNum:clickBoardID)
{
    writeTMP116(TMP116_REG_HIGH_LIMIT,(limit/0.0078125),clickBoardNum)
	
}


function writeLowLimit(limit:number,clickBoardNum:clickBoardID)
{
    writeTMP116(TMP116_REG_LOW_LIMIT,(limit/0.0078125),clickBoardNum)
	

}

function readDeviceId(clickBoardNum:clickBoardID):number
{
  
	return   (readTMP116(TMP116_REG_DEVICE_ID,clickBoardNum))
}

}

