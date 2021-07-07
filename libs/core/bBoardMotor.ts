//% weight=100 
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
   * Allows you to disable and enable the motor driver on the b.Board
   */
  //% block="motor driver %enable"
  //% weight=100
  //% advanced=true
  export function  motorEnable(enable: motorState): void {
      // bBoard_Control.sendData(clickPin: clickIOPin,moduleID:number,functionID:number, data: number[], )

      let data = [enable]
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.enableMotor, data, null, 0)
  }

  /**
   * motor set duty
   */
  //% blockId=bBoard_Motor_motorLeftTimed
  //% block="set left motor speed to$duty \\% for$waitTime (ms)"
  //% duty.min=-100 duty.max=100
  //% duty.shadow="speedPicker"
  //% waitTime.defl=1000
  export function  motorLeftTimed( duty: number,waitTime:number): void {
      //motor_Driver, direction, duty

      let data = [motorDriver.left, duty>=0 ? motorDirection.forward:motorDirection.backward, Math.abs(duty)]
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
      basic.pause(waitTime)
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.left,0], null, 0)
  }

    /**
   * motor set duty
   */
    //% blockId=bBoard_Motor_motorRightTimed
  //% block="set right motor speed to$duty \\% for$waitTime (ms)"
  //% duty.min=-100 duty.max=100
  //% duty.shadow="speedPicker"
    //% waitTime.defl=1000
  export function  motorRightTimed( duty: number,waitTime:number): void {
    //motor_Driver, direction, duty

    let data = [motorDriver.right, duty>=0 ? motorDirection.forward:motorDirection.backward, Math.abs(duty)]
    bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
    basic.pause(waitTime)
    bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.right,0], null, 0)
}
  /**
   * motor set duty
   */
  //% block="set left motor speed to$duty \\%"
  //% duty.min=-100 duty.max=100
  //% duty.shadow="speedPicker"
  //% advanced=true
  export function  motorLeftDuty( duty: number): void {
    //motor_Driver, direction, duty

    let data = [motorDriver.left, duty>=0 ? motorDirection.forward:motorDirection.backward, Math.abs(duty)]
    bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)

}

  /**
 * motor set duty
 */
//% block="set right motor speed to$duty \\%"
//% duty.min=-100 duty.max=100
//% duty.shadow="speedPicker"
//% advanced=true
export function  motorRightDuty( duty: number): void {
  //motor_Driver, direction, duty

  let data = [motorDriver.right, duty>=0 ? motorDirection.forward:motorDirection.backward, Math.abs(duty)]
  bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)

}

}
