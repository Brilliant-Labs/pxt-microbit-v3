//-------------------------Click Board IR sense 3 -----------------------------------
//% weight=902 color=#33BEBB icon="\u223F"
//% advanced=true
//% labelLineWidth=1002
namespace IR_Sense_3 {
    //% Repeat Start
    export enum I2C_RepeatStart {
        True = 1,
        False = 0
    }

    /**
     * Sets Thermo Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param IR_Sense_3 the IR_Sense_3 Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="IR_Sense_3"
    //% weight=110
    export function createIR_Sense(boardID: BoardID, clickID: ClickID): IR_Sense {
        return new IR_Sense(boardID, clickID);
    }

    export class IR_Sense {
        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x60
        private readonly ST1 = 0x04
        private readonly ST2 = 0x09
        private readonly ST3 = 0x0A
        private readonly ST4 = 0x1F
        private readonly IRL = 0x05
        private readonly IRH = 0x06

        private myBoardID: number
        private myClickID: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
            this.IR_initialize()
        }

        IR_initialize() {
            //setTMP116Addr(deviceAddr,boardID)
            this.writeAK9754([0x20, 0xff, 0xfc, 0xa9, 0xf8, 0x80, 0xfa, 0xf0, 0x81, 0x0c, 0x80, 0xf2, 0xff]) //Initialize the Config register
        }

        //%blockId=AK9754_write
        //%block="$this Write array $values to AK9754 register $register ?"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=IR_Sense_3
        //% this.shadow=variables_get
        //% this.defl="IR_Sense_3"
        writeAK9754(values: number[]) {
            let i2cBuffer = pins.createBuffer(values.length)
            for (let i = 0; i < values.length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i, values[i])
            }
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0);
        }

        //% blockId=onHumanDetected block="$this on human detected" blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="IR_Sense_3"
        //% advanced=false
        onHumanDetected(a: () => void): void {
            //let eventHandler = new bBoard_Control.EventHandler(this.myBoardID, this.myClickID, bBoardEvents.CN_LOW, [this.clickAddress, clickIOPin.INT, bBoardEvents.CN_LOW], <any>bBoard_Control.pinEventCheck(this.clickAddress, clickIOPin.INT, bBoardEvents.CN_LOW), <any>a, null);
            //bBoard_Control.pinEventSet(this.clickAddress, clickIOPin.INT, bBoardEvents.CN_LOW)
            //bBoard_Control.addEvent(eventHandler)
        }

        //%blockId=IR_Sense_3_isHumandDetected
        //%block="$this human detected?"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=IR_Sense_3
        //% this.shadow=variables_get
        //% this.defl="IR_Sense_3"
        isHumanDetected(): boolean {
            if (bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID) == 0) //If the interrupt pin has gone low (indicating human detected)
            {
                this.readAK9754(this.IRL); //Datasheet indicates that reading from IRL will clear the interrupt. *Need to confirm if other reads are necessary
                this.readAK9754(this.IRH);
                this.readAK9754(this.ST1);
                this.readAK9754(this.ST2);
                this.readAK9754(this.ST3);
                this.readAK9754(this.ST4);
                return true;
            }
            return false
        }

        //%blockId=AK9754_read
        //%block="$this Read from register$register ?"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=IR_Sense_3
        //% this.shadow=variables_get
        //% this.defl="IR_Sense_3"
        readAK9754(register: number): number {
            let tempBuf = pins.createBuffer(3)
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, this.DEFAULT_I2C_ADDRESS)
            tempBuf.setNumber(NumberFormat.UInt8LE, 1, I2C_RepeatStart.True)
            tempBuf.setNumber(NumberFormat.UInt8LE, 2, register)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)

            return bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [this.DEFAULT_I2C_ADDRESS, 1], null, 1).getUint8(0)
        }
    }
}