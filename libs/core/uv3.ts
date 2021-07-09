//-------------------------Click Board UV_3 -----------------------------------
//% weight=908 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace UV_3 {
    /**
     * Sets UV_3 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param UV_3 the UV_3 Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="UV_3"
    //% weight=110
    export function createUV_3(boardID: BoardID, clickID: ClickID): UV_3 {
        return new UV_3(boardID, clickID);
    }

    export class UV_3 {
        private readonly VEML6070_ADDR_ARA = (0x18 >> 1)
        private readonly VEML6070_ADDR_CMD = (0x70 >> 1)
        private readonly VEML6070_ADDR_DATA_LSB = (0x71 >> 1)
        private readonly VEML6070_ADDR_DATA_MSB = (0x73 >> 1)
        // VEML6070 command register bits
        private readonly VEML6070_CMD_SD = 0x01
        private readonly VEML6070_CMD_IT_0_5T = 0x00
        private readonly VEML6070_CMD_IT_1T = 0x04
        private readonly VEML6070_CMD_IT_2T = 0x08
        private readonly VEML6070_CMD_IT_4T = 0x0C
        private readonly VEML6070_CMD_DEFAULT = 0x02
        private controlReg : number;

        private myBoardID: number
        private myClickID: number
        private myI2CAddress:number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.initialize()
        }

        initialize() {
            this.myI2CAddress = this.VEML6070_ADDR_CMD
            this.controlReg = this.VEML6070_CMD_DEFAULT; //Int disabled, 1/2T (~ 60ms) and shutdown disabled. 
            this.writeVEML6070(this.myI2CAddress, this.controlReg) //Int disabled, 1/2T (~ 60ms) and shutdown disabled. 
        }

        //%blockId=VEML6070_write
        //%block="$this Write $value to VEML6070 control register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=UV_3
        //% this.shadow=variables_get
        //% this.defl="UV_3"
        writeVEML6070(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteNumber(register, value, NumberFormat.UInt8LE, false, this.myBoardID, this.myClickID)   
        }

        //%blockId=VEML6070_UVSteps
        //%block="$this UV Intensity"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=UV_3
        //% this.shadow=variables_get
        //% this.defl="UV_3"
        UVSteps() {
            let MSB = this.readVEML6070(this.VEML6070_ADDR_DATA_MSB);
            let LSB = this.readVEML6070(this.VEML6070_ADDR_DATA_LSB);
            return ((MSB << 8) | LSB)
        }

        //%blockId=VEML6070_enable
        //%block="$this Turn off device"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=UV_3
        //% this.shadow=variables_get
        //% this.defl="UV_3"
        enableShutdown() {
            this.controlReg = this.controlReg & 0xFE;
            this.writeVEML6070(this.myI2CAddress, this.controlReg);
        }

        //%blockId=VEML6070_disable
        //%block="$this Turn on device"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=UV_3
        //% this.shadow=variables_get
        //% this.defl="UV_3"
        disableShutdown() {
            this.controlReg = this.controlReg | 0x01;
            this.writeVEML6070(this.myI2CAddress, this.controlReg);
        }

        //%blockId=VEML6070_read
        //%block="$this Read from slave address $slaveAddress"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=UV_3
        //% this.shadow=variables_get
        //% this.defl="UV_3"
        readVEML6070(register: number): number {
            let i2cBuffer = pins.createBuffer(2);
            bBoard_Control.i2cWriteNumber(this.myI2CAddress,register,NumberFormat.Int8LE,false,this.myBoardID,this.myClickID)
            i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress,1,this.myBoardID,this.myClickID);           
            return i2cBuffer.getUint8(0)
        }
    }
}

