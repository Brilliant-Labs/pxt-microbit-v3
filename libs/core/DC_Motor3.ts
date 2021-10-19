



//% weight=100 color=#EF697B icon=""
//% advanced=true

namespace DC_Motor3 {

//Motor Click
let IN1 = clickIOPin.AN
let IN2 = clickIOPin.RST
let  SLP = clickIOPin.CS
let  PWM = clickIOPin.PWM


export enum MotorDirection {
    //% block="Forward"
    Forward,
    //% block="Reverse"
    Reverse
}
let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];


function initialize(clickBoardNum:clickBoardID)
{
    motorRotation(MotorDirection.Forward,clickBoardNum)
    isInitialized[clickBoardNum]  = 1

}

    //------------------------Motor Click---------------------------------



    export function motorSpeed(Speed: number,clickBoardNum: clickBoardID): void {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(clickBoardNum)
            
        }

        if (Speed > 100) {
            Speed = 100;
        }
        if (Speed < 0) {
            Speed = 0;
        }
        bBoard.PWMOut(clickPWMPin.PWM,Speed,clickBoardNum);
       
    }

    //% blockId=Motor_speedDirection
    //% block="Set speed to %speed with direction%direction on click%clickBoardNum"
    //% Speed.min=0 Speed.max=100
    //% advanced=false
    //% speed.min=0 speed.max=100

    export function motorSpeedDirection(speed: number,direction: MotorDirection,clickBoardNum: clickBoardID): void {
        if(isInitialized[clickBoardNum] == 0)
        {
            initialize(clickBoardNum)
            
        }

        motorRotation(direction,clickBoardNum);
        motorSpeed(speed,clickBoardNum)
      
       
    }



    export function motorRotation(direction: MotorDirection, clickBoardNum: clickBoardID): void {
        switch (direction) {

            
            case MotorDirection.Forward:
            bBoard.writePin(1,IN1,clickBoardNum);
            bBoard.writePin(0,IN2,clickBoardNum);
        
                break;

            case MotorDirection.Reverse:
            
            bBoard.writePin(0,IN1,clickBoardNum);
            bBoard.writePin(1,IN2,clickBoardNum);
                break;
        }
    }

  

}