/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB  icon="\u21C8"
//% advanced=true
namespace Line_Follower{
   
   
    let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  
 
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

     
        export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
        {
           
            isInitialized[clickBoardNum]  = 1

        
        }

//%blockId=Line_Follower_lineDetection
    //%block="%enumName"
    //% blockGap=7
    //% advanced=false
    export function getDirectionEnum(enumName:lineDetection)
    {
        return enumName;
    }
    
 //%blockId=Line_Follower_getWhiteDirection
    //%block="Correction required to follow white line (on click%clickBoardNum)"
    //% blockGap=7
    //% advanced=false
export function getWhiteDirection(clickBoardNum:clickBoardID) {

    let u1_now = getU1(clickBoardNum);
    let u2_now = getU2(clickBoardNum);
    let u3_now = getU3(clickBoardNum);
    let u4_now = getU4(clickBoardNum);
    let u5_now = getU5(clickBoardNum);
    
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
    //%block="Correction required to follow black line (on click%clickBoardNum)"
    //% blockGap=7
    //% advanced=false
    export function getBlackDirection(clickBoardNum:clickBoardID) {

        let u1_now = getU1(clickBoardNum);
        let u2_now = getU2(clickBoardNum);
        let u3_now = getU3(clickBoardNum);
        let u4_now = getU4(clickBoardNum);
        let u5_now = getU5(clickBoardNum);


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



function getU1(clickBoardNum:clickBoardID):number{
    
    let reflectedValue =  bBoard.digitalReadPin(clickIOPin.RST,clickBoardNum)

    return reflectedValue
}

function getU2(clickBoardNum:clickBoardID):number{
    
    let reflectedValue =  bBoard.digitalReadPin(clickIOPin.AN,clickBoardNum)

    return reflectedValue
}
function getU3(clickBoardNum:clickBoardID):number{
    
    let reflectedValue =  bBoard.digitalReadPin(clickIOPin.TX,clickBoardNum)

    return reflectedValue
}
function getU4(clickBoardNum:clickBoardID):number{
    
    let reflectedValue =  bBoard.digitalReadPin(clickIOPin.RX,clickBoardNum)

    return reflectedValue
}

 
function getU5(clickBoardNum:clickBoardID):number{
    
    let reflectedValue =  bBoard.digitalReadPin(clickIOPin.PWM,clickBoardNum)

    return reflectedValue
}

  //%blockId=Line_Follower_isReflected
    //%block="Has light been reflected on %sensorNum on click%clickBoardNum ?"
    //% blockGap=7
    //% advanced=true
   export function isReflected(sensorNum:IRsensor,clickBoardNum:clickBoardID):boolean{
        
        let reflectedValue = 1

        switch (sensorNum)
        {
            case IRsensor.U1:
                reflectedValue = getU1(clickBoardNum);
            break;
        
            case IRsensor.U2:
                 reflectedValue = getU2(clickBoardNum);
            break;
        
            case IRsensor.U3:
                 reflectedValue = getU3(clickBoardNum);
            break;
        
            case IRsensor.U4:
                 reflectedValue = getU4(clickBoardNum);
            break;
        
            case IRsensor.U5:
                 reflectedValue = getU5(clickBoardNum);
            break;                                
        }
        
        if (reflectedValue == reflection.reflected)
        {
            return true;
        }

        return false;
    }

}


 