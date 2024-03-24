//------------------------- Click Board Touchpad_3 -----------------------------------
//% weight=100 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Touchpad_3 {
    export enum gestures {
        No_Gesture = 0x00,
        Single_Click = 0x10,
        Click_Hold = 0x11,
        Double_Click = 0x20,
        Down_Swipe = 0x31,
        Down_Swipe_Hold = 0x32,
        Right_Swipe = 0x41,
        Right_Swipe_Hold = 0x42,
        Up_Swipe = 0x51,
        Up_Swipe_Hold = 0x52,
        Left_Swipe = 0x61,
        Left_Swipe_Hold = 0x62
    }


    /**
     * Sets ButtonG object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Touchpad_3 the Touchpad_3 Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable=" Touchpad_3"
    //% weight=110
    export function createTouchpad_3(boardID: BoardID, clickID: ClickID): Touchpad_3 {
        return new Touchpad_3(boardID, clickID);
    }

    export class Touchpad_3 {

        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x25

        private readonly COMMAND_WR = 0x4A
        private readonly COMMAND_RD = 0x4B
        private readonly COMMAND_ADD = 0x55

        private readonly FWMAJOR = 0x00
        private readonly FWMINOR = 0x01
        private readonly APPIDH = 0x02
        private readonly APPIDL = 0x03
        private readonly CMD = 0x04
        private readonly MODE = 0x05
        private readonly MODECON = 0x06
        private readonly TOUCH_STATE = 0x10
        private readonly TOUCH_XREG = 0x11
        private readonly TOUCH_YREG = 0x12
        private readonly GESTURESTATE = 0x14

        //Masks
        private readonly touch_mask = 0x01
        private readonly gesture_mask = 0x02

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.initialize()
        }


        //%blockId= Touchpad_3_initialize
        //%block="Initalize Touchpad_3 with i2c address %deviceAddr on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS

            bBoard_Control.setIODirection(clickIOPin.INT, clickIODirection.input, this.myBoardID, this.myClickID)
            bBoard_Control.setIODirection(clickIOPin.RST, clickIODirection.output, this.myBoardID, this.myClickID)

            bBoard_Control.writePin(1,clickIOPin.RST, this.myBoardID, this.myClickID)
            basic.pause(5)
            bBoard_Control.writePin(0,clickIOPin.RST, this.myBoardID, this.myClickID)
            basic.pause(150)

            // this.writeMTCH6301(0b0011, this.MODE) //Set the mode to full 
            //sens command

            let i2cBuffer = pins.createBuffer(5) //Create a buffer to send over I2C
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, 0x4A) //The remaining item(s) in the buffer is(are) the value(s) to send
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, 0x55) //The remaining item(s) in the buffer is(are) the value(s) to send
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, 0x55) //The remaining item(s) in the buffer is(are) the value(s) to send
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 3, 0x01) //The remaining item(s) in the buffer is(are) the value(s) to send
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 4, 0x83) //The remaining item(s) in the buffer is(are) the value(s) to send

            let i2cArray :number[] = [];
            i2cArray[0] = 0x25
            i2cArray[1] = 0x00
            i2cArray[2] = 0x55
            i2cArray[3] = 0x01
            i2cArray[4] = 0x83
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, i2cArray, null, 0)



            this.MTCH6301_readBlock(0x4B, 10);


        }

        //%blockId= Touchpad_3_getX
        //%block="Get X position"
        //% blockGap=7
        //% advanced=false
        getX(): number {
            return this.readMTCH6301(this.TOUCH_XREG);
        }

        //%blockId=Touchpad_3_getY
        //%block="Get Y position"
        //% blockGap=7
        //% advanced=false
        getY(): number {
            return this.readMTCH6301(this.TOUCH_YREG);
        }

        //%blockId= Touchpad_3_isTouched
        //%block="Has touch occured"
        //% blockGap=7
        //% advanced=false
        isTouched(): boolean {
            return this.readMTCH6301(this.TOUCH_STATE) & this.touch_mask ? true : false;
        }

        //%blockId= Touchpad_3_isGesture
        //%block="Has gesture occured"
        //% blockGap=7
        //% advanced=false
        isGesture(): boolean {
            let gestureState = this.readMTCH6301(this.TOUCH_STATE)
            if (((gestureState & this.gesture_mask) >> 1) == 1) {
                return true
            }
            return false;
        }

        //%blockId= Touchpad_3_getGestureName
        //%block="Convert gesture ID %gestureID to a friendly name"
        //% blockGap=7
        //% advanced=false    
        getGestureName(gestureID: number): string {
            switch (gestureID) {
                case gestures.Single_Click:
                    return "Single Click"
                    break;

                case gestures.Click_Hold:
                    return "Click & Hold"
                    break;

                case gestures.Double_Click:
                    return "Double Click"
                    break;

                case gestures.Down_Swipe:
                    return "Down"
                    break;

                case gestures.Down_Swipe_Hold:
                    return "Down Hold"
                    break;

                case gestures.Right_Swipe:
                    return "Right"
                    break;

                case gestures.Right_Swipe_Hold:
                    return "Right Hold"
                    break;

                case gestures.Up_Swipe:
                    return "Up"
                    break;

                case gestures.Up_Swipe_Hold:
                    return "Up Hold"
                    break;

                case gestures.Left_Swipe:
                    return "Left"
                    break;

                case gestures.Left_Swipe_Hold:
                    return "Left Hold"
                    break;
            }
            return "None"
        }

        //%blockId= Touchpad_3_getTouchState
        //%block="Get touch status"
        //% blockGap=7
        //% advanced=true
        getTouchState(): number {
            return this.readMTCH6301(this.TOUCH_STATE);
        }

        //%blockId= Touchpad_3_getGesture
        //%block="Get gesture"
        //% blockGap=7
        //% advanced=false
        getGesture(): number {
            return this.readMTCH6301(this.GESTURESTATE);
        }

        //%blockId= Touchpad_3_write
        //%block="Write %value to register%register"
        //% blockGap=7
        //% advanced=true
        writeMTCH6301(value: number, register: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID);
        }

        //%blockId= Touchpad_3_read
        //%block="Read from register%register"
        //% blockGap=7
        //% advanced=true
        readMTCH6301(register: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.Int8LE, true, this.myBoardID, this.myClickID)
            return bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID).getUint8(0);
        }


        MTCH6301_writeBlock(write_buff: number[], length: number) {
            let i2cBuffer = pins.createBuffer(length) //Create a buffer to send over I2C
            for (let i = 0; i < length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i, write_buff[i]) //The remaining item(s) in the buffer is(are) the value(s) to send
            }

            // let i2cBuffer = Buffer.concat([pins.createBufferFromArray([this.myI2CAddress, 0]), write_buff]) //Add the two control bytes to the beginning of the buffer
            // bBoard_Control.i2cWriteBuffer(this.DEFAULT_I2C_ADDRESS, i2cBuffer, this.myBoardID, this.myClickID); //Send the I2C buffer
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0)

        }

        MTCH6301_readBlock(reg_addr: number, numBytes: number): number[] {
            //let i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 1, 1, this.DEFAULT_I2C_ADDRESS, reg_addr, numBytes, this.myBoardID, this.myClickID);
            let i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [reg_addr, numBytes], null, numBytes)
            let dataArray: number[] = []; //Create an array to hold our read values
            for (let i = 0; i < numBytes; i++) {
                dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
            }
            return dataArray
        }
    }
}