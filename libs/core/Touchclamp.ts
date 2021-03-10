//-------------------------Click Board TouchClamp -----------------------------------
//% weight=904 color=#33BEBB icon="↦"
//% advanced=true
//% labelLineWidth=1002
namespace TouchClamp {
    enum TouchClamp_Interrupts { ALS_INT, PROX_INT, NO_INT };
​
    /**
     * Sets TouchClamp Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param TouchClamp the TouchClamp Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="TouchClamp"
    //% weight=110
    export function createTouchClamp(boardID: BoardID, clickID: ClickID): TouchClamp {
        return new TouchClamp(boardID, clickID);
    }
​
    export class TouchClamp {
        private readonly DEFAULT_I2C_ADDRESS = 0x4A
        private readonly INTERRUPT_STATUS = 0x00
        private readonly MAIN_CONFIGURATION = 0x01
        private readonly RECEIVE_CONFIGURATION = 0x02
        private readonly TRANSMIT_CONFIGURATION = 0x03
        private readonly ADC_HIGH_ALS = 0x04
        private readonly ADC_LOW_ALS = 0x05
        private readonly ADC_BYTE_PROX = 0x16
        private readonly ALS_UPPER_THRESHOLD_HIGH = 0x06
        private readonly ALS_UPPER_THRESHOLD_LOW = 0x07
        private readonly ALS_LOWER_THRESHOLD_HIGH = 0x08
        private readonly ALS_LOWER_THRESHOLD_LOW = 0x09
        private readonly THRESHOLD_PERSIST_TIMER = 0x0A
        private readonly PROX_THRESHOLD_INDICATOR = 0x0B
        private readonly PROX_THRESHOLD = 0x0C
        private readonly DIGITAL_GAIN_TRIM_GREEN = 0x0F
        private readonly DIGITAL_GAIN_TRIM_INFRARED = 0x10
​
        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress:number
​
        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.TouchClamp_Initialize()
        }
​
        // Setup the chip for proximity sensing
        TouchClamp_Initialize() {
            //this.isInitialized[this.myBoardID] = 1;
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
            this.Write_TouchClamp_Register(this.MAIN_CONFIGURATION, 0b110000);
            this.Write_TouchClamp_Register(this.PROX_THRESHOLD_INDICATOR, 0b01000000);
            this.Write_TouchClamp_Register(this.PROX_THRESHOLD_INDICATOR, 0b01000000);
            this.Write_TouchClamp_Register(this.TRANSMIT_CONFIGURATION, 0b00001111);
        }
​
        // Write byte 'byte' to register 'reg'
        Write_TouchClamp_Register(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress,i2cBuffer,this.myBoardID,this.myClickID)
        }
​
        //%blockId=TouchClamp_ReadProximity
        //%block="$this proximity"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=TouchClamp
        //% this.shadow=variables_get
        //% this.defl="TouchClamp"
        TouchClamp_Read_Proximity(): number {
            //TODO: Scale 256 = 35mm | 0 120mm (white card)
            let val = this.Read_TouchClamp_Register(this.ADC_BYTE_PROX);
            return val;
        }
​
        //%blockId=TouchClamp_ReadALS
        //%block="$this illuminance(lux)"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=TouchClamp
        //% this.shadow=variables_get
        //% this.defl="TouchClamp"
        TouchClamp_Read_Als(): number {
            let val = (this.Read_TouchClamp_Register(this.ADC_HIGH_ALS) << 8) | this.Read_TouchClamp_Register(this.ADC_LOW_ALS);
            return val * 0x03125; //Assumption that ALSPGA == 0. 0.03125 Lux per LSB
        }
​
        // Read a byte from register 'reg'
        Read_TouchClamp_Register(register: number): number {
            let i2cBuffer = pins.createBuffer(2);
            bBoard_Control.i2cWriteNumber(this.myI2CAddress,register,NumberFormat.Int8LE,true,this.myBoardID,this.myClickID)
            i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress,1,this.myBoardID,this.myClickID);           
            return i2cBuffer.getUint8(0)
        }
​
        TouchClamp_Read_Interrupt(): number {
            let val = this.Read_TouchClamp_Register(this.INTERRUPT_STATUS);
            if (val & 0b1) {
                return TouchClamp_Interrupts.ALS_INT;
            }
            else if (val & 0b10) {
                return TouchClamp_Interrupts.PROX_INT;
            }
            else {
                return TouchClamp_Interrupts.NO_INT;
            }
        }
​
        TouchClamp_Set_Threshold(thresh: number) {
            this.Write_TouchClamp_Register(this.PROX_THRESHOLD, thresh);
        }
​
        TouchClamp_Set_Als_Upper_Threshold(thresh: number) {
            this.Write_TouchClamp_Register(this.ALS_UPPER_THRESHOLD_HIGH, thresh >> 8);;
            this.Write_TouchClamp_Register(this.ALS_UPPER_THRESHOLD_LOW, thresh & 0xFF);
        }
​
        TouchClamp_Set_Als_Lower_Threshold(thresh: number) {
            this.Write_TouchClamp_Register(this.ALS_LOWER_THRESHOLD_HIGH, thresh >> 8);
            this.Write_TouchClamp_Register(this.ALS_LOWER_THRESHOLD_LOW, thresh & 0xFF);
        }
    }
}