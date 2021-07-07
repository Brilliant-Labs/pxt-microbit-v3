//-------------------------Click Board Thermo -----------------------------------
//% weight=905 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Temp_Log_2 {
    export enum TempUnits {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

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
        private readonly DEFAULT_I2C_ADDRESS = 0x48;
        private readonly TMP116_REG_TEMP = 0x00;
        private readonly TMP116_REG_CONFIG = 0x01;
        private readonly TMP116_REG_HIGH_LIMIT = 0x02;
        private readonly TMP116_REG_LOW_LIMIT = 0x03;
        private readonly TMP116_REG_DEVICE_ID = 0x0F;

        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.initialize()
        }

        initialize() {
            this.writeTMP116(this.TMP116_REG_CONFIG, 0x0220) //Initialize the Config register
        }

        readTMP116Reg(register: number): number {
            return this.readTMP116(this.TMP116_REG_CONFIG)
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
            let tempBuf = pins.createBuffer(2)
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, this.DEFAULT_I2C_ADDRESS)
            tempBuf.setNumber(NumberFormat.UInt8LE, 2, register)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)

            let i2cBuffer = pins.createBuffer(2);
            i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [this.DEFAULT_I2C_ADDRESS, 2], null, 2)
            let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE, 0), 1)
            return sReturn
        }

        //%blockId=Temp_Log_2_Temp
        //%block="$this Temperature in $units"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Temp_Log_2
        //% this.shadow=variables_get
        //% this.defl="Temp_Log_2"
        Temp(units: Temp_Log_2.TempUnits): number {
            let tempC = (this.readTMP116(this.TMP116_REG_TEMP) * 0.0078125)
            let tempF = tempC * 9.0 / 5.0 + 32.0;
            return units == TempUnits.C ? tempC : tempF
        }

        readHighLimit(): number {
            return (this.readTMP116(this.TMP116_REG_HIGH_LIMIT) * 0.0078125)
        }

        readLowLimit(): number {
            return (this.readTMP116(this.TMP116_REG_LOW_LIMIT) * 0.0078125)
        }

        writeHighLimit(limit: number) {
            this.writeTMP116(this.TMP116_REG_HIGH_LIMIT, (limit / 0.0078125))
        }

        writeLowLimit(limit: number) {
            this.writeTMP116(this.TMP116_REG_LOW_LIMIT, (limit / 0.0078125))
        }

        readDeviceId(): number {
            return (this.readTMP116(this.TMP116_REG_DEVICE_ID))
        }
    }
}

