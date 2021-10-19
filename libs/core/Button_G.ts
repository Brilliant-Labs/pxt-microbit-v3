
//% weight=100 color=#F4B820 icon=""
//% advanced=true

namespace Button_G {


    
    export enum Light{
        Off = 0,
        On = 1
    
    }
    
    
  
    
        //% blockId=ButtonG_SetLight
        //% block="Turn button light %onOff on click%clickBoardNum"
 export function setLight(onOff:Light,clickBoardNum:clickBoardID)
 {
    bBoard.writePin(onOff,clickIOPin.PWM,clickBoardNum)
 }

    
        //% blockId=ButtonG_SetLight_PWM
        //% block="Set button light to %PWMValue brightness on click%clickBoardNum"
        //% PWMValue.min=0 PWMValue.max=100 
        export function setLightPWM(PWMValue:number,clickBoardNum:clickBoardID)
        {
           bBoard.PWMOut(clickPWMPin.PWM,PWMValue,clickBoardNum)
        }

    
        //% blockId=ButtonG_getSwitch
        //% block="Read button state on click%clickBoardNum"
      export  function getSwitch(clickBoardNum:clickBoardID):number
        {
           return bBoard.digitalReadPin(clickIOPin.INT,clickBoardNum)
        }

}
