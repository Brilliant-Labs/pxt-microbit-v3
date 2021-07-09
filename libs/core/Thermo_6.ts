//-------------------------Click Board Thermo_6 -----------------------------------
//% weight=906 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Thermo_6 {
    export enum TempUnits {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }
    //% Repeat Start
    export enum I2C_RepeatStart {
        True = 1,
        False = 0
    }

    /**
     * Sets Thermo_6 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Thermo_6 the Thermo_6 Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Thermo_6"
    //% weight=110
    export function createThermo_6(boardID: BoardID, clickID: ClickID): Thermo_6 {
        return new Thermo_6 (boardID, clickID);
    }

    export class Thermo_6 {
        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x48
        private readonly TEMP_REG = 0x00
        private readonly CONFIG_REG = 0x01
        private readonly THYST_REG = 0x02
        private readonly TOS_REG = 0x03

        //Config Record
        // D0 = One-shot
        // D1 D2 = Conversion rate 
        //   00 -> 0.25 /sec (default)
        //   01 -> 1 /sec
        //   10 -> 4 /sec
        //   11 -> 8 /sec
        // D3 = PEC - Packet Error Checking
        // D4 = Time-out
        // D5 D6 = Resolution
        //   00 -> 8 bit
        //   01 -> 9 bit
        //   10 -> 10 bit (default)
        //   11 -> 12 bit
        // D7 = Data Format
        // D8 = ShutDown
        // D9 = Com/Int
        // D10 = X
        // D11 D12 = Fault Queue
        //   00 -> 1 (default)
        //   01 -> 2
        //   10 -> 4
        //   11 -> 6
        // D13 = X
        // D14 = x
        // D15 = Over Temp Status 
        //
        //Set PEC to off, 12 bit resolution and 8 samples/second
        private readonly CONFIG_VAL = 0x0066

        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.thermo_6_initialize();
        }

        thermo_6_initialize() {
            this.writeMAX31875(this.CONFIG_REG, this.CONFIG_VAL) 
        }

        //% blockId=Thermo6_getTempC
        //% block="$this Temperature in $units"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Thermo_6
        //% this.shadow=variables_get
        //% this.defl="Thermo_6"
        getTemp(units: Thermo_6.TempUnits): number {
            let tempC = this.readMAX31875(this.TEMP_REG) / 256;
            let tempF = tempC * 9.0 / 5.0 + 32.0;
            return units == TempUnits.C ? tempC : tempF
        }

        //% blockId=MAX31875_write
        //% block="$this Write $value to register $register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Thermo_6
        //% this.shadow=variables_get
        //% this.defl="Thermo_6"
        writeMAX31875(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(3)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value >> 8)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0)
        }

        //% blockId=MAX31875_read
        //% block="$this Read from register$register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Thermo_6
        //% this.shadow=variables_get
        //% this.defl="Thermo_6"
        readMAX31875(register: number): number {
            let tempBuf = pins.createBuffer(3)
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, this.DEFAULT_I2C_ADDRESS)
            tempBuf.setNumber(NumberFormat.UInt8LE, 1, I2C_RepeatStart.True)
            tempBuf.setNumber(NumberFormat.UInt8LE, 2, register)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)

            let i2cBuffer = pins.createBuffer(2);
            i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [this.DEFAULT_I2C_ADDRESS, 2], null, 2)
            let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE, 0), 1)
            return sReturn
        }
    }
}