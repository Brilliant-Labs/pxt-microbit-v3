//------------------------- Device Ultrasonic_Sensor -----------------------------------
//% weight=100 color=#0fbc11 icon="↔"
//% advanced=true
//% labelLineWidth=1009
namespace Ultrasonic_Sensor {
    export enum DistUnits {
        //% block="cm"
        cm = 0,
        //% block="in"
        in = 1
    }
    /**
     * Sets Ultrasonic_Sensor object.
     * @param portTriger the portID
     * @param portEcho the portEcho
     * @param Ultrasonic_Sensor the Ultrasonic_Sensor Object
     */
    //% block="$portTriger triger $portEcho echo"
    //% block.loc.fr="$portTriger triger $portEcho echo"
    //% advanced=false
    //% blockSetVariable="Ultrasonic_Sensor"
    //% weight=110

    export function createUltrasonic_Sensor(portTriger: DigitalPin , portEcho: DigitalPin): Ultrasonic_Sensor {
        return new Ultrasonic_Sensor(portTriger, portEcho);
    }
    export class Ultrasonic_Sensor {
        private myPortTriger: DigitalPin
        private myPortEcho: DigitalPin

        constructor(portTriger: DigitalPin, portEcho: DigitalPin ) {
            this.myPortTriger = portTriger;
            this.myPortEcho = portEcho;
        }

        //% blockId=Ultrasonic_Sensor_getDistance
        //% block="$this get distance in $units"
        //% block.loc.fr="$this obtenir la distance en $units"
        //% advanced=false
        //% blockNamespace=Ultrasonic_Sensor
        //% this.defl="Ultrasonic_Sensor"
        getDistance(units: Ultrasonic_Sensor.DistUnits): number {
            pins.digitalWritePin(this.myPortTriger, 1)
            basic.pause(10)
            pins.digitalWritePin(this.myPortTriger, 0)
            let duration = pins.pulseIn(this.myPortEcho, PulseValue.High)
            // Distance is in CM
            let distance_cm = duration / 2 / 29.1
            let distance_in = duration / 2 / 29.1 / 2.54
            return units == DistUnits.cm ? distance_cm : distance_in
        }

        //% blockId=Ultrasonic_Sensor_getValue
        //% block="$this get value"
        //% block.loc.fr="$this obtenir la valeur"
        //% advanced=true
        //% blockNamespace=Ultrasonic_Sensor
        //% this.defl="Ultrasonic_Sensor"
        getValue(): number {
            pins.digitalWritePin(this.myPortTriger, 1)
            basic.pause(10)
            pins.digitalWritePin(this.myPortTriger, 0)
            let duration = pins.pulseIn(this.myPortEcho, PulseValue.High)
            return duration
        }
    }
}