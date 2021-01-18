//**
 //* Provides access to basic micro:bit functionality.
 //*/
//% color=#33BEBB weight=601 icon="\uf00a"
//% advanced=true
  //% labelLineWidth=1002
  namespace Force{


    /**
     * Sets Force Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     *  @param Force the Force Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Force"
     //% weight=110
    export function createForceSettings(boardID:BoardID, clickID:ClickID): Force {
        return new Force(boardID, clickID);
   }
 
    export class Force extends bBoard_Control.PinSettings{
       A : number;
       sumA : number;
       Force_voltage : number;
       Force_val : number;
       rangefactor : number;
       Vadc_3 : number;       
       private boardIDGlobal:number;
       private clickIDNumGlobal:number; 
    
       constructor(boardID: BoardID, clickID:ClickID){
       super(boardID, clickID);
       this.A=0;
       this.sumA=0;
       this.Force_voltage=0;
       this.Force_val=0;
       this.rangefactor=20/3.3
       this.Vadc_3=3.3/4096;
       this.boardIDGlobal=boardID;
       this.clickIDNumGlobal = clickID; 
       }

  
        /**
         * Measures force and returns value. 0.2 - 20N
         */
        //% help=Force/Force/forceclickstring
        //% block="$this force"
        //% blockId=force
        //% blockNamespace=Force
        //% this.shadow=variables_get
        //% this.defl="Force"
        //% weight=90 blockGap=12 color=#9E4894 icon=""

        forceclick() : number{
        for (let i=1;i<=20;i++)
        {
            this.A=(this.analogRead(clickADCPin.AN,this.boardIDGlobal, this.clickIDNumGlobal))
            this.sumA+=this.A;
        }
        this.sumA=this.sumA/20;
        this.Force_voltage=this.sumA*this.Vadc_3; //Voltage for the force click board
        this.Force_val=this.Force_voltage*this.rangefactor;
        return this.Force_val
        }

     
   }
 
 }