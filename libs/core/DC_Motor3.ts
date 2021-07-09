//------------------------- Click DC Motor 3 -----------------------------------
//% weight=100 color=#FF2F92 icon=""
//% advanced=true
//% labelLineWidth=1005
namespace DC_Motor3 {

    /**
     * Sets DCMotor3 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param DCMotor3 the DCMotor3 Object
    */


    //Motor Click
    let IN1 = clickIOPin.AN
    let IN2 = clickIOPin.RST
    let SLP = clickIOPin.CS
    let PWM = clickIOPin.PWM

    export enum MotorDirection {
        //% block="Forward"
        Forward,
        //% block="Reverse"
        Reverse
    }

    //% block=" $boardID $clickID"
    //% blockSetVariable="DCMotor3"
    //% weight=110
    export function createDCMotor3(boardID: BoardID, clickID: ClickID): DCMotor3 {
        return new DCMotor3(boardID, clickID);
    }


    export class DCMotor3 {

        private myBoardID: BoardID
        private myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
            this.initialize()
        }

        initialize() {
            this.motorRotation(MotorDirection.Forward)
        }

        //------------------------Motor Click---------------------------------
        motorSpeed(Speed: number): void {
            if (Speed > 100) {
                Speed = 100;
            }
            if (Speed < 0) {
                Speed = 0;
            }
            bBoard_Control.PWMFrequency(clickPWMPin.PWM, Speed, this.myBoardID, this.myClickID);
        }

        //% blockId=Motor_speedDirection
        //% block="$this set speed to %speed with direction%direction"
        //% Speed.min=0 Speed.max=100
        //% advanced=false
        //% speed.min=0 speed.max=100
        motorSpeedDirection(speed: number, direction: MotorDirection): void {
            this.motorRotation(direction);
            this.motorSpeed(speed)
        }

        motorRotation(direction: MotorDirection): void {
            switch (direction) {
                case MotorDirection.Forward:
                    bBoard_Control.writePin(1, IN1, this.myBoardID, this.myClickID);
                    bBoard_Control.writePin(0, IN2, this.myBoardID, this.myClickID);
                    break;
                case MotorDirection.Reverse:
                    bBoard_Control.writePin(0, IN1, this.myBoardID, this.myClickID);
                    bBoard_Control.writePin(1, IN2, this.myBoardID, this.myClickID);
                    break;
            }
        }
    }
}