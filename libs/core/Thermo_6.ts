
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% advanced=true
namespace Thermo_6{

     //Address Definitions
declare const DEFAULT_I2C_ADDRESS =  0x48  
declare const  TEMP_REG       = 0x00
declare const  CONFIG_REG     = 0x01
declare const  THYST_REG       = 0x02
declare const  TOS_REG     = 0x03
 


    
    
    
    let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    
       //%blockId=Thermo6_getTempC
        //%block="Get the temperature in Celcius on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        export function getTempC(clickBoardNum:clickBoardID):number
        {
           
            if(isInitialized[clickBoardNum] == 0)
            {
                initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
                
            }
            let temp = readMAX31875( TEMP_REG, clickBoardNum)
            return temp/256
        
        
        }
    
       //%blockId=Thermo6_getTempF
        //%block="Get the temperature in Fahrenheit on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        export function getTempF(clickBoardNum:clickBoardID):number
        {
           
            if(isInitialized[clickBoardNum] == 0)
            {
                initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
                
            }
            let tempC = getTempC(clickBoardNum);
            let tempF = tempC * 9.0/5.0 + 32.0;

            return tempF
        
        
        }
    
       //%blockId=Thermo6_initialize
        //%block="Initalize with i2c address %deviceAddr on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
    export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
    {
       
        isInitialized[clickBoardNum]  = 1
        setMAX31875Addr(deviceAddr,clickBoardNum)
        writeMAX31875(0x0066,CONFIG_REG,clickBoardNum) //Set PEC to off, 12 bit resolution and 8 samples/second
    
    
    }


 //%blockId=MAX31875_write
    //%block="Write %value to register%register on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
    function writeMAX31875(value:number,register:number,clickBoardNum:clickBoardID)
    {
    
    
        let i2cBuffer = pins.createBuffer(3)
    
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value>>8 ) 
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF)

    
        bBoard.i2cWriteBuffer(getMAX31875Addr(clickBoardNum),i2cBuffer,clickBoardNum);
     
    }
    
     //%blockId=MAX31875_read
        //%block="Read from register%register on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
    function readMAX31875( register:number, clickBoardNum:clickBoardID):number
    {
        let i2cBuffer = pins.createBuffer(2);

        bBoard.i2cWriteNumber(getMAX31875Addr(clickBoardNum),register,NumberFormat.UInt8LE,clickBoardNum,true)

        i2cBuffer = bBoard.I2CreadNoMem(getMAX31875Addr(clickBoardNum),2,clickBoardNum);

        let msb = i2cBuffer.getUint8(0)
        let lsb = i2cBuffer.getUint8(1)

        return  (msb << 8 | lsb)

            
    
    }
    
    
    function setMAX31875Addr(deviceAddr:number,clickBoardNum:clickBoardID)
    {
        deviceAddress[clickBoardNum] = deviceAddr;
    }
    function getMAX31875Addr(clickBoardNum:clickBoardID):number
    {
        return deviceAddress[clickBoardNum];
    }
    
    }