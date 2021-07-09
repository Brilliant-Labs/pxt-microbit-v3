/*
    (c) 2016 Microchip Technology Inc. and its subsidiaries. You may use this
    software and any derivatives exclusively with Microchip products.

    THIS SOFTWARE IS SUPPLIED BY MICROCHIP "AS IS". NO WARRANTIES, WHETHER
    EXPRESS, IMPLIED OR STATUTORY, APPLY TO THIS SOFTWARE, INCLUDING ANY IMPLIED
    WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR A
    PARTICULAR PURPOSE, OR ITS INTERACTION WITH MICROCHIP PRODUCTS, COMBINATION
    WITH ANY OTHER PRODUCTS, OR USE IN ANY APPLICATION.

    IN NO EVENT WILL MICROCHIP BE LIABLE FOR ANY INDIRECT, SPECIAL, PUNITIVE,
    INCIDENTAL OR CONSEQUENTIAL LOSS, DAMAGE, COST OR EXPENSE OF ANY KIND
    WHATSOEVER RELATED TO THE SOFTWARE, HOWEVER CAUSED, EVEN IF MICROCHIP HAS
    BEEN ADVISED OF THE POSSIBILITY OR THE DAMAGES ARE FORESEEABLE. TO THE
    FULLEST EXTENT ALLOWED BY LAW, MICROCHIP'S TOTAL LIABILITY ON ALL CLAIMS IN
    ANY WAY RELATED TO THIS SOFTWARE WILL NOT EXCEED THE AMOUNT OF FEES, IF ANY,
    THAT YOU HAVE PAID DIRECTLY TO MICROCHIP FOR THIS SOFTWARE.

    MICROCHIP PROVIDES THIS SOFTWARE CONDITIONALLY UPON YOUR ACCEPTANCE OF THESE
    TERMS.
*/

/**
 * Custom blocks
 */
//% weight=100 color=#F4B820 icon=""
//% advanced=true
namespace Touchpad{


//Address Definitions
declare const DEFAULT_I2C_ADDRESS     =      0x25  
declare const FWMAJOR        =     0x00
declare const FWMINOR        =     0x01
declare const APPIDH         =     0x02
declare const APPIDL          =    0x03
declare const CMD            =     0x04
declare const MODE          =      0x05
declare const MODECON       =      0x06
declare const TOUCH_STATE   =      0x10
declare const TOUCH_XREG    =      0x11
declare const TOUCH_YREG    =      0x12
declare const GESTURESTATE = 0x14


//Masks
declare const touch_mask = 0x01
declare const gesture_mask = 0x02

enum gestures{
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



let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

   //%blockId=Touchpad_initialize
    //%block="Initalize touchpad with i2c address %deviceAddr on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
{
    //setTMP116Addr(deviceAddr,clickBoardNum)
    isInitialized[clickBoardNum]  = 1
    setMTCH6102Addr(deviceAddr,clickBoardNum)
    writeMTCH6102(0b0011,MODE,clickBoardNum) //Set the mode to full 


}

    //%blockId=Touchpad_getX
    //%block="Get X position on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function getX(clickBoardNum:clickBoardID):number
{
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
        
    }
    return readMTCH6102( TOUCH_XREG,clickBoardNum);
}

   //%blockId=Touchpad_getY
    //%block="Get Y position on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
export function getY(clickBoardNum:clickBoardID):number
{
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
        
    }
    return readMTCH6102(TOUCH_YREG,clickBoardNum);
}

   //%blockId=Touchpad_isTouched
    //%block="Has touch occured on click%clickBoardNum ?"
    //% blockGap=7
    //% advanced=false
    export function isTouched(clickBoardNum:clickBoardID):boolean
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
            
        }
    
        
        return readMTCH6102(TOUCH_STATE,clickBoardNum)&touch_mask? true:false;
    }

       //%blockId=Touchpad_isGesture
    //%block="Has gesture occured on click%clickBoardNum ?"
    //% blockGap=7
    //% advanced=false
    export function isGesture(clickBoardNum:clickBoardID):boolean
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
            
        }
    
       let  gestureState = readMTCH6102(TOUCH_STATE,clickBoardNum)

       if(((gestureState&gesture_mask)>>1) == 1)
       {
           return true
        }
       return false;
    }

   //%blockId=Touchpad_getGestureName
    //%block="Convert gesture ID %gestureID to a friendly name on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false    
    export function getGestureName(gestureID:number,clickBoardNum:clickBoardID):string
    {
switch (gestureID)
{
  

    case  gestures.Single_Click:
    return "Single Click"
    break;

    case  gestures.Click_Hold :
    return "Click & Hold"
    break;

    case  gestures.Double_Click:
    return "Double Click"
    break;
    
    case  gestures.Down_Swipe :
    return "Down"
    break;
    
    case  gestures.Down_Swipe_Hold:
    return "Down Hold"
    break;

    case  gestures.Right_Swipe :
    return "Right"
    break;

    case  gestures.Right_Swipe_Hold :
    return "Right Hold"
    break;

    case  gestures.Up_Swipe :
    return "Up"
    break;

    case  gestures.Up_Swipe_Hold: 
    return "Up Hold"
    break;

    case  gestures.Left_Swipe:
    return "Left"
    break;

    case  gestures.Left_Swipe_Hold: 
    return "Left Hold"
    break;
}
return "None"
    }

   //%blockId=Touchpad_getTouchState
    //%block="Get touch status on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
export function getTouchState(clickBoardNum:clickBoardID):number
{
 
    
    return readMTCH6102(TOUCH_STATE,clickBoardNum);
}

   //%blockId=Touchpad_getGesture
    //%block="Get gesture on click%clickBoardNum"
    //% blockGap=7
    //% advanced=false
    export function getGesture(clickBoardNum:clickBoardID):number
    {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
            
        }
    
        
        return readMTCH6102(GESTURESTATE,clickBoardNum);
    }

   //%blockId=Touchpad_write
    //%block="Write %value to register%register on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
function writeMTCH6102(value:number,register:number,clickBoardNum:clickBoardID)
{


    let i2cBuffer = pins.createBuffer(2)

    i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
    i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value ) 
    

    bBoard.i2cWriteBuffer(getMTCH6102Addr(clickBoardNum),i2cBuffer,clickBoardNum);
 
}

 //%blockId=Touchpad_read
    //%block="Read from register%register on click%clickBoardNum"
    //% blockGap=7
    //% advanced=true
function readMTCH6102( register:number, clickBoardNum:clickBoardID):number
{
    let i2cBuffer = pins.createBuffer(1);

 bBoard.i2cWriteNumber(getMTCH6102Addr(clickBoardNum),register,NumberFormat.Int8LE,clickBoardNum,true)

return bBoard.I2CreadNoMem(getMTCH6102Addr(clickBoardNum),1,clickBoardNum).getUint8(0);



}


function setMTCH6102Addr(deviceAddr:number,clickBoardNum:clickBoardID)
{
    deviceAddress[clickBoardNum] = deviceAddr;
}
function getMTCH6102Addr(clickBoardNum:clickBoardID):number
{
    return deviceAddress[clickBoardNum];
}

}