//-------------------------Click Board Thermo -----------------------------------
//% weight=905 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Temp_Log_2 {
    declare const TMP116_REG_TEMP = 0x00;
    declare const TMP116_REG_CONFIG = 0x01;
    declare const TMP116_REG_HIGH_LIMIT = 0x02;
    declare const TMP116_REG_LOW_LIMIT= 0x03; 
    declare const TMP116_REG_DEVICE_ID = 0x0F;
    declare const TMP116_DEVICE_ADDRESS = 0x48; 

    /**
     * Sets Temp_Log_2 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Temp_Log_2 the Temp_Log_2 Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Temp_Log_2"
    //% weight=110
    export function createTemp_Log_2(boardID: BoardID, clickID: ClickID): Temp_Log_2 {
        return new Temp_Log_2(boardID, clickID);
    }

    export class Temp_Log_2 {
        private readonly DEFAULT_I2C_ADDRESS = 0x48 
        private myI2CAddress:number 
        private myBoardID: number 
        private myClickID: number 
        
        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.initialize();
        }

        initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS 
            this.writeTMP116(TMP116_REG_CONFIG,0x0220) //Initialize the Config register 
        }

        readTMP116Reg(register: number): number {
            return this.readTMP116(TMP116_REG_CONFIG)
        }

        readT():number { 
            return this.readTemperatureC();
        }

        writeTMP116(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(3)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value >> 8)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0)
        }

        //Reads two consecutive bytes from a given location
        //Stores the result at the provided outputPointer
        readTMP116(register: number): number {
            let i2cBuffer = pins.createBuffer(2); 
            bBoard_Control.i2cWriteNumber(this.myI2CAddress,register,NumberFormat.Int8LE,true,this.myBoardID,this.myClickID) 
            i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress,2,this.myBoardID,this.myClickID);
            let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE,0),1)
            // let msb = i2cBuffer.getUint8(0)
            // let lsb = i2cBuffer.getUint8(1)
            //return (msb << 8 | lsb)
            return sReturn
        }

        //%blockId=Temp_Log_readTemperatureC
        //%block="$this Get temperature in Celcius"
        //% blockGap=7
        //% advanced=false
        //% this.defl="Temp_Log_2"
        readTemperatureC(): number {
            return (this.readTMP116(TMP116_REG_TEMP) * 0.0078125)
        }

        //%blockId=Temp_Log_readTemperatureF
        //%block="$this Get temperature in Fahrenheit"
        //% blockGap=7
        //% advanced=false
        //% this.defl="Temp_Log_2"
        readTemperatureF(): number { 
            return ((this.readTemperatureC()) * 9.0 / 5.0 + 32.0) 
        }

        readHighLimit(): number {
            return (this.readTMP116(TMP116_REG_HIGH_LIMIT) * 0.0078125)
        }

        readLowLimit(): number {
            return (this.readTMP116(TMP116_REG_LOW_LIMIT) * 0.0078125)
        }

        writeHighLimit(limit: number) {
            this.writeTMP116(TMP116_REG_HIGH_LIMIT, (limit / 0.0078125))
        }

        writeLowLimit(limit: number) {
            this.writeTMP116(TMP116_REG_LOW_LIMIT, (limit / 0.0078125))
        }

        readDeviceId(): number {
            return (this.readTMP116(TMP116_REG_DEVICE_ID))
        }
    }
}

