//------------------------- Click Board Servo -----------------------------------
//% weight=100 color=#FF2F92 icon=""
//% advanced=true
//% labelLineWidth=1005
namespace Servo {

    /**
     * Sets Servo Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Servo the Servo Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Servo"
    //% weight=110
    export function createServo(boardID: BoardID, clickID: ClickID): Servo {
        return new Servo(boardID, clickID);
    }

    export class Servo {
        private readonly PCA9685_DEFAULT_I2C_ADDRESS = 0x40
        private readonly LTC2497_DEFAULT_I2C_ADDRESS = 0x48
        private readonly PCA9685_SUBADR1 = 0x2 /**< i2c bus address 1 */
        private readonly PCA9685_SUBADR2 = 0x3 /**< i2c bus address 2 */
        private readonly PCA9685_SUBADR3 = 0x4 /**< i2c bus address 3 */

        private readonly PCA9685_MODE1 = 0x0 /**< Mode Register 1 */
        private readonly PCA9685_MODE2 = 0x1 /**< Mode Register 2 */
        private readonly PCA9685_PRESCALE = 0xFE /**< Prescaler for PWM output frequency */

        private readonly LED0_ON_L = 0x6 /**< LED0 output and brightness control byte 0 */
        private readonly LED0_ON_H = 0x7 /**< LED0 output and brightness control byte 1 */
        private readonly LED0_OFF_L = 0x8 /**< LED0 output and brightness control byte 2 */
        private readonly LED0_OFF_H = 0x9 /**< LED0 output and brightness control byte 3 */

        private readonly ALLLED_ON_L = 0xFA /**< load all the LEDn_ON registers, byte 0 */
        private readonly ALLLED_ON_H = 0xFB /**< load all the LEDn_ON registers, byte 1 */
        private readonly ALLLED_OFF_L = 0xFC /**< load all the LEDn_OFF registers, byte 0 */
        private readonly ALLLED_OFF_H = 0xFD /**< load all the LEDn_OFF registers, byte 1 */

        // let isInitialized = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let deviceAddress = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // let servoPulseMin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let servoPulseMax = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // let servoAngleMin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let servoAngleMax = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.servo_Initialize()
        }

        servo_Initialize() {
            this.myI2CAddress = this.PCA9685_DEFAULT_I2C_ADDRESS
            bBoard_Control.clearPin(clickIOPin.CS, this.myBoardID, this.myClickID);
            this.setPWMFreq(60);
        }

        // you can use this function if you'd like to set the pulse length in seconds
        // e.g. setServoPulse(0, 0.001) is a ~1 millisecond pulse width. its not precise!
        setServoPulse(servoNumber: number, pulse: number) {
            let pulselength = 1000000;   // 1,000,000 us per second
            pulselength = pulselength / 60;   // 60 Hz
            pulselength = pulselength / 4096;  // 12 bits of resolution
            pulse = pulse / pulselength;  // convert to us
            this.setPWM(servoNumber, 0, pulse);
        }

        //% blockId=Servo_Angle
        //% block="$this set servo %n to %angle"
        //% blockGap=7
        //% advanced=false
        //% this.shadow=variables_get
        //% this.defl="Servo"
        //% servoNumber.min=1 servoNumber.max=16
        //% servoNumber.defl=1
        setServoAngle(servoNumber: number, angle: number) {
            servoNumber = Math.clamp(1, 16, servoNumber)
            let angleMin = 0
            let angleMax = 180
            let pulseMin = 1000
            let pulseMax = 2000
            let angleRange = (angleMax - angleMin)
            let pulseRange = (pulseMax - pulseMin)
            let pulseWidth = (((angle - angleMin) * pulseRange) / angleRange) + pulseMin
            this.setServoPulse(servoNumber - 1, pulseWidth)
        }

        //% blockId=Servo_AngleAdjusted
        //% temp_block="$this set servo %n to %angle with pulse range min %pulseMin and max %pulseMax"
        //% blockGap=7
        //% advanced=true
        //% this.shadow=variables_get
        //% this.defl="Servo"
        //% servoNumber.min=1 servoNumber.max=16
        //% servoNumber.defl=1
        // TODO: Enable this func
        setServoAngleAdjusted(servoNumber: number, angle: number, pulseMin: number, pulseMax: number) {
            let angleMin = 0
            let angleMax = 180
            let angleRange = (angleMax - angleMin)
            let pulseRange = (pulseMax - pulseMin)
            let pulseWidth = (((angle - angleMin) * pulseRange) / angleRange) + pulseMin
            servoNumber = Math.clamp(1, 16, servoNumber)
            this.setServoPulse(servoNumber - 1, pulseWidth)
        }

        /*!
         *  @brief  Sends a reset command to the PCA9685 chip over I2C
         */
        reset() {
            this.writePCA9685Array([this.PCA9685_MODE1, 0x80])
            control.waitMicros(10000)
        }

        /*!
         *  @brief  Puts board into sleep mode
         */
        sleep() {
            let awake = this.readPCA9685(this.PCA9685_MODE1);
            let sleep = awake | 0x10; // set sleep bit high
            this.writePCA9685Array([this.PCA9685_MODE1, sleep])
            control.waitMicros(5); // wait until cycle ends for sleep to be active
        }

        /*!
         *  @brief  Wakes board from sleep
         */
        wakeup() {
            let sleep = this.readPCA9685(this.PCA9685_MODE1);
            let wakeup = sleep & ~0x10; // set sleep bit low
            this.writePCA9685Array([this.PCA9685_MODE1, wakeup])
        }

        /**************************************************************************/
        /*!
            @brief  Sets EXTCLK pin to use the external clock
               @param  prescale Configures the prescale value to be used by the external
           clock
        */
        /**************************************************************************/
        setExtClk(prescale: number) {
            let oldmode = this.readPCA9685(this.PCA9685_MODE1)
            let newmode = (oldmode & 0x7F) | 0x10; // sleep
            this.writePCA9685Array([this.PCA9685_MODE1, newmode])
            // This sets both the SLEEP and EXTCLK bits of the MODE1 register to switch to
            // use the external clock.
            this.writePCA9685Array([this.PCA9685_MODE1, (newmode |= 0x40)])
            this.writePCA9685Array([this.PCA9685_PRESCALE, prescale])
            control.waitMicros(5000)
            this.writePCA9685Array([this.PCA9685_MODE1, (newmode & ~(0x10) | 0xa0)])
        }

        /*!
         *  @brief  Sets the PWM frequency for the entire chip, up to ~1.6 KHz
         *  @param  freq Floating point frequency that we will attempt to match
         */
        setPWMFreq(freq: number) {
            freq *= 0.9; // Correct for overshoot in the frequency setting (see issue #11).
            let prescaleval = 25000000;
            prescaleval /= 4096;
            prescaleval /= freq;
            prescaleval -= 1;
            let prescale = Math.floor(prescaleval + 0.5);
            let oldmode = this.readPCA9685(this.PCA9685_MODE1)
            let newmode = (oldmode & 0x7F) | 0x10; // sleep
            this.writePCA9685Array([this.PCA9685_MODE1, newmode]);
            this.writePCA9685Array([this.PCA9685_PRESCALE, prescale]);
            this.writePCA9685Array([this.PCA9685_MODE1, oldmode]);
            control.waitMicros(5000)
            this.writePCA9685Array([this.PCA9685_MODE1, (oldmode | 0xa0) & 0x6F]);//  This sets the MODE1 register to turn on auto increment.
        }

        /*!
         *  @brief  Sets the output mode of the PCA9685 to either 
         *  open drain or push pull / totempole. 
         *  Warning: LEDs with integrated zener diodes should
         *  only be driven in open drain mode. 
         *  @param  totempole Totempole if true, open drain if false. 
         */
        setOutputMode(totempole: boolean) {
            let oldmode = this.readPCA9685(this.PCA9685_MODE2)

            let newmode = 0;
            if (totempole) {
                newmode = (oldmode & 0x7F) | 0x04;
            }
            else {
                newmode = (oldmode & 0x7F) & ~0x04;
            }
            let i2cArray: number[] = [this.PCA9685_MODE2, newmode];
            this.writePCA9685Array(i2cArray);
        }

        /*!
         *  @brief  Gets the PWM output of one of the PCA9685 pins
         *  @param  num One of the PWM output pins, from 0 to 15
         *  @return requested PWM output value
         */
        //function getPWM( num:number):number {

        //_i2c->requestFrom((int)_i2caddr, LED0_ON_L + 4 * num, (int)4);
        // return _i2c->read();
        //}


        //% blockId=Servo_setPWM
        //% temp_block="$this set servo %num to be on %on and off %off"
        //% blockGap=7
        //% advanced=true
        //% this.shadow=variables_get
        //% this.defl="Servo"
        //% servoNumber.min=1 servoNumber.max=16
        //% servoNumber.defl=1
        // TODO: Enable this func
        userSetPWM(servoNumber: number, on: number, off: number) {
            servoNumber = Math.clamp(1, 16, servoNumber)
            this.setPWM(servoNumber - 1, on, off)
        }

        /*!
         *  @brief  Sets the PWM output of one of the PCA9685 pins
         *  @param  num One of the PWM output pins, from 0 to 15
         *  @param  on At what point in the 4096-part cycle to turn the PWM output ON
         *  @param  off At what point in the 4096-part cycle to turn the PWM output OFF
         */
        setPWM(servoNumber: number, on: number, off: number) {
            servoNumber = Math.clamp(0, 15, servoNumber)
            let i2cArray: number[] = []
            i2cArray[0] = this.LED0_ON_L + 4 * servoNumber;
            i2cArray[1] = on & 0x00FF;
            i2cArray[2] = on >> 8;
            i2cArray[3] = off & 0x00FF;
            i2cArray[4] = off >> 8
            this.writePCA9685Array(i2cArray);
        }

        /*!
         *   @brief  Helper to set pin PWM output. Sets pin without having to deal with
         * on/off tick placement and properly handles a zero value as completely off and
         * 4095 as completely on.  Optional invert parameter supports inverting the
         * pulse for sinking to ground.
         *   @param  num One of the PWM output pins, from 0 to 15
         *   @param  val The number of ticks out of 4096 to be active, should be a value
         * from 0 to 4095 inclusive.
         *   @param  invert If true, inverts the output, defaults to 'false'
         */
        setPin(servoNumber: number, val: number, invert: boolean) {
            // Clamp value between 0 and 4095 inclusive.
            val = Math.min(val, 4095);
            if (invert) {
                if (val == 0) {
                    // Special value for signal fully on.
                    this.setPWM(servoNumber - 1, 4096, 0);
                } else if (val == 4095) {
                    // Special value for signal fully off.
                    this.setPWM(servoNumber - 1, 0, 4096);
                } else {
                    this.setPWM(servoNumber - 1, 0, 4095 - val);
                }
            } else {
                if (val == 4095) {
                    // Special value for signal fully on.
                    this.setPWM(servoNumber - 1, 4096, 0);
                } else if (val == 0) {
                    // Special value for signal fully off.
                    this.setPWM(servoNumber - 1, 0, 4096);
                } else {
                    this.setPWM(servoNumber - 1, 0, val);
                }
            }
        }

        writePCA9685Array(values: number[]) {
            let i2cBuffer = pins.createBuffer(values.length)
            for (let i = 0; i < values.length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i, values[i])
            }
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID);
        }

        //% blockId=PCA9685_read
        //% block="$this read from register%register"
        //% blockGap=7
        //% advanced=true
        //% this.shadow=variables_get
        //% this.defl="Servo"
        readPCA9685(register: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.UInt8LE, true, this.myBoardID, this.myClickID)
            return bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID).getUint8(0)
        }
    }
}
