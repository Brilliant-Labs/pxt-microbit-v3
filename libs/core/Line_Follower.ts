/**
 * Custom blocks
 */
//% weight=903 color=#33BEBB  icon="\u21C8"
//% advanced=true
//% labelLineWidth=1002
namespace Line_Follower{

    export enum lineDetection
    {
        soft_right_turn = 0,
        medium_right_turn = 1,
        hard_right_turn = 2,
        hard_left_turn = 3,
        medium_left_turn = 4,
        soft_left_turn = 5,
        no_correction = 6

    }

    export enum reflection
    {
        reflected = 0,
        not_reflected =1

    }


    export enum IRsensor
    {
        U1 = 1,
        U2 = 2,
        U3 = 3,
        U4 = 4,
        U5 = 5
    }


    /**
     * Sets LineFollower Click object.
     * @param boardID the boardID
     * @param clickClot the bus number
     *  @param LineFollower the LineFollower Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Line_Follower"
    //% weight=110
    export function createLineFollower(boardID: BoardID, clickID:ClickID): LineFollower {
        return new LineFollower(boardID, clickID);
    }

    export class LineFollower extends bBoard_Control.PinSettings{
   
   
    isInitialized : Array<number>;
    private boardIDGlobalT:number
    private clickIDNumGlobal:number
    
    constructor(boardID: BoardID, clickID:ClickID){
        super(boardID, clickID);
        this.isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.boardIDGlobalT=boardID*3+clickID;
        this.clickIDNumGlobal=clickID;
    }
 


     
        initialize(deviceAddr:number)
        {
           
            this.isInitialized[this.boardIDGlobalT]  = 1

        
        }

    //%blockId=Line_Follower_lineDetection
    //%block="$this $enumName"
    //% blockGap=7
    //% advanced=false
    //% blockNamespace=Line_Follower
    //% this.shadow=variables_get
    //% this.defl="Line_Follower"
    getDirectionEnum(enumName:lineDetection)
    {
        return enumName;
    }
    
    //%blockId=Line_Follower_getWhiteDirection
    //%block="$this white line following correction"
    //% blockGap=7
    //% advanced=false
    //% blockNamespace=Line_Follower
    //% this.shadow=variables_get
    //% this.defl="Line_Follower"
    getWhiteDirection() {

    let u1_now = this.getU1();
    let u2_now = this.getU2();
    let u3_now = this.getU3();
    let u4_now = this.getU4();
    let u5_now = this.getU5();
    
    if((u5_now == 1) && (u4_now==0) && (u3_now==0) && (u2_now==0) && (u1_now==0)){
       
        return lineDetection.soft_right_turn
    }
    else if((u5_now == 1) && (u4_now == 1) && (u3_now==0) && (u2_now==0) && (u1_now==0)){

        return lineDetection.medium_right_turn
    }
    else if((u5_now == 1) && (u4_now == 1) && (u3_now==1) && (u2_now==0) && (u1_now==0)){

        return lineDetection.hard_right_turn
    }
    else if((u5_now == 1) && (u4_now==1) && (u3_now==1) && (u2_now==1) && (u1_now==0)){

        return lineDetection.hard_right_turn
    }
    else if((u5_now == 0) && (u4_now==1) && (u3_now==1) && (u2_now==1) && (u1_now==1)){

        return lineDetection.hard_left_turn
    }
    else if((u5_now == 0) && (u4_now==0) && (u3_now==1) && (u2_now==1) && (u1_now==1)){

        return lineDetection.hard_left_turn
    }
    else if((u5_now == 0) && (u4_now==0) && (u3_now==0) && (u2_now==1) && (u1_now==1)){

        return lineDetection.medium_left_turn
    }
    else if((u5_now == 0) && (u4_now==0) && (u3_now==0) && (u2_now==0) && (u1_now==1)){ 

        return lineDetection.soft_left_turn
    }
    else{

        return lineDetection.no_correction
  
    }
}

   
    //%blockId=Line_Follower_getBlackDirection
    //%block="$this black line following correction"
    //% blockGap=7
    //% advanced=false
    //% blockNamespace=Line_Follower
    //% this.shadow=variables_get
    //% this.defl="Line_Follower"
    getBlackDirection() {

        let u1_now = this.getU1();
        let u2_now = this.getU2();
        let u3_now = this.getU3();
        let u4_now = this.getU4();
        let u5_now = this.getU5();


        if((u5_now == 1) && (u4_now==0) && (u3_now==0) && (u2_now==0) && (u1_now==0)){
       
            return lineDetection.hard_left_turn
        }
        else if((u5_now == 1) && (u4_now == 1) && (u3_now==0) && (u2_now==0) && (u1_now==0)){
    
            return lineDetection.medium_left_turn
        }
        else if((u5_now == 1) && (u4_now == 1) && (u3_now==1) && (u2_now==0) && (u1_now==0)){
    
            return lineDetection.soft_left_turn
        }
        else if((u5_now == 1) && (u4_now==1) && (u3_now==1) && (u2_now==1) && (u1_now==0)){
    
            return lineDetection.soft_left_turn
        }
        else if((u5_now == 0) && (u4_now==1) && (u3_now==1) && (u2_now==1) && (u1_now==1)){
    
            return lineDetection.soft_right_turn
        }
        else if((u5_now == 0) && (u4_now==0) && (u3_now==1) && (u2_now==1) && (u1_now==1)){
    
            return lineDetection.medium_right_turn
        }
        else if((u5_now == 0) && (u4_now==0) && (u3_now==0) && (u2_now==1) && (u1_now==1)){
    
            return lineDetection.hard_right_turn
        }
        else if((u5_now == 0) && (u4_now==0) && (u3_now==0) && (u2_now==0) && (u1_now==1)){ 
    
            return lineDetection.hard_right_turn
        }
        else{
    
            return lineDetection.no_correction
      
        }
    }



getU1():number{
    
    let reflectedValue =  this.digitalReadPin(clickIOPin.RST)

    return reflectedValue
}

getU2():number{
    
    let reflectedValue =  this.digitalReadPin(clickIOPin.AN)

    return reflectedValue
}
getU3():number{
    
    let reflectedValue =  this.digitalReadPin(clickIOPin.TX)

    return reflectedValue
}
getU4():number{
    
    let reflectedValue =  this.digitalReadPin(clickIOPin.RX)

    return reflectedValue
}

 
getU5():number{
    
    let reflectedValue =  this.digitalReadPin(clickIOPin.PWM)

    return reflectedValue
}

    //%blockId=Line_Follower_isReflected
    //%block="$this Has light been reflected on $sensorNum"
    //% blockGap=7
    //% advanced=true
    //% blockNamespace=Line_Follower
    //% this.shadow=variables_get
    //% this.defl="Line_Follower"
   isReflected(sensorNum:IRsensor):boolean{
        
        let reflectedValue = 1

        switch (sensorNum)
        {
            case IRsensor.U1:
                reflectedValue = this.getU1();
            break;
        
            case IRsensor.U2:
                 reflectedValue = this.getU2();
            break;
        
            case IRsensor.U3:
                 reflectedValue = this.getU3();
            break;
        
            case IRsensor.U4:
                 reflectedValue = this.getU4();
            break;
        
            case IRsensor.U5:
                 reflectedValue = this.getU5();
            break;                                
        }
        
        if (reflectedValue == reflection.reflected)
        {
            return true;
        }

        return false;
    }

}

}


 