//------------------------- Click Board Heartrate -----------------------------------
//% weight=100 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Heart_Rate {

    /**
     * Sets Proximity_2 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Proximity_2 the Proximity_2 Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Proximity_2"
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
    // let interrupt_stat_bits = new interrupt_stat_register
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
    // let interrupt_en_bits = new interrupt_en_register
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
    // let mode_config_bits = new mode_config_register(0)
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
    // let spo2_config_bits = new spo2_config_register
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
    // let led_config_bits = new led_config_register

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

        private readonly interruptStat = 0x00;
        private readonly interruptEn = 0x00;
        private readonly modeConfig = 0x00;
        private readonly spo2Config = 0x00;
        private readonly ledConfig = 0x00;

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

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.heartrate_Initialize()
        }

        //%blockId=heartrate_initialize
        //%block="Initialize device on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        heartrate_Initialize() {
            this.myI2CAddress = this.DEFAULT_I2C_ADDRESS
            // MAX30100_setSpo2RdyInterrupt(SPO2_INTERRUPT_EN, clickBoardNum);
            // MAX30100_setHrRdyInterrupt(HR_INTERRUPT_EN, clickBoardNum);
            // MAX30100_setTempRdyInterrupt(TEMP_INTERRUPT_EN, clickBoardNum);
            // MAX30100_setFifoAfullInterrupt(FIFO_INTERRUPT_EN, clickBoardNum);

            // MAX30100_setMode(DEFAULT_MODE, clickBoardNum);
            // MAX30100_setHiResEnabled(DEFAULT_HIRES_SET, clickBoardNum);
            // MAX30100_setSampleRate(DEFAULT_SAMP_RATE, clickBoardNum);
            // MAX30100_setPulseWidth(DEFAULT_PWIDTH, clickBoardNum);
            // MAX30100_setIRLEDCurrent(DEFAULT_IR_CURRENT, clickBoardNum);
            // MAX30100_setREDLEDCurrent(DEFAULT_RED_CURRENT, clickBoardNum);

            let I2CM_dataBuffer: number[] = [];
            MAX30100_reset();

            // mode_config_bits.shdn = DISABLED;
            // mode_config_bits.reset = DISABLED;

            // Interrupts
            I2CM_dataBuffer[0] = this.MAX30100_INTERRUPT_STAT_REG;
            I2CM_dataBuffer[1] = this.interruptStat;
            I2CM_dataBuffer[2] = this.interruptEn;
            MAX30100_writeBlock(I2CM_dataBuffer, 3);

            // Configurations
            I2CM_dataBuffer[0] = this.MAX30100_MODE_CONFIG_REG;
            I2CM_dataBuffer[1] = this.modeConfig;
            I2CM_dataBuffer[2] = this.spo2Config;
            I2CM_dataBuffer[3] = this.RESERVED;
            I2CM_dataBuffer[4] = this.ledConfig;
            MAX30100_writeBlock(I2CM_dataBuffer, 5);
        }

    // let sampRate: number;
    // let bpmRate = 0;
    // let irData: number;

    // let ir_data: number;
    // let red_data: number;
    // let temp_int: number;
    // let temp_frac: number;

    // let fifo_buff: number[] = [];
    // let temp_buff: number[] = [];

    // let normalizedHR = 0; //Heart rate signal normalized between 0 and 100 (great for neopixels)

    // declare const IR_ACTIVE_THRESHOLD = 10000 //Used as a threshold to detect if a finger is on the sensor or not
    // declare const RATE_SIZE = 6; //Increase this for more averaging. 4 is good.
    // let rates: number[] = []; //Array of heart rates
    // rates.fill(0, 0, RATE_SIZE) //Fill the array with 0's to prevent a NaN later
    // let rateSpot = 0;
    // let lastBeat = 0; //Time at which the last beat occurred

    // let beatsPerMinute = 0;
    // let beatAvg = 0;

    // let IR_AC_Max = 20;
    // let IR_AC_Min = -20;

    // let IR_AC_Signal_Current = 0;
    // let IR_AC_Signal_Previous = 0;
    // let IR_AC_Signal_min = 0;
    // let IR_AC_Signal_max = 0;
    // let IR_Average_Estimated;

    // let positiveEdge = 0;
    // let negativeEdge = 0;
    // let ir_avg_reg = 0;

    // let cbuf: number[] = [];
    // let offset = 0;
    // let FIRCoeffs: number[] = [172, 321, 579, 927, 1360, 1858, 2390, 2916, 3391, 3768, 4012, 4096];

    //  Heart Rate Monitor functions takes a sample value and the sample number
    //  Returns true if a beat is detected
    //  A running average of four samples is recommended for display on the screen.
    // function checkForHRBeat(sample: number): boolean {
    //     let beatDetected = false;

    //     //  Save current state
    //     IR_AC_Signal_Previous = IR_AC_Signal_Current;

    //     //This is good to view for debugging

    //     //Serial.print("Signal_Current: ");
    //     //Serial.println(IR_AC_Signal_Current);

    //     //  Process next data sample
    //     IR_Average_Estimated = averageDCEstimator(ir_avg_reg, sample, clickBoardNum);
    //     IR_AC_Signal_Current = lowPassFIRFilter(sample - IR_Average_Estimated, clickBoardNum);

    //     if (sample > IR_ACTIVE_THRESHOLD) {
    //         normalizedHR = (IR_AC_Signal_Current - IR_AC_Min) / (IR_AC_Max - IR_AC_Min) * 100; //Normalize the current signal between 0 and 1 then multiply by 100 for percent
    //     }
    //     else {

    //         normalizedHR = 0;

    //     }
    //     //  Detect positive zero crossing (rising edge)
    //     if ((IR_AC_Signal_Previous < 0) && (IR_AC_Signal_Current >= 0)) {

    //         IR_AC_Max = IR_AC_Signal_max; //Adjust our AC max and min
    //         IR_AC_Min = IR_AC_Signal_min;

    //         positiveEdge = 1;
    //         negativeEdge = 0;
    //         IR_AC_Signal_max = 0;



    //         //if ((IR_AC_Max - IR_AC_Min) > 100 && (IR_AC_Max - IR_AC_Min) < 1000)
    //         if (((IR_AC_Max - IR_AC_Min) > 20 && (IR_AC_Max - IR_AC_Min) < 1000) && sample > 10000) {
    //             //Heart beat!!!
    //             beatDetected = true;


    //         }

    //     }

    //     //  Detect negative zero crossing (falling edge)
    //     if ((IR_AC_Signal_Previous > 0) && (IR_AC_Signal_Current <= 0)) {
    //         positiveEdge = 0;
    //         negativeEdge = 1;
    //         IR_AC_Signal_min = 0;
    //     }

    //     //  Find Maximum value in positive cycle
    //     if (positiveEdge && (IR_AC_Signal_Current > IR_AC_Signal_Previous)) {
    //         IR_AC_Signal_max = IR_AC_Signal_Current;
    //     }

    //     //  Find Minimum value in negative cycle
    //     if (negativeEdge && (IR_AC_Signal_Current < IR_AC_Signal_Previous)) {
    //         IR_AC_Signal_min = IR_AC_Signal_Current;
    //     }

    //     return (beatDetected);
    // }

    //  Average DC Estimator
    // function averageDCEstimator(p: number, x: number): number {
    //     p += (((x << 15) - p) >> 4);
    //     ir_avg_reg = p;
    //     return (p >> 15);
    // }

    // //  Low Pass FIR Filter
    // function lowPassFIRFilter(din: number): number {
    //     cbuf[offset] = din;

    //     let z = mul16(FIRCoeffs[11], cbuf[(offset - 11) & 0x1F]);

    //     for (let i = 0; i < 11; i++) {
    //         z += mul16(FIRCoeffs[i], cbuf[(offset - i) & 0x1F] + cbuf[(offset - 22 + i) & 0x1F]);
    //     }

    //     offset++;
    //     offset %= 32; //Wrap condition

    //     return (z >> 15);
    // }

    //  Integer multiplier
    // function mul16(x: number, y: number): number {
    //     return (x * y);
    // }
    /**
      Section: Driver APIs
     */

    /* Get Measurements */

    // function MAX30100_readSensors() {
    //     MAX30100_clearCounters();

    //     if (mode_config_bits.mode == this.MAX30100_HR_ONLY) {
    //         while (!MAX30100_isHrRdy()) {
    //         }
    //     }
    //     else if (mode_config_bits.mode == this.MAX30100_SPO2_EN) {
    //         while (!MAX30100_isSpo2Rdy()) {
    //         }
    //     }

    //     MAX30100_readFifoData();
    // }

    function MAX30100_readTemp() {
        MAX30100_startTemp();
        control.waitMicros(29000);

        while (!MAX30100_isTempRdy()) {
        }
        temp_buff = MAX30100_readBlock(this.MAX30100_TEMP_INT_REG, 2);

        temp_int = temp_buff[0];
        temp_frac = temp_buff[1] * 0.0625;
    }

    export function MAX30100_getIRdata(): number {
        return ir_data;
    }

    export function MAX30100_getREDdata(): number {
        return red_data;
    }

    function MAX30100_getTemp(): number {
        return (temp_int + temp_frac);
    }

    /* Setup the Sensor */

    function MAX30100_setMode(mode: number) {
        switch (mode) {
            case this.MAX30100_HR_ONLY:
                mode_config_bits.mode = this.MAX30100_HR_ONLY;
                break;
            case this.MAX30100_SPO2_EN:
                mode_config_bits.mode = this.cMAX30100_SPO2_EN;
                break;
            default: break;
        }
    }

    // function MAX30100_setHiResEnabled(hiResEnable: number) {
    //     spo2_config_bits.spo2_hires_en = hiResEnable;
    // }

    // function MAX30100_setSampleRate(sampRate: number) {
    //     spo2_config_bits.spo2_sr = sampRate;
    // }

    // function MAX30100_setPulseWidth(pWidth: number) {
    //     spo2_config_bits.led_pw = pWidth;
    // }

    // function MAX30100_setIRLEDCurrent(irCurrent: number) {
    //     led_config_bits.ir_pa = irCurrent;
    // }

    // function MAX30100_setREDLEDCurrent(redCurrent: number) {
    //     led_config_bits.red_pa = redCurrent;
    // }

    /* Interrupts */

    // function MAX30100_setSpo2RdyInterrupt(interruptEnabled: number) {
    //     interrupt_en_bits.en_spo2_rdy = interruptEnabled;
    // }

    // function MAX30100_setHrRdyInterrupt(interruptEnabled: number) {
    //     interrupt_en_bits.en_hr_rdy = interruptEnabled;
    // }

    // function MAX30100_setTempRdyInterrupt(interruptEnabled: number) {
    //     interrupt_en_bits.en_temp_rdy = interruptEnabled;
    // }

    // function MAX30100_setFifoAfullInterrupt(interruptEnabled: number) {
    //     interrupt_en_bits.en_fifo_afull = interruptEnabled;
    // }

    // function MAX30100_isPowerRdy(): number {
    //     interrupt_stat_bits.interruptStat = MAX30100_readByte(MAX30100_INTERRUPT_STAT_REG);
    //     return interrupt_stat_bits.pwr_rdy;
    // }

    function MAX30100_isSpo2Rdy(): number {
        interrupt_stat_bits.interruptStat = MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        return interrupt_stat_bits.spo2_rdy;
    }

    function MAX30100_isHrRdy(): number {
        interrupt_stat_bits.interruptStat = MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        return interrupt_stat_bits.hr_rdy;
    }

    function MAX30100_isTempRdy(): number {
        interrupt_stat_bits.temp_rdy = MAX30100_readByte(this.MAX30100_INTERRUPT_STAT_REG);
        return interrupt_stat_bits.temp_rdy;
    }

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

    // function MAX30100_updateLEDCurrent() {
    //     MAX30100_writeByte(MAX30100_LED_CONFIG_REG, led_config_bits.ledConfig);
    // }

    // function MAX30100_updateEnabledInterrupts() {
    //     MAX30100_writeByte(MAX30100_INTERRUPT_EN_REG, interrupt_en_bits.interruptEn);
    // }

    /* FIFO Operations */




    function MAX30100_clearCounters() {
        let I2CM_dataBuffer: number[] = [];

        let fifo_wr_ptr = 0x00;
        let ovf_ctr = 0x00;
        let fifo_rd_ptr = 0x00;

        I2CM_dataBuffer[0] = this.MAX30100_FIFO_WR_PTR_REG;
        I2CM_dataBuffer[1] = fifo_wr_ptr;
        I2CM_dataBuffer[2] = ovf_ctr;
        I2CM_dataBuffer[3] = fifo_rd_ptr;

        MAX30100_writeBlock(I2CM_dataBuffer, 4);
    }

    // function MAX30100_readFifoData() {
    //     fifo_buff = MAX30100_readBlock(this.MAX30100_FIFO_DATA_REG, 4);

    //     ir_data = (fifo_buff[0] << 8) | fifo_buff[1];
    //     red_data = (fifo_buff[2] << 8) | fifo_buff[3];
    //     ir_data = Shift_Bits(ir_data);

    //     red_data = Shift_Bits(red_data);
    // }

    /* Misc. Operations */

    function MAX30100_reset() {
        mode_config_bits.reset = this.ENABLED;
        MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, mode_config_bits.modeConfig);
    }

    // function MAX30100_wakeup() {
    //     mode_config_bits.shdn = DISABLED;
    //     MAX30100_writeByte(MAX30100_MODE_CONFIG_REG, mode_config_bits.modeConfig);
    // }

    // function MAX30100_shutdown() {
    //     mode_config_bits.shdn = ENABLED;
    //     MAX30100_writeByte(MAX30100_MODE_CONFIG_REG, mode_config_bits.modeConfig);
    // }

    // function MAX30100_getRevID(): number {
    //     return MAX30100_readByte(MAX30100_REV_ID_REG);
    // }

    // function MAX30100_getPartID(): number {
    //     return MAX30100_readByte(MAX30100_PART_ID_REG);
    // }


    function MAX30100_startTemp() {
        mode_config_bits.temp_en = this.ENABLED;
        MAX30100_writeByte(this.MAX30100_MODE_CONFIG_REG, mode_config_bits.modeConfig);
    }

    function Shift_Bits(read_res: number) {
        let shift_res: number;
        switch (spo2_config_bits.led_pw) {
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

    function MAX30100_writeByte(register: number, dataByte: number) {
        let data: number[] = [dataByte]
        this.writeMAX30100(data, register);
    }

    function MAX30100_writeBlock(write_buff: number[], length: number) {
        let i2cBuffer = pins.createBuffer(length) //Create a buffer to send over I2C
        for (let i = 0; i < length; i++) {
            i2cBuffer.setNumber(NumberFormat.UInt8LE, i, write_buff[i]) //The remaining item(s) in the buffer is(are) the value(s) to send
        }
        bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID); //Send the I2C buffer
    }

    function MAX30100_readByte(reg_addr: number): number {
        return readMAX30100(1, reg_addr)[0];
    }

    function readMAX30100(numBytes: number, register: number): number[] {
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
    export function writeMAX30100(values: number[], register: number) {
        let i2cBuffer = pins.createBuffer(values.length + 1) //Create a buffer to send over I2C
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register) //The first item in the buffer is the register address
        for (let i = 0; i < values.length; i++) {
            i2cBuffer.setNumber(NumberFormat.UInt8LE, i + 1, values[i]) //The remaining item(s) in the buffer is(are) the value(s) to send
        }
        bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID); //Send the I2C buffer
    }

    export function MAX30100_readBlock(reg_addr: number, numBytes: number): number[] {
        bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg_addr, NumberFormat.UInt8LE, true, this.myBoardID, this.myClickID)
        let i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress, numBytes, this.myBoardID, this.myClickID);
        let dataArray: number[] = []; //Create an array to hold our read values
        for (let i = 0; i < numBytes; i++) {
            dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
        }
        return dataArray
    }


    // //Application code
    // function HeartRate_example(clickBoardNum: clickBoardID) {
    //     bpmRate = 0;
    //     let delta = 0;
    //     //sampRate = getSampRate(clickBoardNum);
    //     control.inBackground(function () {
    //         while (1) {
    //             basic.pause(sampRate)
    //             //checkSample(clickBoardNum);
    //             HeartRate_readSensors(clickBoardNum);
    //             irData = HeartRate_getIRdata(clickBoardNum);
    //             if (checkForHRBeat(irData, clickBoardNum) == true) {
    //                 //We sensed a beat!
    //                 let delta = input.runningTime() - lastBeat;
    //                 lastBeat = input.runningTime();
    //                 beatsPerMinute = 60 / (delta / 1000.0);
    //                 if (beatsPerMinute < 255 && beatsPerMinute > 20) {
    //                     rates[rateSpot++] = beatsPerMinute; //Store this reading in the array
    //                     rateSpot %= RATE_SIZE; //Wrap variable
    //                     //Take average of readings
    //                     bpmRate = 0;
    //                     for (let x = 0; x < RATE_SIZE; x++) {
    //                         bpmRate += rates[x];
    //                     }
    //                     bpmRate /= RATE_SIZE;
    //                 }
    //             }
    //         }
    //     })
    // }




    //%blockId=Heart_Rate_getBPMRate
    //%block="Get beats per minute on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
    function BPMRate(): number {
        let bpmRate = MAX30100_getIRdata()
        if (bpmRate < IR_ACTIVE_THRESHOLD) {
            return 0;
        }
        return Math.round(bpmRate);
    }

    /**
     * The current value of IR reflection normalized between 0 and 100 (Great for neopixels)
     * @param clickBoardNum the location of the click board being used
     */
    //%blockId=Heart_Rate_getHRSignal
    //%block="Get raw HR signal on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
    export function pulse(): number {
        return Math.round(normalizedHR);
    }




    // function HeartRate_readSensors() {
    //     MAX30100_readSensors();
    // }

    // function HeartRate_getIRdata() {
    //     return MAX30100_getIRdata();
    // }

    // function HeartRate_getREDdata() {
    //     return MAX30100_getREDdata();
    // }

    // function HeartRate_getTemperature() {
    //     MAX30100_readTemp();
    //     return MAX30100_getTemp();
    // }


}
}