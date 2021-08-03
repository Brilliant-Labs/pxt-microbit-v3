//------------------------- Click Board Weather -----------------------------------
//% weight=100 color=#33BEBB icon="\uf185" block="Weather"
//% advanced=true
//% labelLineWidth=1002
namespace Weather {
    export enum Weather_T {
        //% block="C"
        T_C = 0,
        //% block="F"
        T_F = 1
    }
    export enum Weather_P {
        //% block="Pa"
        Pa = 0,
        //% block="hPa"
        hPa = 1,
        //% block="kPa"
        kPa = 2,
        //% block="mmHg"
        mmHg = 3,
        //% block="psi"
        psi = 4
    }
    enum below_above {
        //% block="<="
        below = 0,
        //% block=">="
        above = 1
    }
    export enum PowerSettings {
        On = 1,
        Off = 0
    }

    /**
     * Sets Weather object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Weather the Weather Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Weather"
    //% blockId=createWeather
    //% weight=110
    export function createWeather(boardID: BoardID, clickID: ClickID): Weather {
        let obj = new Weather(boardID, clickID);
        return obj
    }

    export class Weather {
        private readonly Weather_I2C_Addr = 0x76;
        private dig_T1: number;
        private dig_T2: number;
        private dig_T3: number;
        private dig_P1: number;
        private dig_P2: number;
        private dig_P3: number;
        private dig_P4: number;
        private dig_P5: number;
        private dig_P6: number;
        private dig_P7: number;
        private dig_P8: number;
        private dig_P9: number;
        private dig_H1: number;
        private dig_H2: number;
        private dig_H3: number;
        private a: number;
        private dig_H4: number;
        private dig_H5: number;
        private dig_H6: number;

        private readonly ADC_ADDR = 0xF7

        private T:number = 0
        private P:number = 0
        private H:number = 0

        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
            this.weather_Initialize()
        }

        weather_Initialize() {
            this.myI2CAddress = this.Weather_I2C_Addr

            //config
            this.setreg(0xF2, 0x04)
            this.setreg(0xF5, 0x0C)
            this.setreg(0xF4, 0x2F)

            this.dig_T1 = this.getUInt16LE(0x88);
            this.dig_T2 = this.getInt16LE(0x8A);
            this.dig_T3 = this.getInt16LE(0x8C);
            this.dig_P1 = this.getUInt16LE(0x8E);
            this.dig_P2 = this.getInt16LE(0x90);
            this.dig_P3 = this.getInt16LE(0x92);
            this.dig_P4 = this.getInt16LE(0x94);
            this.dig_P5 = this.getInt16LE(0x96);
            this.dig_P6 = this.getInt16LE(0x98);
            this.dig_P7 = this.getInt16LE(0x9A);
            this.dig_P8 = this.getInt16LE(0x9C);
            this.dig_P9 = this.getInt16LE(0x9E);
            this.dig_H1 = this.getreg(0xA1);
            this.dig_H2 = this.getInt16LE(0xE1);
            this.dig_H3 = this.getreg(0xE3);
            this.a = this.getreg(0xE5);
            this.dig_H4 = (this.getreg(0xE4) << 4) + (this.a % 16);
            this.dig_H5 = (this.getreg(0xE6) << 4) + (this.a >> 4);
            this.dig_H6 = this.getInt8LE(0xE7);
        }

        setreg(register: number, value: number): void {
            let i2cBuffer = pins.createBuffer(2)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value)
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress,i2cBuffer,this.myBoardID,this.myClickID)
        }

        getreg(reg: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg, NumberFormat.UInt8BE, true, this.myBoardID, this.myClickID);
            // let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, pins.sizeOf(NumberFormat.UInt8BE), this.myBoardID, this.myClickID)
            let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID)
            return bufr.getNumber(NumberFormat.UInt8BE, 0);
        }

        getInt8LE(reg: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg, NumberFormat.UInt8BE, true, this.myBoardID, this.myClickID);
            // let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, pins.sizeOf(NumberFormat.UInt8LE), this.myBoardID, this.myClickID)
            let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 1, this.myBoardID, this.myClickID)
            return bufr.getNumber(NumberFormat.UInt8LE, 0);
        }

        getUInt16LE(reg: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg, NumberFormat.UInt8BE, true, this.myBoardID, this.myClickID);
            // let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, pins.sizeOf(NumberFormat.UInt16LE), this.myBoardID, this.myClickID)
            let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 2, this.myBoardID, this.myClickID)
            return bufr.getNumber(NumberFormat.UInt16LE, 0);
        }

        getInt16LE(reg: number): number {
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, reg, NumberFormat.UInt8BE, true, this.myBoardID, this.myClickID);
            // let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, pins.sizeOf(NumberFormat.Int16LE), this.myBoardID, this.myClickID)
            let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 2, this.myBoardID, this.myClickID)
            return bufr.getNumber(NumberFormat.Int16LE, 0);
        }

        getData(): void {

            bBoard_Control.i2cWriteNumber(this.myI2CAddress, this.ADC_ADDR, NumberFormat.UInt8BE, true, this.myBoardID, this.myClickID);
            let bufr = bBoard_Control.I2CreadNoMem(this.myI2CAddress, 8, this.myBoardID, this.myClickID)
            let adc_P = (bufr.getUint8(0) << 12) + (bufr.getUint8(1) << 4) + (bufr.getUint8(2) >> 4)
            let adc_T = (bufr.getUint8(3) << 12) + (bufr.getUint8(4) << 4) + (bufr.getUint8(5) >> 4)
            let adc_H = (bufr.getUint8(6) << 8) + (bufr.getUint8(7))

            let var1 = (((adc_T >> 3) - (this.dig_T1 << 1)) * this.dig_T2) >> 11
            let var2 = (((((adc_T >> 4) - this.dig_T1) * ((adc_T >> 4) - this.dig_T1)) >> 12) * this.dig_T3) >> 14
            this.T = (var1 + var2) / 5120

            var1 = (this.T >> 1) - 64000
            var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * this.dig_P6
            var2 = var2 + ((var1 * this.dig_P5) << 1)
            var2 = (var2 >> 2) + (this.dig_P4 << 16)
            var1 = (((this.dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((this.dig_P2) * var1) >> 1)) >> 18
            var1 = ((32768 + var1) * this.dig_P1) >> 15
            if (var1 == 0)
                this.P = 0; // avoid exception caused by division by zero
            else {
                let var_P = ((1048576 - adc_P) - (var2 >> 12)) * 3125
                var_P = Math.idiv(var_P, var1) * 2;
                var1 = (this.dig_P9 * (((var_P >> 3) * (var_P >> 3)) >> 13)) >> 12
                var2 = (((var_P >> 2)) * this.dig_P8) >> 13
                this.P = var_P + ((var1 + var2 + this.dig_P7) >> 4)
            }

            let var_H = (this.T - 76800)
            var_H = (adc_H - ((this.dig_H4) * 64 + (this.dig_H5) / 16384 * var_H)) * ((this.dig_H2) / 65536 * (1 + (this.dig_H6) / 67108864 * var_H * (1 + (this.dig_H3) / 67108864 * var_H)));
            var_H = var_H * (1 - (this.dig_H1) * var_H / 524288);
            if (var_H > 100.0)
                var_H = 100.0;
            else if (var_H < 0.0)
                var_H = 0.0;
            this.H = var_H
        }

        // get(): void {
        //     //TODO: Read T,P and H
        //     let adc_T = (this.getreg(this.ADC_T1) << 12) + (this.getreg(this.ADC_T2) << 4) + (this.getreg(this.ADC_T3) >> 4)
        //     let var1 = (((adc_T >> 3) - (this.dig_T1 << 1)) * this.dig_T2) >> 11
        //     let var2 = (((((adc_T >> 4) - this.dig_T1) * ((adc_T >> 4) - this.dig_T1)) >> 12) * this.dig_T3) >> 14
        //     let t = var1 + var2
        //     this.T = Math.idiv((t * 5 + 128) >> 8, 100)
        //     var1 = (t >> 1) - 64000
        //     var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * this.dig_P6
        //     var2 = var2 + ((var1 * this.dig_P5) << 1)
        //     var2 = (var2 >> 2) + (this.dig_P4 << 16)
        //     var1 = (((this.dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((this.dig_P2) * var1) >> 1)) >> 18
        //     var1 = ((32768 + var1) * this.dig_P1) >> 15
        //     if (var1 == 0)
        //         return; // avoid exception caused by division by zero
        //     let adc_P = (this.getreg(this.ADC_P1) << 12) + (this.getreg(this.ADC_P2) << 4) + (this.getreg(this.ADC_P3) >> 4)
        //     let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
        //     _p = Math.idiv(_p, var1) * 2;
        //     var1 = (this.dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
        //     var2 = (((_p >> 2)) * this.dig_P8) >> 13
        //     this.P = _p + ((var1 + var2 + this.dig_P7) >> 4)
        //     let adc_H = (this.getreg(this.ADC_H1) << 8) + this.getreg(this.ADC_H2)
        //     var1 = t - 76800
        //     var2 = (((adc_H << 14) - (this.dig_H4 << 20) - (this.dig_H5 * var1)) + 16384) >> 15
        //     var1 = var2 * (((((((var1 * this.dig_H6) >> 10) * (((var1 * this.dig_H3) >> 11) + 32768)) >> 10) + 2097152) * this.dig_H2 + 8192) >> 14)
        //     var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * this.dig_H1) >> 4)
        //     if (var2 < 0) var2 = 0
        //     if (var2 > 419430400) var2 = 419430400
        //     this.H = (var2 >> 12) >> 10
        // }

        /**
         * get humidity
         */
        //% blockId="Weather_GET_Humidity" 
        //% block="$this humidity"
        //% block.loc.fr="$this humidité"
        //% weight=80 blockGap=8
        //% group="Humidity"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        humidity(): number {
            this.getData();
            return Math.roundWithPrecision(this.H, 2);
        }

        /**
        * get pressure
        */
        //% blockId="Weather_GET_Pressure" 
        //% block="$this pressure $u"
        //% block.loc.fr="$this pression $u"
        //% weight=80 blockGap=8
        //% group="Pressure"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        pressure(u: Weather_P): number {
            this.getData();
            if (u == Weather_P.Pa) return Math.roundWithPrecision(this.P, 2);
            else if (u == Weather_P.hPa) return Math.idiv(this.P, 100)
            else if (u == Weather_P.mmHg) return Math.roundWithPrecision(this.P * 0.00750062, 2)
            else if (u == Weather_P.psi) return Math.roundWithPrecision(this.P * 0.000145038, 2)
            else return Math.idiv(this.P, 1000)
        }

        // PressureBelowAbove(u: below_above, dat: number): boolean {
        //     //control.inBackground(function () {
        //     //while (true) {
        //     let retval = false
        //     this.get()
        //     if (u == below_above.below) {
        //         if (this.P < dat) {
        //             //body()
        //             retval = true
        //         }
        //     }
        //     if (u == below_above.above) {
        //         if (this.P > dat) {
        //             //body()
        //             retval = true
        //         }
        //     }
        //     //basic.pause(1000)
        //     return retval
        //     //}
        //     //})
        // }

        /**
         * get temperature
         */
        //% blockId="Weather_GET_Temperature" 
        //% block="$this temperature $u"
        //% block.loc.fr="$this température $u"
        //% weight=80 blockGap=8
        //% group="Temperature"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        temperature(u: Weather_T): number {
            this.getData();
            if (u == Weather_T.T_C) return Math.roundWithPrecision(this.T, 2);
            else return Math.roundWithPrecision(this.T * 9.0 / 5.0 + 32.0, 2);
        }

        /**
         * power on
         */
        //% blockId="Weather_POWER_ON" 
        //% block="$this Power $power"
        //% block.loc.fr="$this Courant $power"
        //% weight=22 blockGap=8
        //% group="Power"
        //% advanced=true
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        Power(power: PowerSettings) {
            power == PowerSettings.On ? this.setreg(0xF4, 0x2F) : this.setreg(0xF4, 0)
        }

        /**
         * Calculate Dewpoint
         */
        //% block="$this Dewpoint $u""
        //% block.loc.fr="$this Point de rosée $u"
        //% weight=60 blockGap=8
        //% group="Dewpoint"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        Dewpoint(u: Weather_T): number {
            this.getData();
            let dewPoint = this.T - Math.idiv(100 - this.H, 5)
            dewPoint = u = Weather_T.T_C ? dewPoint : dewPoint * 9.0 / 5.0 + 32.0;
            return Math.roundWithPrecision(dewPoint, 2)
        }
    }
}  