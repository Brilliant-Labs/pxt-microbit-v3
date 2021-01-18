//% weight=801 
//% color=#9E4894 
//% icon=""
//% advanced=true
//% labelLineWidth=1001
namespace bBoard_Motor {

  enum functionID {
    // FunctionIds
    enableMotor = 1,
    setMotor = 2
  }
  export enum motorState {
    enabled = 1,
    disabled = 0
    
  }
  export enum motorDirection {
    forward = 1,
    backward = 2,
    brake = 0
  }
  export enum motorDriver {
    left = 1,
    right = 2
  }

  /**
  * Sets Motor Left object.
  */
  //% block="left motor driver $enabled"
  //% blockSetVariable="bBoard_Motor_Left"
  //% weight=101
  //% group="Initialization"

  export function createMotorLeft(enabled:motorState): BBOARD_MOTOR {
    let handle = new BBOARD_MOTOR(BoardID.zero, ClickID.Zero, motorDriver.left);
    handle.motorEnable(enabled)
    return handle
  }



  /**
  * Sets Motor Right object.
  */
  //% block="right motor driver $enabled"
  //% blockSetVariable="bBoard_Motor_Right"
  //% weight=100
  //% group="Initialization"

  export function createMotorRight(enabled:motorState): BBOARD_MOTOR {
    let handle = new BBOARD_MOTOR(BoardID.zero, ClickID.Zero, motorDriver.right);
    handle.motorEnable(enabled)
    return handle
  }

  
  /**
  * Sets Motor object.
  */
  //% block="$motorDriver $enabled on $boardID $clickID"
  //% blockSetVariable="bBoard_Motor_1"
  //% weight=100
  //% advanced=true
  //% group="Initialization"

  export function createMotor(motorDriver:motorDriver, boardID:BoardID,clickID:ClickID,enabled:motorState): BBOARD_MOTOR {
    let handle = new BBOARD_MOTOR(boardID, clickID, motorDriver);
    handle.motorEnable(enabled)
    return handle
  }


    //  /**
    //  * Sets Motor object.
    //  * @param boardID the board
    //  * @param clickID the bus
    //  * @param motor the motor Object
    //  */
    // //% block=" $boardID $clickID motor $motor_DriverS"
    // //% blockSetVariable="MotorL"
    //    //% clickID.defl=ClickID.Zero
    // //% weight=110
    // export function createMotor(boardID: BoardID,clickID:ClickID, motor_DriverS:motorDriver): BBOARD_MOTOR {
    //   return new BBOARD_MOTOR(boardID, clickID, motor_DriverS);
    // }

  export class BBOARD_MOTOR extends bBoard_Control.PWMSettings {
    //Motor Click
    private duty: number
    private direction: number
    private motor_Driver: motorDriver
    private boardIDGlobal: number
    private clickIDGlobal: number
    private PeripheralObject: bBoard_Control.peripheralSettings

    constructor(boardID: BoardID, clickID: ClickID, motor_DriverLocal: motorDriver) {
      super(boardID, clickID);
      this.duty = 50
      this.direction = motorDirection.forward
      this.boardIDGlobal = boardID;
      this.clickIDGlobal = clickID;
      this.motor_Driver = motor_DriverLocal;
      this.PeripheralObject = new bBoard_Control.peripheralSettings(boardID, clickID);
      this.motorEnable(bBoard_Motor.motorState.enabled);
    }
    get dutyVal() {
      return this.duty
    }
    set dutyVal(value) {
      this.duty = value
    }
    get directionVal() {
      return this.direction
    }
    set directionVal(value) {
      this.direction = value
    }

    /**
    * enable Motor (select left or right) .
    */

    //% blockId=Motor_enable
    //% block="$this motor %enabled"
    //% advanced=false
    //% blockNamespace=bBoard_Motor
    //% this.defl="bBoard_Motor_Left"
    //% parts="bBoardMotor"
    //% weight=98
    //% group="Actions"
  


    motorEnable(enabled: bBoard_Motor.motorState): void {
      let data = [enabled]
      this.PeripheralObject.sendData(0xFFFF, moduleIDs.MOTOR_module_id, functionID.enableMotor, data)
    }

    //% blockId=Motor_powerDirection
    //% block="$this set power to %duty with direction%direction"
    //% advanced=false
    //% power.min=0 power.max=100
    //% blockNamespace=bBoard_Motor
    //% this.defl="bBoard_Motor_Left"
    //% parts="bBoardMotor"
    //% weight=97
    //% group="Actions"

    motorPowerDirection(power: number, direction: bBoard_Motor.motorDirection): void {
      let data = [this.motor_Driver, direction, power]
      this.PeripheralObject.sendData(0, moduleIDs.MOTOR_module_id, functionID.setMotor, data)
    }

    //% blockId=Motor_dutyDirection
    //% block="$this set duty cycle to %duty with direction%direction"
    //% advanced=true
    //% duty.min=0 duty.max=100
    //% blockNamespace=bBoard_Motor
    //% this.defl="bBoard_Motor_Left"
    //% parts="bBoardMotor"
    //% weight=96
    //% labelLineWidth=1001
    //% group="Actions"

    motorDutyDirection(duty: number, direction: bBoard_Motor.motorDirection): void {
      console.log("set duty")
      let data = [this.motor_Driver, direction, duty]
      this.PeripheralObject.sendData(0, moduleIDs.MOTOR_module_id, functionID.setMotor, data)
    }
  }
}