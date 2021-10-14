
/**
 * Custom blocks
 */
//% weight=100 color=#EF697B icon=""
//% advanced=true
namespace Servo{

 
      
    declare const PCA9685_DEFAULT_I2C_ADDRESS =  0x40  
    declare const LTC2497_DEFAULT_I2C_ADDRESS =  0x48  
declare const PCA9685_SUBADR1 =0x2 /**< i2c bus address 1 */
declare const PCA9685_SUBADR2 =0x3 /**< i2c bus address 2 */
declare const PCA9685_SUBADR3 =0x4 /**< i2c bus address 3 */

declare const PCA9685_MODE1 =0x0 /**< Mode Register 1 */
declare const PCA9685_MODE2 =0x1 /**< Mode Register 2 */
declare const PCA9685_PRESCALE =0xFE /**< Prescaler for PWM output frequency */

declare const LED0_ON_L= 0x6 /**< LED0 output and brightness control byte 0 */
declare const LED0_ON_H =0x7 /**< LED0 output and brightness control byte 1 */
declare const LED0_OFF_L =0x8 /**< LED0 output and brightness control byte 2 */
declare const LED0_OFF_H =0x9 /**< LED0 output and brightness control byte 3 */

declare const ALLLED_ON_L =0xFA /**< load all the LEDn_ON registers, byte 0 */
declare const ALLLED_ON_H =0xFB /**< load all the LEDn_ON registers, byte 1 */
declare const ALLLED_OFF_L= 0xFC /**< load all the LEDn_OFF registers, byte 0 */
declare const ALLLED_OFF_H =0xFD /**< load all the LEDn_OFF registers, byte 1 */

let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let servoPulseMin  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let servoPulseMax = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

let servoAngleMin  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let servoAngleMax = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

/*!
 *  @file Adafruit_PWMServoDriver.cpp
 *
 *  @mainpage Adafruit 16-channel PWM & Servo driver
 *
 *  @section intro_sec Introduction
 *
 *  This is a library for the 16-channel PWM & Servo driver.
 *
 *  Designed specifically to work with the Adafruit PWM & Servo driver.
 *
 *  Pick one up today in the adafruit shop!
 *  ------> https://www.adafruit.com/product/815
 *
 *  These displays use I2C to communicate, 2 pins are required to interface.
 *
 *  Adafruit invests time and resources providing this open source code,
 *  please support Adafruit andopen-source hardware by purchasing products
 *  from Adafruit!
 *
 *  @section author Author
 *
 *  Limor Fried/Ladyada (Adafruit Industries).
 *
 *  @section license License
 *
 *  BSD license, all text above must be included in any redistribution
 */


/*!
 *  @brief  Setups the I2C interface and hardware
 *  @param  prescale
 *          Sets External Clock (Optional)
 *
 */
  

     //%blockId=Servo_initialize
        //%block="Initalize PCA9685 to i2c address %PCA9685Addr and LTC2497 to i2c address %LTC2497Addr on click%clickBoardNum"
        //% blockGap=7
        //% advanced=true
        export function initialize(PCA9685Addr:number, LTC2497Addr:number,clickBoardNum:clickBoardID)
        {
           
            isInitialized[clickBoardNum]  = 1;
            setPCA9685Addr(PCA9685Addr,clickBoardNum);
            bBoard.clearPin(clickIOPin.CS,clickBoardNum);
            setPWMFreq(60,clickBoardNum);
        
        }
    


// you can use this function if you'd like to set the pulse length in seconds
// e.g. setServoPulse(0, 0.001) is a ~1 millisecond pulse width. its not precise!
function setServoPulse( servoNumber:number, pulse:number,clickBoardNum:clickBoardID) {
    
    
    let pulselength = 1000000;   // 1,000,000 us per second
    pulselength =pulselength/ 60;   // 60 Hz
   
    pulselength =pulselength/ 4096;  // 12 bits of resolution
   
    pulse = pulse/pulselength ;  // convert to us
    
    bBoard.sendString("Pulse2="+pulse.toString(),2)
    setPWM(servoNumber, 0, pulse,clickBoardNum);
  }


     //%blockId=Servo_Angle
    //%block="Set servo %n to %angle on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
    //% servoNumber.min=1 servoNumber.max=16
    //% servoNumber.defl=1
export function setServoAngle( servoNumber:number, angle:number,clickBoardNum:clickBoardID) {
    
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(PCA9685_DEFAULT_I2C_ADDRESS,LTC2497_DEFAULT_I2C_ADDRESS,clickBoardNum)
        
    }

    servoNumber = Math.min(servoNumber,1);
    servoNumber = Math.max(servoNumber,16);

    let angleMin = 0
    let angleMax = 180
    let pulseMin = 1000
    let pulseMax = 2000

    let angleRange = (angleMax - angleMin)  
    let pulseRange = (pulseMax - pulseMin)  
    let pulseWidth = (((angle - angleMin) * pulseRange) / angleRange) + pulseMin

    setServoPulse(servoNumber-1,pulseWidth,clickBoardNum)
  }

     //%blockId=Servo_AngleAdjusted
    //%block="Set servo %n to %angle with pulse range min %pulseMin and max %pulseMax on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
        //% servoNumber.min=1 servoNumber.max=16
    //% servoNumber.defl=1
export function setServoAngleAdjusted( servoNumber:number,  angle:number,pulseMin:number,pulseMax:number,clickBoardNum:clickBoardID) {
    
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(PCA9685_DEFAULT_I2C_ADDRESS,LTC2497_DEFAULT_I2C_ADDRESS,clickBoardNum)
        
    }
    let angleMin = 0
    let angleMax = 180

    let angleRange = (angleMax - angleMin)  
    let pulseRange = (pulseMax - pulseMin)  
    let pulseWidth = (((angle - angleMin) * pulseRange) / angleRange) + pulseMin
    servoNumber = Math.min(servoNumber,1);
    servoNumber = Math.max(servoNumber,16);
   
    setServoPulse(servoNumber-1,pulseWidth,clickBoardNum)
  }

  function getServoAngleMin(clickBoardNum:clickBoardID):number
  {
    return servoAngleMin[clickBoardNum];
  }
  function getServoAngleMax(clickBoardNum:clickBoardID):number
  {
    return servoAngleMax[clickBoardNum];
  }
  function getServoPulseMin(clickBoardNum:clickBoardID):number
  {
    return servoPulseMin[clickBoardNum];
  }
  function getServoPulseMax(clickBoardNum:clickBoardID):number
  {
    return servoPulseMax[clickBoardNum];
  }
/*!
 *  @brief  Sends a reset command to the PCA9685 chip over I2C
 */
function reset(clickBoardNum:clickBoardID) {

 writePCA9685Array([PCA9685_MODE1, 0x80],clickBoardNum)
 control.waitMicros(10000)

}

/*!
 *  @brief  Puts board into sleep mode
 */
function sleep(clickBoardNum:clickBoardID) {
  let awake = readPCA9685(PCA9685_MODE1,clickBoardNum);
  let sleep = awake | 0x10; // set sleep bit high
 writePCA9685Array([PCA9685_MODE1, sleep],clickBoardNum)
  control.waitMicros(5); // wait until cycle ends for sleep to be active
}

/*!
 *  @brief  Wakes board from sleep
 */
function wakeup(clickBoardNum:clickBoardID) {
  let sleep = readPCA9685(PCA9685_MODE1,clickBoardNum);
  let wakeup = sleep & ~0x10; // set sleep bit low
  writePCA9685Array([PCA9685_MODE1, wakeup],clickBoardNum)
}

/**************************************************************************/
/*!
    @brief  Sets EXTCLK pin to use the external clock
       @param  prescale Configures the prescale value to be used by the external
   clock
*/
/**************************************************************************/
function setExtClk(prescale:number,clickBoardNum:clickBoardID) {
  let oldmode = readPCA9685(PCA9685_MODE1,clickBoardNum)
  let newmode = (oldmode & 0x7F) | 0x10; // sleep
  writePCA9685Array([PCA9685_MODE1, newmode],clickBoardNum)
 

  // This sets both the SLEEP and EXTCLK bits of the MODE1 register to switch to
  // use the external clock.
  writePCA9685Array([PCA9685_MODE1, (newmode |= 0x40)],clickBoardNum)

  writePCA9685Array([PCA9685_PRESCALE, prescale],clickBoardNum)

    control.waitMicros(5000)
    writePCA9685Array([PCA9685_MODE1, (newmode & ~(0x10) | 0xa0)],clickBoardNum)


}

/*!
 *  @brief  Sets the PWM frequency for the entire chip, up to ~1.6 KHz
 *  @param  freq Floating point frequency that we will attempt to match
 */
function setPWMFreq(freq:number,clickBoardNum:clickBoardID) {


    freq *= 0.9; // Correct for overshoot in the frequency setting (see issue #11).
    let prescaleval = 25000000;
    prescaleval /= 4096;
    prescaleval /= freq;
    prescaleval -= 1;


    let prescale = Math.floor(prescaleval + 0.5);


    let oldmode = readPCA9685(PCA9685_MODE1,clickBoardNum)
    let  newmode = (oldmode & 0x7F) | 0x10; // sleep

    writePCA9685Array([PCA9685_MODE1, newmode],clickBoardNum);
    writePCA9685Array([PCA9685_PRESCALE, prescale],clickBoardNum);
    writePCA9685Array([PCA9685_MODE1, oldmode],clickBoardNum);
    control.waitMicros(5000)
    writePCA9685Array([PCA9685_MODE1, (oldmode |0xa0)&0x6F],clickBoardNum);//  This sets the MODE1 register to turn on auto increment.

}

/*!
 *  @brief  Sets the output mode of the PCA9685 to either 
 *  open drain or push pull / totempole. 
 *  Warning: LEDs with integrated zener diodes should
 *  only be driven in open drain mode. 
 *  @param  totempole Totempole if true, open drain if false. 
 */
function setOutputMode( totempole:boolean, clickBoardNum:clickBoardID) {  
   let oldmode =  readPCA9685(PCA9685_MODE2,clickBoardNum)

let  newmode = 0;
  if (totempole) {
    newmode = (oldmode&0x7F) | 0x04;
  }
  else {
    newmode = (oldmode&0x7F) & ~0x04;
  }
  let i2cArray:number[] = [PCA9685_MODE2, newmode];
  writePCA9685Array(i2cArray,clickBoardNum); 
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


     //%blockId=Servo_setPWM
    //%block="Set servo %num to be on %on and off %off on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
    //% servoNumber.min=1 servoNumber.max=16
    //% servoNumber.defl=1
    export function userSetPWM(servoNumber:number, on:number, off:number,clickBoardNum:clickBoardID)  
    {
      servoNumber = Math.min(servoNumber,1);
      servoNumber = Math.max(servoNumber,16);
        setPWM(servoNumber-1,on,off,clickBoardNum)
    }
/*!
 *  @brief  Sets the PWM output of one of the PCA9685 pins
 *  @param  num One of the PWM output pins, from 0 to 15
 *  @param  on At what point in the 4096-part cycle to turn the PWM output ON
 *  @param  off At what point in the 4096-part cycle to turn the PWM output OFF
 */
  
function setPWM(servoNumber:number, on:number, off:number,clickBoardNum:clickBoardID)  {

    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(PCA9685_DEFAULT_I2C_ADDRESS,LTC2497_DEFAULT_I2C_ADDRESS,clickBoardNum);
    }
    servoNumber = Math.min(servoNumber,1);
    servoNumber = Math.max(servoNumber,16);


    let i2cArray:number [] = []
    i2cArray[0] = LED0_ON_L + 4 * servoNumber;
    i2cArray[1] = on & 0x00FF;
    i2cArray[2] = on >> 8;
    i2cArray[3] = off & 0x00FF;
    i2cArray[4] = off >> 8
    writePCA9685Array(i2cArray,clickBoardNum);
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
function setPin(servoNumber:number, val:number, invert:boolean,clickBoardNum:clickBoardID) {

    servoNumber = Math.min(servoNumber,1);
    servoNumber = Math.max(servoNumber,16);
  
  // Clamp value between 0 and 4095 inclusive.
  val = Math.min(val, 4095);
  if (invert) {
    if (val == 0) {
      // Special value for signal fully on.
      setPWM(servoNumber-1, 4096, 0,clickBoardNum);
    } else if (val == 4095) {
      // Special value for signal fully off.
      setPWM(servoNumber-1, 0, 4096,clickBoardNum);
    } else {
      setPWM(servoNumber-1, 0, 4095 - val,clickBoardNum);
    }
  } else {
    if (val == 4095) {
      // Special value for signal fully on.
      setPWM(servoNumber-1, 4096, 0,clickBoardNum);
    } else if (val == 0) {
      // Special value for signal fully off.
      setPWM(servoNumber-1, 0, 4096,clickBoardNum);
    } else {
      setPWM(servoNumber-1, 0, val,clickBoardNum);
    }
  }
}





    
     //%blockId=PCA9685_write
        //%block="Write array %values to PCA9685 register%register on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=true
        function writePCA9685Array(values:number[],clickBoardNum:clickBoardID)
        {
        
        
            let i2cBuffer = pins.createBuffer(values.length)

        for (let i=0;i<values.length;i++)
        {
            i2cBuffer.setNumber(NumberFormat.UInt8LE, i, values[i])
           
        }
    
        
            bBoard.i2cWriteBuffer(getPCA9685Addr(clickBoardNum),i2cBuffer,clickBoardNum);
         
        }
       


        
         //%blockId=PCA9685_read
            //%block="Read from register%register on click%clickBoardNum"
            //% blockGap=7
            //% advanced=true
      export   function readPCA9685( register:number, clickBoardNum:clickBoardID):number
        {
            
    
            bBoard.i2cWriteNumber(getPCA9685Addr(clickBoardNum),register,NumberFormat.UInt8LE,clickBoardNum,true)

    
            return  bBoard.I2CreadNoMem(getPCA9685Addr(clickBoardNum),1,clickBoardNum).getUint8(0)
    
                
        
        }
        
        
        function setPCA9685Addr(deviceAddr:number,clickBoardNum:clickBoardID)
        {
            deviceAddress[clickBoardNum] = deviceAddr;
        }
        function getPCA9685Addr(clickBoardNum:clickBoardID):number
        {
            return deviceAddress[clickBoardNum];
        }
        
        }
