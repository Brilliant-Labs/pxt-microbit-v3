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
    //% block.loc.fr="pilote de moteur %enable"
    //% weight=100
    //% advanced=true
    export function motorEnable(enable: motorState): void {
        // bBoard_Control.sendData(clickPin: clickIOPin,moduleID:number,functionID:number, data: number[], )

        let data = [enable]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.enableMotor, data, null, 0)
    }

    /**
     * Set left motor to a speed for an amount of time
     * @param waitTime how long to move motor for, eg: 100, 200, 500, 1000, 2000
     */
    //% blockId=bBoard_Motor_motorLeftTimed
    //% block="set left motor speed to$duty \\% for$waitTime (ms)"
    //% block.loc.fr="réglez la vitesse du moteur gauche à$duty \\% for$waitTime (ms)"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% waitTime.shadow="timePicker"
    //% waitTime.defl=1000
    //% weight=112
    export function motorLeftTimed(duty: number, waitTime: number): void {
        //motor_Driver, direction, duty

        let data = [motorDriver.left, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
        control.runInBackground(() => motorLeftTimedDelay(waitTime))
    }

    function motorLeftTimedDelay(waitTime: number) {
        basic.pause(waitTime)
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.left, 0], null, 0)
    }

    /**
     * Set right motor to a speed for an amount of time
     * @param waitTime how long to move motor for, eg: 100, 200, 500, 1000, 2000
     */
    //% blockId=bBoard_Motor_motorRightTimed
    //% block="set right motor speed to$duty \\% for$waitTime (ms)"
    //% block.loc.fr="réglez la vitesse du moteur droit xxx à$duty \\% for$waitTime (ms)"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% waitTime.shadow="timePicker"
    //% waitTime.defl=1000
    //% weight=111
    export function motorRightTimed(duty: number, waitTime: number): void {
        //motor_Driver, direction, duty

        let data = [motorDriver.right, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
        control.runInBackground(() => motorRightTimedDelay(waitTime))
    }

    function motorRightTimedDelay(waitTime: number) {
        basic.pause(waitTime)
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.right, 0], null, 0)
    }

    /**
     * Set motor to a speed for an amount of time
     * @param waitTime how long to move motor for, eg: 100, 200, 500, 1000, 2000
     */
    //% blockId=bBoard_Motor_motorTimed
    //% block="set both motors speed to$duty \\% for$waitTime (ms)"
    //% block.loc.fr="réglez la vitesse des deux moteurs sur$duty \\% for$waitTime (ms)"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% waitTime.shadow="timePicker"
    //% waitTime.defl=1000
    //% weight=110
    export function motorTimed(duty: number, waitTime: number): void {
        let data = [motorDriver.right, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
        data = [motorDriver.left, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
        control.runInBackground(() => motorTimedDelay(waitTime))
    }

    function motorTimedDelay(waitTime: number) {
        basic.pause(waitTime)
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.left, 0], null, 0)
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, [motorDriver.right, 0], null, 0)
    }

    /**
     * motor set duty
     */
    //% block="set left motor speed to$duty \\%"
    //% block.loc.fr="églez la vitesse du moteur gauche à$duty \\%"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% advanced=false
    //% weight=102
    export function motorLeftDuty(duty: number): void {
        //motor_Driver, direction, duty

        let data = [motorDriver.left, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)

    }

    /**
   * motor set duty
   */
    //% block="set right motor speed to$duty \\%"
    //% block.loc.fr="réglez la vitesse du moteur droit à$duty \\%"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% advanced=false
    //% weight=101
    export function motorRightDuty(duty: number): void {
        //motor_Driver, direction, duty

        let data = [motorDriver.right, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)

    }

    /**
   * motor set duty
   */
    //% block="set both motors speed to$duty \\%"
    //% block.loc.fr="réglez la vitesse des deux moteurs à$duty \\%"
    //% duty.min=-100 duty.max=100
    //% duty.shadow="speedPicker"
    //% advanced=false
    //% weight=100
    export function motorDuty(duty: number): void {
        //motor_Driver, direction, duty

        let data = [motorDriver.right, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)
        data = [motorDriver.left, duty >= 0 ? motorDirection.forward : motorDirection.backward, Math.abs(duty)]
        bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.PWM, moduleIDs.MOTOR_module_id, functionID.setMotor, data, null, 0)

    }


}
