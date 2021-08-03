
//-------------------------Click Board NO2 -----------------------------------
//% weight=100 color=#33BEBB icon=""
//% labelLineWidth=1002
//% advanced=true
namespace NO2 {
    export enum I2C_RepeatStart {
        True = 1,
        False = 0
    }

    /**
     * Sets NO2 Click object.
     * @param boardID the boardID
     * @param clickID the clickID
     * @param NO2 the NO2 Object
    */
    //% block=" $boardID $clickID with $sensitivity nA/ppm"
    //% block.loc.fr=" $boardID $clickID avec $sensitivity nA/ppm"
    //% blockSetVariable="NO2"
    //% sensitivity.defl="-40"
    //% weight=110
    export function createNO2Settings(boardID: BoardID, clickID: ClickID, sensitivity: number): NO2 {
        return new NO2(boardID, clickID, sensitivity);
    }

    export class NO2 {
        readonly STATUS = 0x00
        readonly LOCK = 0x01
        readonly TIACN = 0x10
        readonly REFCN = 0x11
        readonly MODECN = 0x12

        private readonly DEFAULT_I2C_ADDRESS = 0x48
        private readonly Vadc_3 = 3.3 / 4096
        private myBoardID: number
        private myClickID: number
        private sensitivity: number

        constructor(boardID: BoardID, clickID: ClickID, sensitivity: number) {
            this.sensitivity = Math.abs(sensitivity / 1000000000)
            this.myBoardID = boardID
            this.myClickID = clickID;
            this.NO2_Initialize()
        }

        NO2_Initialize() {
            bBoard_Control.clearPin(clickIOPin.RST, this.myBoardID, this.myClickID) // enable device

            //this.isInitialized[this.myBoardIDT] = 1;
            this.Write_NO2_Register(this.LOCK, 0x00); //In write mode 
            this.Read_NO2_Register(this.LOCK); //FET Short Disabled, 3 lead amperometric
            this.Write_NO2_Register(this.MODECN, 0x03); //FET Short Disabled, 3 lead amperometric

            //this.isInitialized[this.myBoardIDT] = 1;
            this.Read_NO2_Register(this.MODECN); //FET Short Disabled, 3 lead amperometric

            this.Write_NO2_Register(this.TIACN, 0x1F); //350K RGain, 100 ohm load
            this.Read_NO2_Register(this.TIACN); //FET Short Disabled, 3 lead amperometric

            this.Write_NO2_Register(this.REFCN, 0xC6);  //External Ref 10% -200mV 67%Vref
            this.Read_NO2_Register(this.REFCN); //FET Short Disabled, 3 lead amperometric
        }

        // Write byte 'byte' to register 'reg'
        Write_NO2_Register(reg: number, byte: number) {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, reg)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, byte)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, i2cBuffer, 0)
        }

        //% blockId=NO2_ReadConcentration
        //% block="Get $this NO2 concentration reading in ppm(parts per million)"
        //% block.loc.fr="Obtenir $this concentration NO2 en ppm (parties par million)"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=NO2
        //% this.shadow=variables_get
        //% this.defl="NO2"
        NO2_Read_Concentration(): number {
            let Vref = 2.048 * .67 //Voltage Reference 
            let ADCMax = 4096   //Max ADC value 
            let ADCRef = 3.3000 //ADC reference voltage
            let Vout = 0.0 //Output voltage
            let Rgain = 350000.0 //350K ohms

            //**************
            //TODO:  change to event!!!!!
            while (!this.Read_NO2_Register(this.STATUS)) {

            }

            //FET Short Disabled, 3 lead amperometric
            //val=(ANObj.analogRead(clickADCPin.AN,this.myBoardID, this.myClickID))
            let ADCVal = bBoard_Control.analogRead(clickADCPin.AN,this.myBoardID,this.myClickID)
            //  sumval+=val;
            //}
            //sumval=sumval/20;

            Vout = (ADCRef * ADCVal) / ADCMax
            let numerator = Vref - Vout
            let denominator = Rgain
            let sensorCurrent = numerator / denominator
            let N02ppm = sensorCurrent / this.sensitivity
            //let NO2_voltage=sumval*this.Vadc_3; //Voltage for the force click board
            return N02ppm
        }

        // Read a byte from register 'reg'
        Read_NO2_Register(register: number): number {
            let tempBuf = pins.createBuffer(2);
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, this.DEFAULT_I2C_ADDRESS)
            tempBuf.setNumber(NumberFormat.UInt8LE, 1, I2C_RepeatStart.True)
            tempBuf.setNumber(NumberFormat.UInt8LE, 2, register)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)

            return bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [this.DEFAULT_I2C_ADDRESS, 2], null, 2).getUint8(0)
        }

        no2_readADC(): number {
            let i2cBuffer = pins.createBuffer(2);
            i2cBuffer = bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_READ_NO_MEM_id, [0x4D, 2], null, 2)
            let MSB = i2cBuffer.getUint8(0)
            let LSB = i2cBuffer.getUint8(1)
            let returnVal = MSB << 8 | LSB
            return returnVal
        }
    }
}