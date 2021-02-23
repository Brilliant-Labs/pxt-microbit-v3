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

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
            this.IR_Initialize()
        }

        IR_Initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
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
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress,i2cBuffer,this.myBoardID,this.myClickID)
        }

        //% blockId=onHumanDetected 
        //% block="$this on human detected" 
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="IR_Sense_3"
        //% advanced=false
        onHumanDetected(a: () => void): void {
            bBoard_Control.eventInit(bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, bBoardEvents.CN_LOW), clickIOPin.INT, () => this.eventHandler(a)); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }

        eventHandler(a: () => void): void {
            if (this.isHumanDetected()){
                a();
            }
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
            let i2cBuffer = pins.createBuffer(2);
            bBoard_Control.i2cWriteNumber(this.myI2CAddress,register,NumberFormat.Int8LE,true,this.myBoardID,this.myClickID)
            i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress,1,this.myBoardID,this.myClickID);           
            return i2cBuffer.getUint8(0)
        }
    }
}