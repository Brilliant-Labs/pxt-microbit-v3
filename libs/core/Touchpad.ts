//------------------------- Click Board Touchpad -----------------------------------
//% weight=100 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
namespace Touchpad {
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
     * @param Touchpad the Touchpad Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="Touchpad"
    //% weight=110
    export function createTouchpad(boardID: BoardID, clickID: ClickID): Touchpad {
        return new Touchpad(boardID, clickID);
    }

    export class Touchpad {

        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x25
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


        //%blockId=Touchpad_initialize
        //%block="Initalize touchpad with i2c address %deviceAddr on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
            this.writeMTCH6102(0b0011, this.MODE) //Set the mode to full 
        }

        //%blockId=Touchpad_getX
        //%block="Get X position on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        getX(): number {
            return this.readMTCH6102(this.TOUCH_XREG);
        }

        //%blockId=Touchpad_getY
        //%block="Get Y position on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        getY(): number {
            return this.readMTCH6102(this.TOUCH_YREG);
        }

        //%blockId=Touchpad_isTouched
        //%block="Has touch occured on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=false
        isTouched(): boolean {
            return this.readMTCH6102(this.TOUCH_STATE) & this.touch_mask ? true : false;
        }

        //%blockId=Touchpad_isGesture
        //%block="Has gesture occured on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=false
        isGesture(): boolean {
            let gestureState = this.readMTCH6102(this.TOUCH_STATE)
            if (((gestureState & this.gesture_mask) >> 1) == 1) {
                return true
            }
            return false;
        }

        //%blockId=Touchpad_getGestureName
        //%block="Convert gesture ID %gestureID to a friendly name on click%clickBoardNum"
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

        //%blockId=Touchpad_getTouchState
        //%block="Get touch status on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        getTouchState(): number {
            return this.readMTCH6102(this.TOUCH_STATE);
        }

        //%blockId=Touchpad_getGesture
        //%block="Get gesture on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        getGesture(): number {
            return this.readMTCH6102(this.GESTURESTATE);
        }

        //%blockId=Touchpad_write
        //%block="Write %value to register%register on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        writeMTCH6102(value: number, register: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID);
        }

        //%blockId=Touchpad_read
        //%block="Read from register%register on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        readMTCH6102(register: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.Int8LE, true, this.myBoardID, this.myClickID)
            return bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID).getUint8(0);
        }
    }
}