
/**
 * Custom blocks
 */
//% weight=100 color=#66791B  icon=""
//% advanced=true
namespace Relay{

export enum relay
{
    Relay1 = 1,
    Relay2 = 2
}
export enum onOff
{
    On = 1,
    Off = 0
}

    
    
       //%blockId=Relay_relayOn
        //%block="Turn on relay %relayNum on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
    export function relayOn(relayNum:relay,clickBoardNum:clickBoardID)
    {
        switch(relayNum)
        {
            case relay.Relay1:
                bBoard.setPin(clickIOPin.PWM,clickBoardNum);
            break;

            case relay.Relay2:
            bBoard.setPin(clickIOPin.CS,clickBoardNum);
            break;
        }
    
    }

         //%blockId=Relay_relayOff
        //%block="Turn off relay %relayNum on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        export function relayOff(relayNum:relay,clickBoardNum:clickBoardID)
        {
            switch(relayNum)
            {
                case relay.Relay1:
                    bBoard.clearPin(clickIOPin.PWM,clickBoardNum);
                break;
    
                case relay.Relay2:
                bBoard.clearPin(clickIOPin.CS,clickBoardNum);
                break;
            }
        
        }


         //%blockId=Relay_relayOnOff
        //%block="Turn %onOff relay %relayNum on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
        export function relayOnOff(onOff: onOff,relayNum:relay,clickBoardNum:clickBoardID)
        {
            switch(relayNum)
            {
                case relay.Relay1:
                    bBoard.writePin(onOff,clickIOPin.PWM,clickBoardNum);
                break;
    
                case relay.Relay2:
                     bBoard.writePin(onOff,clickIOPin.CS,clickBoardNum);
                break;
            }
        
        }
}