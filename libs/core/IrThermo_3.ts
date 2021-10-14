  
/*
  This is a library written for the MLX90632 Non-contact thermal sensor
  SparkFun sells these at its website: www.sparkfun.com
  Do you like this library? Help support SparkFun. Buy a board!
  https://www.sparkfun.com/products/14569
  Written by Nathan Seidle @ SparkFun Electronics, December 28th, 2017
  The MLX90632 can remotely measure object temperatures within 1 degree C.
  This library handles the initialization of the MLX90632 and the calculations
  to get the temperatures.
  https://github.com/sparkfun/SparkFun_MLX90632_Arduino_Library
  Development environment specifics:
  Arduino IDE 1.8.3
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% advanced=true
namespace IrThermo_3{

    enum status
    {
      SENSOR_SUCCESS,
      SENSOR_ID_ERROR,
      SENSOR_I2C_ERROR,
      SENSOR_INTERNAL_ERROR,
      SENSOR_GENERIC_ERROR,
      SENSOR_TIMEOUT_ERROR
      //...
    } 
    

//The default I2C address for the MLX90632 on the SparkX breakout is =0x3B. =0x3A is also possible.
let MLX90632_DEFAULT_ADDRESS =0x3A 

//Registers
declare const EE_VERSION =0x240B

//32 bit constants
declare const EE_P_R =0x240C
declare const EE_P_G =0x240E
declare const EE_P_T =0x2410
declare const EE_P_O =0x2412
declare const EE_Aa =0x2414
declare const EE_Ab =0x2416
declare const EE_Ba =0x2418
declare const EE_Bb =0x241A
declare const EE_Ca =0x241C
declare const EE_Cb =0x241E
declare const EE_Da =0x2420
declare const EE_Db =0x2422
declare const EE_Ea =0x2424
declare const EE_Eb =0x2426
declare const EE_Fa =0x2428
declare const EE_Fb =0x242A
declare const EE_Ga =0x242C

//16 bit constants
declare const EE_Ha =0x2481
declare const EE_Hb =0x2482
declare const EE_Gb =0x242E
declare const EE_Ka =0x242F
declare const EE_Kb =0x2430

//Control registers
declare const EE_CONTROL =0x24D4
declare const EE_I2C_ADDRESS =0x24D5
declare const REG_I2C_ADDRESS =0x3000
declare const REG_CONTROL =0x3001
declare const REG_STATUS =0x3FFF

//User RAM
declare const RAM_1 =0x4000
declare const RAM_2 =0x4001
declare const RAM_3 =0x4002
declare const RAM_4 =0x4003
declare const RAM_5 =0x4004
declare const RAM_6 =0x4005
declare const RAM_7 =0x4006
declare const RAM_8 =0x4007
declare const RAM_9 =0x4008

//Three measurement modes available
declare const MODE_SLEEP =0b01
declare const MODE_STEP =0b10
declare const MODE_CONTINUOUS =0b11

//REG_STATUS bits
declare const BIT_DEVICE_BUSY =10
declare const BIT_EEPROM_BUSY =9
declare const BIT_BROWN_OUT =8
declare const BIT_CYCLE_POS =2 //6:2 = 5 bits
declare const BIT_NEW_DATA =0

//REG_CONTROL bits
declare const BIT_SOC =3
declare const BIT_MODE =1 //2:1 = 2 bits

declare const I2C_SPEED_STANDARD  =      100000
declare const I2C_SPEED_FAST       =     400000

declare const MAX_WAIT = 750; //Number of ms to wait before giving up. Some sensor actions take 512ms.



/*
  This is a library written for the MLX90632 Non-contact thermal sensor
  SparkFun sells these at its website: www.sparkfun.com
  Do you like this library? Help support SparkFun. Buy a board!
  https://www.sparkfun.com/products/14569
  Written by Nathan Seidle @ SparkFun Electronics, December 28th, 2017
  The MLX90632 can remotely measure object temperatures within 1 degree C.
  This library handles the initialization of the MLX90632 and the calculations
  to get the temperatures.
  https://github.com/sparkfun/SparkFun_MLX90632_Arduino_Library
  Development environment specifics:
  Arduino IDE 1.8.3
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
  TODO:
  check EEPROM write
  check timing - how fast to take reading? Setting the SOC twice may be doubling time
  set emissivity
*/

//Declare global variables for the calibration values
let P_R = 0;
let P_G= 0;
let P_T= 0;
let P_O= 0;
let Ea= 0;
let Eb= 0;
let Fa= 0;
let Fb= 0;
let Ga= 0;
let Gb= 0;
let Ka= 0;
let Ha= 0;
let Hb= 0;

let TOdut = 25.0; //Assume 25C for first iteration
let TO0 = 25.0; //object temp from previous calculation
let TA0 = 25.0; //ambient temp from previous calculation
let sensorTemp; //Internal temp of the MLX sensor



let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let returnError = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

//This begins the communication with the device
//Returns a status error if anything went wrong

export function begin(clickBoardNum:clickBoardID)
{

  let deviceAddress = MLX90632_DEFAULT_ADDRESS; //Get the I2C address from user

  //We require caller to begin their I2C port, with the speed of their choice
  //external to the library
  //_i2cPort->begin();
  //We could to a check here to see if user has init the Wire or not. Would
  //need to be for different platforms

  //Check communication with IC

let thisAddress = readRegister16(EE_I2C_ADDRESS, clickBoardNum);
  
  
  //Wait for eeprom_busy to clear
  let counter = 0;
  while (eepromBusy(clickBoardNum))
  {
    control.waitMicros(1);
    counter++;
    if (counter == MAX_WAIT)
    {
    
      returnError[clickBoardNum]  = status.SENSOR_TIMEOUT_ERROR;
      
    }
  }

  setMode(MODE_SLEEP,clickBoardNum); //Before reading EEPROM sensor needs to stop taking readings

  //Load all the static calibration factors
  let tempValue16;
  let tempValue32;
  tempValue32 = readRegister32(EE_P_R, clickBoardNum);
  P_R = tempValue32 * Math.pow(2, -8);
  tempValue32 = readRegister32(EE_P_G, clickBoardNum);
  P_G = tempValue32 * Math.pow(2, -20);
  tempValue32 = readRegister32(EE_P_T, clickBoardNum);
  P_T = tempValue32 * Math.pow(2, -44);

  tempValue32 = readRegister32(EE_P_O, clickBoardNum);
  P_O = tempValue32 * Math.pow(2, -8);

  tempValue32 = readRegister32(EE_Ea, clickBoardNum);
  Ea = tempValue32 * Math.pow(2, -16);
  tempValue32 = readRegister32(EE_Eb, clickBoardNum);
  Eb = tempValue32 * Math.pow(2, -8);
  tempValue32 = readRegister32(EE_Fa, clickBoardNum);
  Fa = tempValue32 * Math.pow(2, -46);
  tempValue32 = readRegister32(EE_Fb, clickBoardNum);
  Fb = tempValue32 * Math.pow(2, -36);
  tempValue32 = readRegister32(EE_Ga, clickBoardNum);
  Ga = tempValue32 * Math.pow(2, -36);


  tempValue16 = readRegister16(EE_Gb, clickBoardNum);
  Gb = tempValue16 * Math.pow(2, -10);

  tempValue16 = readRegister16(EE_Ka, clickBoardNum);
  Ka = tempValue16 * Math.pow(2, -10);

  tempValue16 = readRegister16(EE_Ha, clickBoardNum);
  Ha = tempValue16 * Math.pow(2, -14); //Ha!

  tempValue16 = readRegister16(EE_Hb, clickBoardNum);
  Hb = tempValue16 * Math.pow(2, -14);

  //Note, sensor is in sleep mode

  
}

//Read all calibration values and calculate the temperature of the thing we are looking at
//Depending on mode, initiates a measurement
//If in sleep or step mode, clears the new_data bit, sets the SOC bit
     //%blockId=IRThermo_getObjectTemp
    //%block="Get surface temperature in Celcius on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function getObjectTemp(clickBoardNum:clickBoardID):number
{
  returnError[clickBoardNum]  = status.SENSOR_SUCCESS;
    if(isInitialized[clickBoardNum] == 0)
    {
        begin(clickBoardNum)
        isInitialized[clickBoardNum] = 1; //Device is initialied
    }
  //If the sensor is not in continuous mode then the tell sensor to take reading
  if(getMode(clickBoardNum) != MODE_CONTINUOUS){
    setSOC(clickBoardNum);

  } 

  //Write new_data = 0
  clearNewData(clickBoardNum);

  //Check when new_data = 1
  let counter = 0;
  while (dataAvailable(clickBoardNum) == false)
  {
    control.waitMicros(1);
    counter++;
    if (counter == MAX_WAIT)
    {
basic.showString("E")
      returnError[clickBoardNum]  = status.SENSOR_TIMEOUT_ERROR;
      return (0.0); //Error
    }
  }

  gatherSensorTemp(clickBoardNum );
  if (returnError[clickBoardNum]  != status.SENSOR_SUCCESS)
  {
    
    basic.showString("F")

    return (0.0); //Error
  }

  let lowerRAM = 0;
  let upperRAM = 0;

  //Get RAM_6 and RAM_9
  let sixRAM = readRegister16(RAM_6,clickBoardNum);
  let nineRAM = readRegister16(RAM_9, clickBoardNum);

  //Read cycle_pos to get measurement pointer
  let cyclePosition = getCyclePosition(clickBoardNum);

  //If cycle_pos = 1
  //Calculate TA and TO based on RAM_4, RAM_5, RAM_6, RAM_9
  if (cyclePosition == 1)
  {
    lowerRAM = readRegister16(RAM_4, clickBoardNum);
    upperRAM = readRegister16(RAM_5, clickBoardNum);
  }
  //If cycle_pos = 2
  //Calculate TA and TO based on RAM_7, RAM_8, RAM_6, RAM_9
  else if (cyclePosition == 2)
  {
    lowerRAM = readRegister16(RAM_7, clickBoardNum);
    upperRAM = readRegister16(RAM_8, clickBoardNum);
  }
  else
  {
  
    lowerRAM = readRegister16(RAM_4, clickBoardNum);
    upperRAM = readRegister16(RAM_5, clickBoardNum);
  }

  //Object temp requires 3 iterations
  for (let i = 0 ; i < 3 ; i++)
  {
    let VRta = nineRAM + Gb * (sixRAM / 12.0);

    let AMB = ((sixRAM / 12.0) / VRta )* 524288;

    //let sensorTemp = P_O + ((AMB - P_R) / P_G )+ (P_T * Math.pow((AMB - P_R), 2));

    let S = (lowerRAM + upperRAM) / 2.0;
    let VRto = nineRAM + (Ka * (sixRAM / 12.0));
    let Sto = ((S / 12.0) / VRto) * 524288;

    let TAdut = ((AMB - Eb) / Ea) + 25.0;

    let ambientTempK = TAdut + 273.15;

    let bigFraction = Sto / (1 * Fa * Ha * (1 +( Ga * (TOdut - TO0)) + (Fb * (TAdut - TA0))));

    let objectTemp = bigFraction + Math.pow(ambientTempK, 4);
    objectTemp = Math.sqrt(Math.sqrt(Math.abs(objectTemp))); //Take 4th root
    objectTemp = objectTemp - 273.15 - Hb;

    TO0 = objectTemp;

  }

  return (TO0);
}

     //%blockId=IRThermo_getObjectTempF
    //%block="Get surface temperature in Fahrenheit on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function getObjectTempF(clickBoardNum:clickBoardID):number
{
    
  let tempC = getObjectTemp(clickBoardNum);
  let tempF = tempC * 9.0/5.0 + 32.0;
  return(tempF);
}



function getSensorTemp(clickBoardNum:clickBoardID ):number
{
  returnError[clickBoardNum]  = status.SENSOR_SUCCESS;

  //If the sensor is not in continuous mode then the tell sensor to take reading
  if(getMode(clickBoardNum) != MODE_CONTINUOUS) {
      setSOC(clickBoardNum);
  }
  //Write new_data = 0
  clearNewData(clickBoardNum);

  //Wait for new data
  let counter = 0;
  while (dataAvailable(clickBoardNum) == false)
  {
    control.waitMicros(1);
    counter++;
    if (counter == MAX_WAIT)
    {
      returnError[clickBoardNum]  = status.SENSOR_TIMEOUT_ERROR;
      return (0.0); //Error
    }
  }

  return (gatherSensorTemp(clickBoardNum ));
}

//This reads all the temperature calibration factors for the sensor itself
//This is needed so that it can be called from getObjectTemp *and* users can call getSensorTemp 
//without causing a let read
function gatherSensorTemp(clickBoardNum:clickBoardID ):number
{
  returnError[clickBoardNum]  = status.SENSOR_SUCCESS;

  //Get RAM_6 and RAM_9
  let sixRAM = readRegister16(RAM_6, clickBoardNum);
  
  let nineRAM=  readRegister16(RAM_9, clickBoardNum);


  let VRta = nineRAM + (Gb * (sixRAM / 12.0));

  let AMB = ((sixRAM / 12.0) / VRta) * Math.pow(2, 19);

  let sensorTemp = P_O + ((AMB - P_R) / P_G) + (P_T * Math.pow((AMB - P_R), 2));

  

  return(sensorTemp);
}

//Returns true if device is busy doing measurement
//Always true in continuous mode
function deviceBusy(clickBoardNum:clickBoardID):boolean
{
  if (getStatus(clickBoardNum) & (1 << BIT_DEVICE_BUSY)) {return (true);}
  return (false);
}

//Returns true if eeprom is busy
//EEPROM is busy during boot up and during EEPROM write/erase
function eepromBusy(clickBoardNum:clickBoardID):boolean
{
  if (getStatus(clickBoardNum) & (1 << BIT_EEPROM_BUSY)) 
  {return (true);}
  return (false);
}

//Returns the cycle_pos from status register. cycle_pos is 0 to 31
function getCyclePosition(clickBoardNum:clickBoardID):number
{
  let status = (getStatus(clickBoardNum) >> BIT_CYCLE_POS); //Shave off last two bits
  status &= 0x1F; //Get lower 5 bits.
  return (status);
}

//Returns true if new data is available
function dataAvailable(clickBoardNum:clickBoardID):boolean
{
  if (getStatus(clickBoardNum) & (1 << BIT_NEW_DATA)) {return (true);}
  return (false);
}

//Sets the brown_out bit. Datasheet says 'Customer should set bit to 1'. Ok.
function setBrownOut(clickBoardNum:clickBoardID)
{
let reg = getStatus(clickBoardNum); //Get current bits
  reg |= (1 << BIT_BROWN_OUT); //Set the bit
  writeRegister16(REG_STATUS, reg,clickBoardNum); //Set the mode bits
}

//Clear the new_data bit. This is done after a measurement is complete
function clearNewData(clickBoardNum:clickBoardID)
{
  let reg = getStatus(clickBoardNum); //Get current bits
  reg &= ~(1 << BIT_NEW_DATA); //Clear the bit
  writeRegister16(REG_STATUS, reg,clickBoardNum); //Set the mode bits
}

function getStatus(clickBoardNum:clickBoardID)
{
    returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
  let deviceStatus   = readRegister16(REG_STATUS, clickBoardNum);

  return (deviceStatus);
}


//Changes the mode to sleep
function sleepMode(clickBoardNum:clickBoardID)
{
  setMode(MODE_SLEEP,clickBoardNum);
}

//Changes the mode to step
function stepMode(clickBoardNum:clickBoardID)
{
  setMode(MODE_STEP,clickBoardNum);
}

//Changes the mode to continuous read
function continuousMode(clickBoardNum:clickBoardID)
{
  setMode(MODE_CONTINUOUS,clickBoardNum);
}

//Sets the Start of Conversion (SOC) bit
function setSOC(clickBoardNum:clickBoardID)
{
    returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
  let reg = readRegister16(REG_CONTROL, clickBoardNum); //Get current bits

  reg |= (1 << 3); //Set the bit
  writeRegister16(REG_CONTROL, reg,clickBoardNum); //Set the bit

}

//Sets the sensing mode (3 modes availabe)
function setMode(mode:number,clickBoardNum:clickBoardID )
{
    returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
    
  let reg = readRegister16(REG_CONTROL, clickBoardNum)//Get current bits
   
  reg &= ~(0x0003 << 1); //Clear the mode bits
  reg |= (mode << 1); //Set the bits
  writeRegister16(REG_CONTROL, reg,clickBoardNum); //Set the mode bits
  
}

//Returns the mode of the sensor
function getMode(clickBoardNum:clickBoardID )
{
  
 returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
let mode = readRegister16(REG_CONTROL, clickBoardNum); //Get current register settings
  
  mode = (mode >> 1) & 0x0003; //Clear all other bits
  return (mode);
}



//Reads two consecutive bytes from a given location
//Stores the result at the provided outputPointer
function readRegister16( addr:number, clickBoardNum:clickBoardID):number
{
    let i2cBuffer = pins.createBuffer(2);
 returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
 bBoard.i2cWriteNumber(MLX90632_DEFAULT_ADDRESS,addr,NumberFormat.Int16BE,clickBoardNum,true)

 i2cBuffer = bBoard.I2CreadNoMem(MLX90632_DEFAULT_ADDRESS,2,clickBoardNum);


 let msb = i2cBuffer.getUint8(0)
 let lsb = i2cBuffer.getUint8(1)

return  (msb << 8 | lsb)

 //return  bBoard.I2CreadNoMem(MLX90632_DEFAULT_ADDRESS,2,clickBoardNum).getNumber(NumberFormat.UInt16BE,0)
}

//Reads two 16-bit registers and combines them into 32 bits
function readRegister32(addr:number,  clickBoardNum:clickBoardID):number
{

  returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
 
  //For the MLX90632 the first 16-bit chunk is LSB, the 2nd is MSB
  let lower = readRegister16(addr,clickBoardNum)
  let upper =readRegister16(addr+1,clickBoardNum)


  return (upper << 16 | lower)
}

//Write two bytes to a spot
function writeRegister16(addr:number,  val:number,clickBoardNum:clickBoardID)
{
  returnError[clickBoardNum]  = status.SENSOR_SUCCESS; //By default, return success
let i2cBuffer = pins.createBuffer(4)

i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, addr >> 8 )
i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, addr & 0xFF)
i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, val >> 8) 
i2cBuffer.setNumber(NumberFormat.UInt8LE, 3, val & 0xFF)

bBoard.i2cWriteBuffer(MLX90632_DEFAULT_ADDRESS,i2cBuffer,clickBoardNum);

  

 
}

//Write a value to EEPROM
//Requires unlocking the EEPROM, writing =0x0000, unlocking again, then writing value
//The datasheet doesn't go a good job of explaining how writing to EEPROM works.
//This should work but doesn't. It seems the IC is very sensitive to I2C traffic while
//the sensor is recording the new EEPROM.
function writeEEPROM(addr:number,  val:number,clickBoardNum:clickBoardID)
{
  //Put device into halt mode (page 15)
  let originalMode = getMode(clickBoardNum);
  setMode(MODE_SLEEP,clickBoardNum);

  //Wait for complete
  while (deviceBusy(clickBoardNum)) control.waitMicros(1);

  //Magic unlock (page 17)
  writeRegister16(0x3005, 0x554C,clickBoardNum);

  //Wait for complete
  control.waitMicros(100);

  //Now we can write to one EEPROM word
  //Write =0x0000 to user's location (page 16) to erase
  writeRegister16(addr, 0x0000,clickBoardNum);

  //Wait for complete
  control.waitMicros(100);
  //while (eepromBusy()) control.waitMicros(1);
  //while (deviceBusy()) control.waitMicros(1);

  //Magic unlock again
  writeRegister16(0x3005, 0x554C,clickBoardNum);

  //Wait for complete
  control.waitMicros(100);

  //Now we can write to one EEPROM word
  writeRegister16(addr, val,clickBoardNum);

  //Wait for complete
  control.waitMicros(100);
  //while (eepromBusy()) control.waitMicros(1);
  //while (deviceBusy()) control.waitMicros(1);

  //Return to original mode
  setMode(originalMode,clickBoardNum);
}
}