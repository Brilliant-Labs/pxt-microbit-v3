
enum ADKeys {
    A = 1,
    B = 2,
    C = 3,
    D = 4,
    E = 5
}
enum OnOff {
    Off = 0,
    On = 1
}
 enum tempUnits{
    //%block=Celcius
    C=0,
    //%block=Fahrenheit
    F=1
}

/**
 * Custom blocks
 */
//% color=#0fbc11 icon="\uf121"
//% weight=101
//% advanced=true
//% labelLineWidth=1009
namespace tinkercademy {
    let crashSensorPin: DigitalPin;
    /**
     Returns the value of the moisture sensor on a scale of 0 to 100.
     */
    //% blockId=octopus_moisture weight=10 blockGap=22
    //% block="value of moisture sensor at pin %p"
    export function MoistureSensor(p: AnalogPin): number {
        return pins.map(pins.analogReadPin(p), 0, 950, 0, 100);
    }
    /**
     Toggles an LED on or off.
     */
    //% blockId=octopus_led weight=100 blockGap=30
    //% block="toggle LED at pin %p | %state"
    export function LED(p: DigitalPin, state: OnOff): void {
        pins.digitalWritePin(p, state);
    }
    /**
 Checks if the specified key on the ADkeyboard is pressed.
   */
    //% blockId=octopus_adkeyboard2 weight=90 blockGap=30
    //% block="key %k | is pressed on ADKeyboard at pin %p"
    export function ADKeyboard2(k: ADKeys, p: AnalogPin): boolean {
        let a: number = pins.analogReadPin(p);
        if (a < 20 && k == 1) {
            return true;
        } else if (a >= 30 && a <= 70 && k == 2) {
            return true;
        } else if (a >= 70 && a <= 110 && k == 3) {
            return true;
        } else if (a >= 110 && a <= 150 && k == 4) {
            return true;
        } else if (a >= 150 && a <= 600 && k == 5) {
            return true;
        } else return false;
    }
    /**
   Checks whether the motion sensor is currently detecting any motion.
     */
    //% blockId=octopus_pir weight=80 blockGap=30
    //% block="motion detector at pin %p | detects motion"
    export function PIR(p: DigitalPin): boolean {
        let a: number = pins.digitalReadPin(p);
        if (a == 1) {
            return true;
        } else return false;
    }
    /**
   Checks whether the crash sensor is currently pressed.
     */
    //% blockId=octopus_crash weight=70 blockGap=30
    //% block="crash sensor pressed"
    export function crashSensor(): boolean {
        let a: number = pins.digitalReadPin(crashSensorPin);
        if (a == 0) {
            return true;
        } else return false;
    }
    /**
    IMPORTANT: Sets up the motion sensor.
     */
    //% blockId=octopus_crashsetup weight=75 blockGap=10
    //% block="Setup crash sensor at pin %p"
    export function crashSensorSetup(p: DigitalPin): void {
        crashSensorPin = p;
        pins.setPull(p, PinPullMode.PullUp)
    }

        /**
  Returns temperature from TMP36 Sensor
    */
    //% blockId=octopus_tmp36 weight=90 blockGap=30
    //% block="TMP36 temperature in $units on pin $pin"
    export function ADKeyboard(units: tempUnits,pin: AnalogPin): number {
        let analogRead: number = pins.analogReadPin(pin);
        let mv = (3300/1024) * analogRead; //3300mV divided into 1024 possible ADC values gives the mV per bit. Multiply this by the Analog reading to get the voltage in mV

        let tempC = (mv-500)/10; //500mV offset and 10mV per degree Celcius as per TMP36 datasheet
        if (units == tempUnits.C) {
            return tempC;
        } 
        else
        {
            return tempC * 9.0 / 5.0 + 32.0
        }
    }

}