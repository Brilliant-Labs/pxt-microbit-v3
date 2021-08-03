
//-------------------------Click Board Load Cell 4 -----------------------------------
//% weight=906 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Load_Cell_4 {
    export enum mode {
        //% block="Command Mode"
        command = 0xA0,
        //% block="Normal Mode"
        normal = 0x80
    }
    export enum PreAmp_Gain {
        //% block="1.5x Gain"
        Gain_1_5 = 0x00,
        //% block="3x Gain"
        Gain_3 = 0b100,
        //% block="6x Gain"
        Gain_6 = 0b001,
        //% block="12x Gain"
        Gain_12 = 0b101,
        //% block="24x Gain"
        Gain_24 = 0b010,
        //% block="48x Gain"
        Gain_48 = 0b110,
        //% block="96x Gain"
        Gain_96 = 0b011,
        //% block="192x Gain"
        Gain_192 = 0b111,
    }


    //% Repeat Start
    export enum I2C_RepeatStart {
        True = 1,
        False = 0
    }

    /**
     * Sets Load_Cell_4 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Load_Cell_4; eg: PreAmp_Gain.Gain_48
    */
    //% block=" $boardID $clickID with $currentGain"
    //% blockSetVariable="Load_Cell_4"
    //% currentGain.defl=6
    //% weight=110
    export function createLoadCell4(boardID: BoardID, clickID: ClickID, currentGain:PreAmp_Gain): Load_Cell_4 {
        return new Load_Cell_4(boardID, clickID,currentGain);
    }

    export class Load_Cell_4 {
        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x28
        private readonly B_CONFIG_REG = 0x0F
        private readonly B_CONFIG_REG_DEFL = 0x0B88
        private myI2CAddress: number

        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID,currentGain:PreAmp_Gain) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.load_cell_4_initialize(currentGain);
        }

        load_cell_4_initialize(currentGain:PreAmp_Gain) {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
            this.setMode(mode.command)
            this.writeZSC31014(this.B_CONFIG_REG, this.B_CONFIG_REG_DEFL|(currentGain<<4))
            this.setMode(mode.normal)
        }

        //% blockId=Load_Cell_4_set_mode
        //% block="$this set mode to$mode"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Load_Cell_4
        //% this.shadow=variables_get
        //% this.defl="Load_Cell_4"
        setMode(currentMode: mode) {

            let BLiXCommandBuff2 = pins.createBuffer(11)
            let BLiXCommandBuff = pins.createBuffer(6)


            if (currentMode == mode.command) {
                bBoard_Control.writePin(0, clickIOPin.CS, this.myBoardID, this.myClickID); //Turn the power to the chip off
                control.waitMicros(1000)
            }



            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 0, bBoard_Command.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 1, 1)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 2, GPIO_module_id)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 3, SET_id)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 4, clickIOPin.CS & 0x00FF)
            BLiXCommandBuff.setNumber(NumberFormat.UInt8LE, 5, (clickIOPin.CS & 0xFF00) >> 8)

            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 0, bBoard_Command.BBOARD_COMMAND_WRITE_RX_BUFFER_DATA)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 1, 1)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 2, I2C_module_id)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 3, I2C_WRITE_id)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 4, clickIOPin.CS & 0x00FF)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 5, (clickIOPin.CS & 0xFF00) >> 8)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 6, 40)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 7, 0)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 8, currentMode)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 9, 0x00)
            BLiXCommandBuff2.setNumber(NumberFormat.UInt8LE, 10, 0x00)

            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, BLiXCommandBuff, false)
            control.waitMicros(100)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
            // Write A0 Command mode start
            control.waitMicros(1500)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, CLEAR_BBOARD_RX_BUFFER, false)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, BLiXCommandBuff2, false)
            control.waitMicros(100)
            pins.i2cWriteBuffer(BBOARD_I2C_ADDRESS, EXECUTE_BBOARD_COMMAND, false)
            control.waitMicros(3000)
            basic.pause(15)
            if (currentMode == mode.normal) {
                this.bridgeData(); //dummy read
            }






        }


        //% blockId=ZSC31014_write
        //% block="$this Write $value to register $register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Load_Cell_4
        //% this.shadow=variables_get
        //% this.defl="Load_Cell_4"
        writeZSC31014(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(3)

            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register | 0x40) //Add a 4 to the Command Byte to indicate a write to corresponding EEPROM address
            i2cBuffer.setNumber(NumberFormat.UInt16BE, 1, value) //Write 16 bit register value
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID)
            this.readZSC31014Command(register) //debug
        }

        //% blockId=ZSC31014read
        //% block="$this Read from register$register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Load_Cell_4
        //% this.shadow=variables_get
        //% this.defl="Load_Cell_4"
        readZSC31014Command(register: number): number {

            let i2cBuffer = pins.createBuffer(3)

            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register) //Command Byte to indicate a read from corresponding EEPROM address
            i2cBuffer.setNumber(NumberFormat.UInt16BE, 1, 0x00) //Write 16 bit register value
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID)



            i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 3, this.myBoardID, this.myClickID);
            let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE, 1), 1)
            return sReturn
        }

        //% blockId=Load_Cell_4_bridgeData
        //% block="$this Read bridge data"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Load_Cell_4
        //% this.shadow=variables_get
        //% this.defl="Load_Cell_4"
        bridgeData(): number {


            return bBoard_Control.I2CreadNoMem(0x28, 2, this.myBoardID, this.myClickID).getNumber(NumberFormat.UInt16BE, 0)
        }



    }
}

