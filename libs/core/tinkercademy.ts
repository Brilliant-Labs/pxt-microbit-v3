
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
enum tempUnits {
    //%block=Celcius
    C = 0,
    //%block=Fahrenheit
    F = 1
}
 enum DHT11Type {
    //% block="temperature(℃)" enumval=0
    DHT11_temperature_C,

    //% block="temperature(℉)" enumval=1
    DHT11_temperature_F,

    //% block="humidity(0~100)" enumval=2
    DHT11_humidity,
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
    export function ADKeyboard(units: tempUnits, pin: AnalogPin): number {
        let analogRead: number = pins.analogReadPin(pin);
        let mv = (3300 / 1024) * analogRead; //3300mV divided into 1024 possible ADC values gives the mV per bit. Multiply this by the Analog reading to get the voltage in mV

        let tempC = (mv - 500) / 10; //500mV offset and 10mV per degree Celcius as per TMP36 datasheet
        if (units == tempUnits.C) {
            return tempC;
        }
        else {
            return tempC * 9.0 / 5.0 + 32.0
        }
    }


    /**
 * get dht11 temperature and humidity Value
 * @param dht11pin describe parameter here, eg: AnalogPin.P0    */
    //% advanced=false
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function dht11value(dht11type: DHT11Type, dht11Apin: AnalogPin): number {

        //initialize
        basic.pause(1100)
        let _temperature: number = -999.0
        let _humidity: number = -999.0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)
        let dht11pin = parseFloat(dht11Apin.toString())
        pins.setPull(dht11pin, PinPullMode.PullUp)
        pins.digitalWritePin(dht11pin, 0) //begin protocol, pull down pin
        basic.pause(18)
        pins.digitalReadPin(dht11pin) //pull up pin
        control.waitMicros(40)
        while (pins.digitalReadPin(dht11pin) == 0); //sensor response
        while (pins.digitalReadPin(dht11pin) == 1); //sensor response

        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dht11pin) == 1);
            while (pins.digitalReadPin(dht11pin) == 0);
            control.waitMicros(28)
            //if sensor still pull up data pin after 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dht11pin) == 1) dataArray[index] = true
        }
        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)
        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        switch (dht11type) {
            case DHT11Type.DHT11_temperature_C:
                _temperature = resultArray[2] + resultArray[3] / 100
                return _temperature
            case DHT11Type.DHT11_temperature_F:
                _temperature = resultArray[2] + resultArray[3] / 100 * 33.8
                return _temperature
            case DHT11Type.DHT11_humidity:
                _humidity = resultArray[0] + resultArray[1] / 100
                return _humidity
        }
        return 0
    }


}