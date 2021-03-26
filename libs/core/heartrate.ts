//------------------------- Click Board Heartrate -----------------------------------
//% weight=100 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Heart_Rate {

    /**
     * Sets Heartrate Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Proximity_2 the Heartrate Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Heartrate"
    //% weight=110
    export function heartrate(boardID: BoardID, clickID: ClickID): Heartrate {
        return new Heartrate(boardID, clickID);
    }

    // class interrupt_stat_register {
    //     registerValue: number;
    //     constructor() {
    //         this.registerValue = 0;
    //     }
    //     get interruptStat() {
    //         return this.registerValue
    //     }
    //     set interruptStat(value) {
    //         this.registerValue = value
    //     }
    //     get pwr_rdy() {
    //         return (this.registerValue & 0x01)
    //     }
    //     set pwr_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x01) | (0x01 & value)
    //     }
    //     get spo2_rdy() {
    //         return (this.registerValue >> 4 & 0x01)
    //     }
    //     set spo2_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x10) | (0x10 & (value << 4))
    //     }
    //     get hr_rdy() {
    //         return (this.registerValue >> 5 & 0x01)
    //     }
    //     set hr_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x20) | (0x20 & (value << 5))
    //     }
    //     get temp_rdy() {
    //         return (this.registerValue >> 6 & 0x01)
    //     }
    //     set temp_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x40) | (0x40 & (value << 6))
    //     }
    //     get fifo_afull() {
    //         return (this.registerValue >> 7 & 0x01)
    //     }
    //     set fifo_afull(value) {
    //         this.registerValue = (this.registerValue & ~0x80) | (0x80 & (value << 7))
    //     }
    // }
    // class interrupt_en_register {
    //     registerValue: number;
    //     constructor() {
    //         this.registerValue = 0;
    //     }
    //     get interruptEn() {
    //         return this.registerValue
    //     }
    //     set interruptEn(value) {
    //         this.registerValue = value
    //     }
    //     get pwr_rdy() {
    //         return this.registerValue & 0x01
    //     }
    //     set pwr_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x01) | (0x01 & value)
    //     }
    //     get en_spo2_rdy() {
    //         return (this.registerValue >> 4 & 0x01)
    //     }
    //     set en_spo2_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x10) | (0x10 & (value << 4))
    //     }
    //     get en_hr_rdy() {
    //         return (this.registerValue >> 5 & 0x01)
    //     }
    //     set en_hr_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x20) | (0x20 & (value << 5))
    //     }
    //     get en_temp_rdy() {
    //         return (this.registerValue >> 6 & 0x01)
    //     }
    //     set en_temp_rdy(value) {
    //         this.registerValue = (this.registerValue & ~0x40) | (0x40 & (value << 6))
    //     }
    //     get en_fifo_afull() {
    //         return (this.registerValue >> 7 & 0x01)
    //     }
    //     set en_fifo_afull(value) {
    //         this.registerValue = (this.registerValue & ~0x80) | (0x80 & (value << 7))
    //     }
    // }

    // class mode_config_register {
    //     registerValue: number;
    //     constructor(initialValue: number) {
    //         this.registerValue = initialValue;
    //     }
    //     get modeConfig() {
    //         return this.registerValue
    //     }
    //     set modeConfig(value) {
    //         this.registerValue = value
    //     }

    //     get mode() {
    //         return this.registerValue & 0x07
    //     }

    //     set mode(value) {
    //         this.registerValue = (this.registerValue & ~0x07) | (0x07 & value)

    //     }

    //     get temp_en() {
    //         return (this.registerValue >> 3 & 0x01)
    //     }

    //     set temp_en(value) {
    //         this.registerValue = (this.registerValue & ~0x08) | (0x08 & (value << 3))

    //     }
    //     get reset() {
    //         return (this.registerValue >> 6 & 0x01)
    //     }

    //     set reset(value) {
    //         this.registerValue = (this.registerValue & ~0x40) | (0x40 & (value << 6))

    //     }
    //     get shdn() {
    //         return (this.registerValue >> 7 & 0x01)
    //     }

    //     set shdn(value) {
    //         this.registerValue = (this.registerValue & ~0x80) | (0x80 & (value << 7))

    //     }

    // }
    // class spo2_config_register {
    //     registerValue: number
    //     constructor() {
    //         this.registerValue = 0;
    //     }
    //     get spo2Config() {
    //         return this.registerValue
    //     }
    //     set spo2Config(value) {
    //         this.registerValue = value
    //     }

    //     get led_pw() {
    //         return this.registerValue & 0x03
    //     }

    //     set led_pw(value) {
    //         this.registerValue = (this.registerValue & ~0x03) | (0x03 & value)

    //     }

    //     get spo2_sr() {
    //         return (this.registerValue >> 2) & 0x03
    //     }

    //     set spo2_sr(value) {
    //         this.registerValue = (this.registerValue & ~0x0C) | (0x0C & (value << 2))

    //     }

    //     get spo2_hires_en() {
    //         return (this.registerValue >> 6) & 0x01
    //     }

    //     set spo2_hires_en(value) {
    //         this.registerValue = (this.registerValue & ~0x40) | (0x40 & (value << 6))
    //     }
    // }
    // class led_config_register {
    //     registerValue: number;
    //     constructor() {
    //         this.registerValue = 0;
    //     }
    //     get ledConfig() {
    //         return this.registerValue
    //     }
    //     set ledConfig(value) {
    //         this.registerValue = value
    //     }

    //     get ir_pa() {
    //         return this.registerValue & 0x0F
    //     }

    //     set ir_pa(value) {
    //         this.registerValue = (this.registerValue & ~0x0F) | (0x0F & value)

    //     }

    //     get red_pa() {
    //         return (this.registerValue >> 4) & 0x0F
    //     }

    //     set red_pa(value) {
    //         this.registerValue = (this.registerValue & ~0xF0) | (0xF0 & (value << 4))

    //     }
    // }


    export class Heartrate {

        private readonly DEFAULT_MODE = 2
        private readonly DEFAULT_HIRES_SET = 1
        private readonly DEFAULT_SAMP_RATE = 0
        private readonly DEFAULT_PWIDTH = 3
        private readonly DEFAULT_IR_CURRENT = 0x7//MAX30100_I0
        private readonly DEFAULT_RED_CURRENT = 0x7//MAX30100_I0
        private readonly SPO2_INTERRUPT_EN = 1
        private readonly HR_INTERRUPT_EN = 1
        private readonly TEMP_INTERRUPT_EN = 1
        private readonly FIFO_INTERRUPT_EN = 1

        // Registers
        private readonly MAX30100_INTERRUPT_STAT_REG = 0x00// Which interrupts are tripped
        private readonly MAX30100_INTERRUPT_EN_REG = 0x01// Which interrupts are active
        private readonly MAX30100_FIFO_WR_PTR_REG = 0x02 // Where data is being written
        private readonly MAX30100_OVF_CTR_REG = 0x03 // Number of lost samples
        private readonly MAX30100_FIFO_RD_PTR_REG = 0x04// Where to read from
        private readonly MAX30100_FIFO_DATA_REG = 0x05// Ouput data buffer
        private readonly MAX30100_MODE_CONFIG_REG = 0x06// Control register
        private readonly MAX30100_SPO2_CONFIG_REG = 0x07// Oximetry settings
        private readonly MAX30100_LED_CONFIG_REG = 0x09// Pulse width and power of LEDs
        private readonly MAX30100_TEMP_INT_REG = 0x16// Temperature value, whole number
        private readonly MAX30100_TEMP_FRAC_REG = 0x17// Temperature value, fraction
        private readonly MAX30100_REV_ID_REG = 0xFE // Part revision
        private readonly MAX30100_PART_ID_REG = 0xFF // Part ID, normally 0x11

        private interrupt_stat_bits = 0x00
        private interrupt_en_bits = 0x00
        private mode_config_bits = 0x00
        private spo2_config_bits = 0x00
        private led_config_bits = 0x00

        // MAX30100 Slave Address
        MAX30100_ADDR = 0x57

        // Interrupt Flags
        MAX30100_POWER_RDY = 0x01
        MAX30100_SPO2_RDY = 0x10
        MAX30100_HR_RDY = 0x20
        MAX30100_TEMP_RDY = 0x40
        MAX30100_FIFO_FULL = 0x80

        // Status
        READY = 0x01
        N_READY = 0x00
        ENABLED = 0x01
        DISABLED = 0x00
        RESERVED = 0x00

        // Mode Select
        private readonly MAX30100_HR_ONLY = 0x02
        private readonly MAX30100_SPO2_EN = 0x03

        // SPO2 Sample Rate (SPS)
        private readonly MAX30100_SR50 = 0x00
        private readonly MAX30100_SR100 = 0x01
        private readonly MAX30100_SR167 = 0x02
        private readonly MAX30100_SR200 = 0x03
        private readonly MAX30100_SR400 = 0x04
        private readonly MAX30100_SR600 = 0x05
        private readonly MAX30100_SR800 = 0x06
        private readonly MAX30100_SR1000 = 0x07

        // LED Pulse Width
        private readonly MAX30100_PW200 = 0x00
        private readonly MAX30100_PW400 = 0x01
        private readonly MAX30100_PW800 = 0x02
        private readonly MAX30100_PW1600 = 0x03

        private readonly BEATDETECTOR_STATE_INIT = 0
        private readonly BEATDETECTOR_STATE_WAITING = 1
        private readonly BEATDETECTOR_STATE_FOLLOWING_SLOPE = 2
        private readonly BEATDETECTOR_STATE_MAYBE_DETECTED = 3
        private readonly BEATDETECTOR_STATE_MASKING = 4


        //Address Definitions
        private readonly DEFAULT_I2C_ADDRESS = 0x57

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number

        //////
        private sampRate: number;
        private bpmRate = 0;
        private ir_data: number;
        private red_data: number;
        private temp_int: number;
        private temp_frac: number;
        private fifo_buff: number[] = [];
        private temp_buff: number[] = [];
        private normalizedHR = 0; //Heart rate signal normalized between 0 and 100 (great for neopixels)
        private IR_ACTIVE_THRESHOLD = 10000 //Used as a threshold to detect if a finger is on the sensor or not
        private RATE_SIZE = 6; //Increase this for more averaging. 4 is good.
        private rates: number[] = []; //Array of heart rates
        // rates.fill(0,0,RATE_SIZE) //Fill the array with 0's to prevent a NaN later
        private rateSpot = 0;
        private lastBeat = 0; //Time at which the last beat occurred
        private beatsPerMinute = 0;
        private beatAvg = 0;
        private IR_AC_Max = 20;
        private IR_AC_Min = -20;
        private IR_AC_Signal_Current = 0;
        private IR_AC_Signal_Previous = 0;
        private IR_AC_Signal_min = 0;
        private IR_AC_Signal_max = 0;
        private IR_Average_Estimated = 0;
        private positiveEdge = 0;
        private negativeEdge = 0;
        private ir_avg_reg = 0;
        private cbuf: number[] = [];
        private offset = 0;
        private FIRCoeffs: number[] = [172, 321, 579, 927, 1360, 1858, 2390, 2916, 3391, 3768, 4012, 4096];

        ///////

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.rates.fill(0,0,this.RATE_SIZE) //Fill the array with 0's to prevent a NaN later

            this.heartrate_Initialize()
        }

        heartrate_Initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS

            this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG)

            // RESET
            this.mode_config_bits = 0x42
            this.MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, this.mode_config_bits);

            // Interrupts
            this.interrupt_en_bits = 0xF0
            let I2CM_dataBuffer: number[] = [];
            I2CM_dataBuffer[0] = this.MAX30100_INTERRUPT_STAT_REG;
            I2CM_dataBuffer[1] = this.interrupt_stat_bits;
            I2CM_dataBuffer[2] = this.interrupt_en_bits;
            this.MAX30100_writeBlock(I2CM_dataBuffer, 3);

            // Configurations
            this.mode_config_bits = 0x02
            this.spo2_config_bits = 0x43
            this.led_config_bits = 0x77
            I2CM_dataBuffer[0] = this.MAX30100_MODE_CONFIG_REG;
            I2CM_dataBuffer[1] = this.mode_config_bits;
            I2CM_dataBuffer[2] = this.spo2_config_bits;
            I2CM_dataBuffer[3] = this.RESERVED;
            I2CM_dataBuffer[4] = this.led_config_bits;
            this.MAX30100_writeBlock(I2CM_dataBuffer, 5);
            // this.HeartRate_example();
        }



        //  Heart Rate Monitor functions takes a sample value and the sample number
        //  Returns true if a beat is detected
        //  A running average of four samples is recommended for display on the screen.
        checkForHRBeat(sample: number): boolean {
            let beatDetected = false;

            //  Save current state
            this.IR_AC_Signal_Previous = this.IR_AC_Signal_Current;

            //This is good to view for debugging
            //Serial.print("Signal_Current: ");
            //Serial.println(IR_AC_Signal_Current);

            //  Process next data sample
            this.IR_Average_Estimated = this.averageDCEstimator(this.ir_avg_reg, sample);
            this.IR_AC_Signal_Current = this.lowPassFIRFilter(sample - this.IR_Average_Estimated);


            if (sample > this.IR_ACTIVE_THRESHOLD) {
                this.normalizedHR = (this.IR_AC_Signal_Current - this.IR_AC_Min) / (this.IR_AC_Max - this.IR_AC_Min) * 100; //Normalize the current signal between 0 and 1 then multiply by 100 for percent
            }
            else {
                this.normalizedHR = 0;
            }




            //  Detect positive zero crossing (rising edge)
            if ((this.IR_AC_Signal_Previous < 0) && (this.IR_AC_Signal_Current >= 0)) {

                this.IR_AC_Max = this.IR_AC_Signal_max; //Adjust our AC max and min
                this.IR_AC_Min = this.IR_AC_Signal_min;

                this.positiveEdge = 1;
                this.negativeEdge = 0;
                this.IR_AC_Signal_max = 0;

                //if ((IR_AC_Max - IR_AC_Min) > 100 && (IR_AC_Max - IR_AC_Min) < 1000)
                if (((this.IR_AC_Max - this.IR_AC_Min) > 20 && (this.IR_AC_Max - this.IR_AC_Min) < 1000)&&sample>10000) {
                    //Heart beat!!!
                    beatDetected = true;
                }
            }

                // let I2CM_dataBuffer: number[] = [];
                // I2CM_dataBuffer[0] = 0xAA;
                // I2CM_dataBuffer[1] = this.IR_AC_Max;
                // I2CM_dataBuffer[2] = this.IR_AC_Min;
                // I2CM_dataBuffer[3] = this.IR_AC_Signal_Previous;
                // I2CM_dataBuffer[4] = this.IR_AC_Signal_Current;
                // I2CM_dataBuffer[5] = this.IR_Average_Estimated;
                // I2CM_dataBuffer[6] = sample;
                // I2CM_dataBuffer[7] = 0xAA;
                // this.MAX30100_writeBlock(I2CM_dataBuffer, 8);


            //  Detect negative zero crossing (falling edge)
            if ((this.IR_AC_Signal_Previous > 0) && (this.IR_AC_Signal_Current <= 0)) {
                this.positiveEdge = 0;
                this.negativeEdge = 1;
                this.IR_AC_Signal_min = 0;
            }

            //  Find Maximum value in positive cycle
            if (this.positiveEdge && (this.IR_AC_Signal_Current > this.IR_AC_Signal_Previous)) {
                this.IR_AC_Signal_max = this.IR_AC_Signal_Current;
            }

            //  Find Minimum value in negative cycle
            if (this.negativeEdge && (this.IR_AC_Signal_Current < this.IR_AC_Signal_Previous)) {
                this.IR_AC_Signal_min = this.IR_AC_Signal_Current;
            }

            return (beatDetected);
        }


        //  Average DC Estimator
        averageDCEstimator(p: number, x: number): number {
            p += (((x << 15) - p) >> 4);
            this.ir_avg_reg = p;
            return (p >> 15);
        }

        //  Low Pass FIR Filter
        lowPassFIRFilter(din: number): number {
            this.cbuf[this.offset] = din;

            let z = this.mul16(this.FIRCoeffs[11], this.cbuf[(this.offset - 11) & 0x1F]);

            for (let i = 0; i < 11; i++) {
                z += this.mul16(this.FIRCoeffs[i], this.cbuf[(this.offset - i) & 0x1F] + this.cbuf[(this.offset - 22 + i) & 0x1F]);
            }

            this.offset++;
            this.offset %= 32; //Wrap condition

            return (z >> 15);
        }

        //  Integer multiplier
        mul16(x: number, y: number): number {
            return (x * y);
        }

        /**
          Section: Driver APIs
         */

        /* Get Measurements */


        // MAX30100_readTemp() {
        //     this.MAX30100_startTemp();
        //     control.waitMicros(29000);

        //     while (!this.MAX30100_isTempRdy()) {
        //     }
        //     //            temp_buff = this.MAX30100_readBlock(this.MAX30100_TEMP_INT_REG, 2);

        //     //            temp_int = temp_buff[0];
        //     //            temp_frac = temp_buff[1] * 0.0625;
        // }

        MAX30100_getIRdata(): number {
            // return ir_data;
            return 0;
        }

        MAX30100_getREDdata(): number {
            // return red_data;
            return 0;
        }

        MAX30100_getTemp(): number {
            // return (temp_int + temp_frac);
            return 0;
        }

        // /* Setup the Sensor */
        // MAX30100_setMode(mode: number) {
        //     switch (mode) {
        //         case this.MAX30100_HR_ONLY:
        //             this.mode_config_bits = this.MAX30100_HR_ONLY;
        //             break;
        //         case this.MAX30100_SPO2_EN:
        //             this.mode_config_bits.mode = this.MAX30100_SPO2_EN;
        //             break;
        //         default: break;
        //     }
        // }

        //  MAX30100_setHiResEnabled(hiResEnable: number) {
        //     this.spo2_config_bits.spo2_hires_en = hiResEnable;
        // }

        //  MAX30100_setSampleRate(sampRate: number) {
        //     this.spo2_config_bits.spo2_sr = sampRate;
        // }

        //  MAX30100_setPulseWidth(pWidth: number) {
        //     this.spo2_config_bits.led_pw = pWidth;
        // }

        //  MAX30100_setIRLEDCurrent(irCurrent: number) {
        //     this.led_config_bits.ir_pa = irCurrent;
        // }

        //  MAX30100_setREDLEDCurrent(redCurrent: number) {
        //     this.led_config_bits.red_pa = redCurrent;
        // }

        /* Interrupts */

        //  MAX30100_setSpo2RdyInterrupt(interruptEnabled: number) {
        //     this.interrupt_en_bits.en_spo2_rdy = interruptEnabled;
        // }

        //  MAX30100_setHrRdyInterrupt(interruptEnabled: number) {
        //     this.interrupt_en_bits.en_hr_rdy = interruptEnabled;
        // }

        //  MAX30100_setTempRdyInterrupt(interruptEnabled: number) {
        //     this.interrupt_en_bits.en_temp_rdy = interruptEnabled;
        // }

        //  MAX30100_setFifoAfullInterrupt(interruptEnabled: number) {
        //     this.interrupt_en_bits.en_fifo_afull = interruptEnabled;
        // }

        //  MAX30100_isPowerRdy(): number {
        //     this.interrupt_stat_bits.interruptStat = this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        //     return this.interrupt_stat_bits.pwr_rdy;
        // }

        // MAX30100_isSpo2Rdy(): number {
        //     return this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        // }

        // MAX30100_isHrRdy(): number {
        //     return this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        // }

        // MAX30100_isTempRdy(): number {
        //     return this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        // }

        // function MAX30100_isFifoAfull(): number {
        //     interrupt_stat_bits.interruptStat = MAX30100_readByte(MAX30100_INTERRUPT_STAT_REG);
        //     return interrupt_stat_bits.fifo_afull;
        // }

        /* Update Sensor Set-up */

        // function MAX30100_updateSensorConfig() {
        //     let I2CM_dataBuffer: number[] = [];

        //     I2CM_dataBuffer[0] = MAX30100_MODE_CONFIG_REG;
        //     I2CM_dataBuffer[1] = mode_config_bits.modeConfig;
        //     I2CM_dataBuffer[2] = spo2_config_bits.spo2Config;
        //     MAX30100_writeBlock(I2CM_dataBuffer, 3);
        // }

        //  MAX30100_updateLEDCurrent() {
        //     this.MAX30100_writeByte(this.MAX30100_LED_CONFIG_REG, this.led_config_bits.ledConfig);
        // }

        // function MAX30100_updateEnabledInterrupts() {
        //     MAX30100_writeByte(MAX30100_INTERRUPT_EN_REG, interrupt_en_bits.interruptEn);
        // }
        /* FIFO Operations */




        /* Misc. Operations */

        //  MAX30100_wakeup() {
        //     this.mode_config_bits.shdn = this.DISABLED;
        //     this.MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, this.mode_config_bits.modeConfig);
        // }

        //  MAX30100_shutdown() {
        //     this.mode_config_bits.shdn = this.ENABLED;
        //     this.MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, this.mode_config_bits.modeConfig);
        // }

        //  MAX30100_getRevID(): number {
        //     return this.MAX30100_readByte(this.MAX30100_REV_ID_REG);
        // }

        //  MAX30100_getPartID(): number {
        //     return this.MAX30100_readByte(this.MAX30100_PART_ID_REG);
        // }


        //  MAX30100_startTemp() {
        //     this.mode_config_bits.modeConfig = (this.mode_config_bits.modeConfig | 0x08)
        //     this.MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, this.mode_config_bits.modeConfig);
        // }

        Shift_Bits(read_res: number) {
            let shift_res: number;
            switch (this.spo2_config_bits & 0x03) {
                case this.MAX30100_PW200: shift_res = read_res >> 3;
                    break;
                case this.MAX30100_PW400: shift_res = read_res >> 2;
                    break;
                case this.MAX30100_PW800: shift_res = read_res >> 1;
                    break;
                default: shift_res = read_res;
                    break;
            }
            return shift_res;
        }

        MAX30100_writeByte(register: number, dataByte: number) {
            let data: number[] = [dataByte]
            this.writeMAX30100(data, register);
        }

        MAX30100_writeBlock(write_buff: number[], length: number) {
            let i2cBuffer = pins.createBuffer(length) //Create a buffer to send over I2C
            for (let i = 0; i < length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i, write_buff[i]) //The remaining item(s) in the buffer is(are) the value(s) to send
            }
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID); //Send the I2C buffer
        }

        MAX30100_readByte(reg_addr: number): number {
            return this.readMAX30100(1, reg_addr)[0];
        }

        readMAX30100(numBytes: number, register: number): number[] {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.UInt8LE, true, this.myBoardID, this.myClickID)
            let i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress, numBytes, this.myBoardID, this.myClickID);
            let dataArray: number[] = []; //Create an array to hold our read values
            for (let i = 0; i < numBytes; i++) {
                dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
            }
            return dataArray
        }



        //%blockId=MAX30100_write
        //%block="Write array %values to MAX30100 register%register on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=true
        writeMAX30100(values: number[], register: number) {
            let i2cBuffer = pins.createBuffer(values.length + 1) //Create a buffer to send over I2C
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register) //The first item in the buffer is the register address
            for (let i = 0; i < values.length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i + 1, values[i]) //The remaining item(s) in the buffer is(are) the value(s) to send
            }
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID); //Send the I2C buffer
        }

        MAX30100_readBlock(reg_addr: number, numBytes: number): number[] {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg_addr, NumberFormat.UInt8LE, true, this.myBoardID, this.myClickID)
            let i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress, numBytes, this.myBoardID, this.myClickID);
            let dataArray: number[] = []; //Create an array to hold our read values
            for (let i = 0; i < numBytes; i++) {
                dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
            }
            return dataArray
        }


        //% blockId=onKeylockPosition 
        //% block="$this on heartrate detect" 
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=heartrate
        //% this.shadow=variables_get
        //% this.defl="heartrate"
        onHeartbeatDetected(a: () => void): void {
            this.readMAX30100(1, this.MAX30100_INTERRUPT_STAT_REG);

            // let fifo_wr_ptr = 0x00;
            // let ovf_ctr = 0x00;
            // let fifo_rd_ptr = 0x00;
            // I2CM_dataBuffer[0] = this.MAX30100_FIFO_WR_PTR_REG;
            // I2CM_dataBuffer[1] = fifo_wr_ptr;
            // I2CM_dataBuffer[2] = ovf_ctr;
            // I2CM_dataBuffer[3] = fifo_rd_ptr;
            // this.MAX30100_writeBlock(I2CM_dataBuffer, 4);



            bBoard_Control.eventInit(bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, bBoardEvents.CN_LOW), clickIOPin.INT, a); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }


        //%blockId=Heart_Rate_getBPMRate
        //%block="$this get beats per minute"
        //% blockGap=7
        //% advanced=false
        //% this.shadow=variables_get
        //% this.defl="Heartrate"
        BPMRate(): number {
            this.bpmRate = 0;
            let beat = 0;
            let x = 0
            let y = 0

            let pulseDetected = false
            let heartBPM = 0
            let irCardiogram = 0
            let irDcValue = 0
            let redDcValue = 0
            let currentSaO2Value = 0
            let SaO2 = currentSaO2Value
            let lastBeatThreshold = 0
            let dcFilteredIR = 0
            let dcFilteredRed = 0

            let dcFilterIR_w = 0
            let dcFilterIR_result = 0
            let ALPHA = 0

            let meanDiffIR_index = 0;
            let meanDiffIR_sum = 0;
            let meanDiffIR_count = 0;


            //clean fifo
            let I2CM_dataBuffer:number[] = [];
            let fifo_wr_ptr = 0x00;
            let ovf_ctr = 0x00;
            let fifo_rd_ptr = 0x00;
            I2CM_dataBuffer[0] = this.MAX30100_FIFO_WR_PTR_REG;
            I2CM_dataBuffer[1] = fifo_wr_ptr;
            I2CM_dataBuffer[2] = ovf_ctr;
            I2CM_dataBuffer[3] = fifo_rd_ptr;
            this.MAX30100_writeBlock(I2CM_dataBuffer, 4);

            while (x < 40) {
                while ((this.MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG) & 0x20) != 0x20) {
                    y++
                }
                x++
                //read fifo data
                this.fifo_buff = this.MAX30100_readBlock(this.MAX30100_FIFO_DATA_REG, 4);
                this.ir_data = (this.fifo_buff[0] << 8) | this.fifo_buff[1];
                this.red_data = (this.fifo_buff[2] << 8) | this.fifo_buff[3];
                this.ir_data = this.Shift_Bits(this.ir_data);
                this.red_data = this.Shift_Bits(this.red_data);
                

                if (this.checkForHRBeat(this.ir_data)) {
                    beat = beat + 1
                    //We sensed a beat!
                    let delta = input.runningTime() - this.lastBeat;
                    this.lastBeat = input.runningTime();

                    let beatsPerMinute = 60 / (delta / 1000.0);

                    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
                        this.rateSpot ++
                        this.rates[this.rateSpot] = beatsPerMinute; //Store this reading in the array
                        this.rateSpot %= this.RATE_SIZE; //Wrap variable

                        //Take average of readings
                        this.bpmRate = 0;
                        for (let x = 0; x < this.RATE_SIZE; x++) {
                            this.bpmRate += this.rates[x];
                        }
                        this.bpmRate /= this.RATE_SIZE;
                    }
                }
            }
            return this.bpmRate
        }





        // //%blockId=Heart_Rate_getBPMRate
        // //%block="$this get beats per minute"
        // //% blockGap=7
        // //% advanced=false
        // //% this.shadow=variables_get
        // //% this.defl="Heartrate"
        // BPMRate():number 
        // {
        //     if(this.HeartRate_getIRdata()<this.IR_ACTIVE_THRESHOLD || this.bpmRate <0)
        //     {
        //         this.bpmRate = 0
        //     }
        //     return Math.round(this.bpmRate);
        // }

        // //%blockId=Heart_Rate_getHRSignal
        // //%block="$this get raw HR signal"
        // //% blockGap=7
        // //% advanced=false
        // //% this.shadow=variables_get
        // //% this.defl="Heartrate"
        // pulse(): number {
        //     // return Math.round(normalizedHR);
        //     return Math.round(0);
        // }

        HeartRate_getIRdata() {
            return this.MAX30100_getIRdata();
        }

        // function HeartRate_getREDdata() {
        //     return MAX30100_getREDdata();
        // }

        // function HeartRate_getTemperature() {
        //     MAX30100_readTemp();
        //     return MAX30100_getTemp();
        // }
    }
}