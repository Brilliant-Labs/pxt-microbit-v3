
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% advanced=true
namespace Reed{


    
    
    enum reed{
        Activated = 1,
        Not_Activated = 0,
     
    
    
    }
    
    
    
       //%blockId=Reed_isActivated
        //%block="Has reed been activated on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=false
    export function isActivated(clickBoardNum:clickBoardID):boolean
    {
       if(bBoard.digitalReadPin(clickIOPin.CS,clickBoardNum) == reed.Activated)
       {
        return true
       }
       return false;
    
    }
}