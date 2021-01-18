/**
 * Custom blocks
 */
//% weight=907 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Water_Detect {


    /**
     * Sets Water_Detect Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Water_Detect the Water_Detect Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Water_Detect"
    //% weight=110
    export function createWaterDetect(boardID: BoardID, clickID:ClickID): Water_Detect {
        return new Water_Detect(boardID, clickID);
   }

    export class Water_Detect extends bBoard_Control.PinSettings{

    private boardIDGlobal:number
    private clickIDNumGlobal:number 
    
    constructor(boardID: BoardID, clickID:ClickID){
        super(boardID, clickID);
        this.boardIDGlobal=boardID
        this.clickIDNumGlobal=clickID
    }

    //% blockId=Water_Detect_isWater
    //% block="$this Is water detected"
    //% weight=100
    //% blockGap=7
    //% blockNamespace=Water_Detect
    //% this.shadow=variables_get
    //% this.defl="Water_Detect"
    isWater(): number {
           if(this.digitalReadPin(clickIOPin.INT) == 1)
           {
               return 1;
           }
           else{
               return 0;
           }
    }

    //% blockId=Water_Detect_isWater1
    //% block="$this Is water detected"
    //% weight=100
    //% blockGap=7
    //% blockNamespace=Water_Detect
    //% this.shadow=variables_get
    //% this.defl="Water_Detect"
    isWater1(): boolean {
        if(this.digitalReadPin(clickIOPin.INT) == 1)
        {
            return true;
        }
        else{
            return false;
        }
 }


  }
}