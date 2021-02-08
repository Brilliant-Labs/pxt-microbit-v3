//-------------------------Click Board CO_2 -----------------------------------
//% weight=100 color=#33BEBB icon=""
//% labelLineWidth=1002
//% advanced=true
namespace CO_2 {
    export enum I2C_RepeatStart {
        True = 1,
        False = 0
    }
    /**
     * Sets CO Click object.
     * @param boardID the boardID
     * @param clickID the clickID
     * @param CO_2 the CO Object
    */
    //% block=" $boardID $clickID with $sensitivity nA/ppm"
    //% blockSetVariable="CO_2"
    //% sensitivity.defl="4.75"
    //% weight=110
    export function createCO_2(boardID: BoardID, clickID: ClickID, sensitivity: number): CO_2 {
        return new CO_2(boardID, clickID, sensitivity);
    }

    export class CO_2 {
        private readonly STATUS = 0x00
        private readonly LOCK = 0x01
        private readonly TIACN = 0x10
        private readonly REFCN = 0x11
        private readonly MODECN = 0x12

        private readonly DEFAULT_I2C_ADDRESS = 0x48
        private readonly Vadc_3 = 3.3 / 4096;
        private myBoardID: number
        private myClickID: number
        private sensitivity: number

        constructor(boardID: BoardID, clickID: ClickID, sensitivity: number) {
            this.sensitivity = Math.abs(sensitivity / 1000000000)
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.CO_Initialize()
        }

        CO_Initialize() {
            bBoard_Control.clearPin(clickIOPin.RST, this.myBoardID, this.myClickID) // enable device
            this.Write_CO_Register(this.LOCK, 0x00); //In write mode 
            this.Write_CO_Register(this.MODECN, 0x03); //FET Short Disabled, 3 lead amperometric
            this.Write_CO_Register(this.TIACN, 0x1F); //350K RGain, 100 ohm load
            this.Write_CO_Register(this.REFCN, 0xC0);  //External Ref 10% -0mV Offset 67%Vref
        }

        // Write byte 'byte' to register 'reg'
        Write_CO_Register(register: number, value: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0)
        }

        //% blockId=CO_ReadConcentration
        //% block="Get $this CO concentration reading"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=CO_2
        //% this.shadow=variables_get
        //% this.defl="CO"
        CO_Read_Concentration(): number {
            let Vref = 2.048 * .67 //Voltage Reference 
            let ADCMax = 4096   //Max ADC value 
            let ADCRef = 3.3000 //ADC reference voltage
            let Vout = 0.0 //Output voltage
            let Rgain = 350000.0 //350K ohms

            //**************
            //TODO:  change to event!!!!!
            while (!this.Read_CO_Register(this.STATUS)) {
            }

            let adcVal = this.CO_readADC()
            Vout = (ADCRef * adcVal) / ADCMax
            let numerator = Vref - Vout
            let denominator = Rgain
            let sensorCurrent = numerator / denominator
            let COppm = sensorCurrent / this.sensitivity
            //let CO_voltage=sumval*this.Vadc_3; //Voltage for the force click board
            return COppm
        }

        // Read a byte from register 'reg'
        Read_CO_Register(register: number): number {
            let tempBuf = pins.createBuffer(3)
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, this.DEFAULT_I2C_ADDRESS)
            tempBuf.setNumber(NumberFormat.UInt8LE, 1, I2C_RepeatStart.True)
            tempBuf.setNumber(NumberFormat.UInt8LE, 2, register)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)

            let i2cBuffer = pins.createBuffer(2);
            i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [this.DEFAULT_I2C_ADDRESS, 2], null, 2)
            let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE, 0), 1)
            return i2cBuffer.getUint8(0)
        }

        CO_readADC(): number {
            let i2cBuffer = pins.createBuffer(2);
            i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [0x4D, 2], null, 2)
            let MSB = i2cBuffer.getUint8(0);
            let LSB = i2cBuffer.getUint8(1);
            let returnVal = MSB << 8 | LSB
            return returnVal
        }
    }
}