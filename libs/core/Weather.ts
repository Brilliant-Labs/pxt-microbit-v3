//-------------------------Click Board Weather -----------------------------------
//% weight=100 color=#33BEBB icon="\uf185" block="Weather"
//% advanced=true
//% labelLineWidth=1002
namespace Weather {
    enum Weather_I2C_Address {
        //% block="0x76"
        ADDR_0x76 = 0x76,
        //% block="0x77"
        ADDR_0x77 = 0x77
    }
    enum Weather_T {
        //% block="C"
        T_C = 0,
        //% block="F"
        T_F = 1
    }
    enum Weather_P {
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
    enum PowerSettings {
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
        obj.Power(PowerSettings.On);
        return obj
    }

    export class Weather {
        Weather_I2C_Addr: number;
        dig_T1: number;
        dig_T2: number;
        dig_T3: number;
        dig_P1: number;
        dig_P2: number;
        dig_P3: number;
        dig_P4: number;
        dig_P5: number;
        dig_P6: number;
        dig_P7: number;
        dig_P8: number;
        dig_P9: number;
        dig_H1: number;
        dig_H2: number;
        dig_H3: number;
        a: number;
        dig_H4: number;
        dig_H5: number;
        dig_H6: number;
        T: number;
        P: number;
        H: number;

        myBoardID: BoardID
        myClickID: ClickID

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID

            this.Weather_I2C_Addr = Weather_I2C_Address.ADDR_0x76;
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
            this.setreg(0xF2, 0x04)
            this.setreg(0xF4, 0x2F)
            this.setreg(0xF5, 0x0C)
            this.T = 0
            this.P = 0
            this.H = 0
        }
        setreg(reg: number, dat: number): void {
            let tempBuf = pins.createBuffer(2)
            tempBuf.setNumber(NumberFormat.UInt8LE, 0, reg)
            tempBuf.setNumber(NumberFormat.UInt8LE, 1, dat)
            bBoard_Control.BLiX(this.myBoardID, this.myClickID, 0, I2C_module_id, I2C_WRITE_id, null, tempBuf, 0)
        }
//TODO: Solve get
        getreg(reg: number): number {
            this.i2cWriteNumber(this.Weather_I2C_Addr, reg, NumberFormat.UInt8BE, true);
            //I2Cs.i2cWriteNumber(this.Weather_I2C_Addr, reg, clickBoardNum, NumberFormat.UInt8BE, false)
            let bufr = this.I2CreadNoMem(this.Weather_I2C_Addr, pins.sizeOf(NumberFormat.UInt8BE))
            return bufr.getNumber(NumberFormat.UInt8BE, 0);
        }

        getInt8LE(reg: number): number {
            this.i2cWriteNumber(this.Weather_I2C_Addr, reg, NumberFormat.UInt8BE, true);
            let bufr = this.I2CreadNoMem(this.Weather_I2C_Addr, pins.sizeOf(NumberFormat.UInt8LE))
            return bufr.getNumber(NumberFormat.UInt8LE, 0);
        }

        getUInt16LE(reg: number): number {
            this.i2cWriteNumber(this.Weather_I2C_Addr, reg, NumberFormat.UInt8BE, true);
            let bufr = this.I2CreadNoMem(this.Weather_I2C_Addr, pins.sizeOf(NumberFormat.UInt16LE))
            return bufr.getNumber(NumberFormat.UInt16LE, 0);
        }

        getInt16LE(reg: number): number {
            this.i2cWriteNumber(this.Weather_I2C_Addr, reg, NumberFormat.UInt8BE, true);
            let bufr = this.I2CreadNoMem(this.Weather_I2C_Addr, pins.sizeOf(NumberFormat.Int16LE))
            return bufr.getNumber(NumberFormat.Int16LE, 0);
        }

        get(): void {
            let adc_T = (this.getreg(0xFA) << 12) + (this.getreg(0xFB) << 4) + (this.getreg(0xFC) >> 4)
            let var1 = (((adc_T >> 3) - (this.dig_T1 << 1)) * this.dig_T2) >> 11
            let var2 = (((((adc_T >> 4) - this.dig_T1) * ((adc_T >> 4) - this.dig_T1)) >> 12) * this.dig_T3) >> 14
            let t = var1 + var2
            this.T = Math.idiv((t * 5 + 128) >> 8, 100)
            var1 = (t >> 1) - 64000
            var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * this.dig_P6
            var2 = var2 + ((var1 * this.dig_P5) << 1)
            var2 = (var2 >> 2) + (this.dig_P4 << 16)
            var1 = (((this.dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((this.dig_P2) * var1) >> 1)) >> 18
            var1 = ((32768 + var1) * this.dig_P1) >> 15
            if (var1 == 0)
                return; // avoid exception caused by division by zero
            let adc_P = (this.getreg(0xF7) << 12) + (this.getreg(0xF8) << 4) + (this.getreg(0xF9) >> 4)
            let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
            _p = Math.idiv(_p, var1) * 2;
            var1 = (this.dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
            var2 = (((_p >> 2)) * this.dig_P8) >> 13
            this.P = _p + ((var1 + var2 + this.dig_P7) >> 4)
            let adc_H = (this.getreg(0xFD) << 8) + this.getreg(0xFE)
            var1 = t - 76800
            var2 = (((adc_H << 14) - (this.dig_H4 << 20) - (this.dig_H5 * var1)) + 16384) >> 15
            var1 = var2 * (((((((var1 * this.dig_H6) >> 10) * (((var1 * this.dig_H3) >> 11) + 32768)) >> 10) + 2097152) * this.dig_H2 + 8192) >> 14)
            var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * this.dig_H1) >> 4)
            if (var2 < 0) var2 = 0
            if (var2 > 419430400) var2 = 419430400
            this.H = (var2 >> 12) >> 10
        }

        /**
         * get humidity
         */
        //% blockId="Weather_GET_Humidity" block="$this humidity"
        //% weight=80 blockGap=8
        //% group="Humidity"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        humidity(): number {
            this.get();
            return this.H;
        }

        HumidityBelowAbove(u: below_above, dat: number): boolean {
            //this.get();
            //control.inBackground(function () {
            //    while (true) {
            let retval = false
            this.get()
            if (u == below_above.below) {
                if (this.H < dat) {
                    retval = true
                }
            }
            if (u == below_above.above) {
                if (this.H > dat) {
                    retval = true
                }
            }
            //basic.pause(1000)
            // }
            return retval
            // })
        }

        /**
        * get pressure
        */
        //% blockId="Weather_GET_Pressure" block="$this pressure $u"
        //% weight=80 blockGap=8
        //% group="Pressure"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        pressure(u: Weather_P): number {
            this.get();
            if (u == Weather_P.Pa) return this.P;
            else if (u == Weather_P.hPa) return Math.idiv(this.P, 100)
            else if (u == Weather_P.mmHg) return this.P * 0.00750062
            else if (u == Weather_P.psi) return this.P * 0.000145038
            else return Math.idiv(this.P, 1000)
        }

        PressureBelowAbove(u: below_above, dat: number): boolean {
            //control.inBackground(function () {
            //while (true) {
            let retval = false
            this.get()
            if (u == below_above.below) {
                if (this.P < dat) {
                    //body()
                    retval = true
                }
            }
            if (u == below_above.above) {
                if (this.P > dat) {
                    //body()
                    retval = true
                }
            }
            //basic.pause(1000)
            return retval
            //}
            //})
        }

        /**
         * get temperature
         */
        //% blockId="Weather_GET_Temperature" block="$this temperature $u"
        //% weight=80 blockGap=8
        //% group="Temperature"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        temperature(u: Weather_T): number {
            this.get();
            if (u == Weather_T.T_C) return this.T;
            else return this.T * 9.0 / 5.0 + 32.0;
        }

        TemperatureBelowAbove(u: below_above, dat: number, TempUnits: Weather_T): boolean {
            //control.inBackground(function () {
            //    while (true) {
            let retval = false
            this.get()
            let temp = TempUnits == Weather_T.T_C ? this.T : (32 + Math.idiv(this.T * 9, 5))
            if (u == below_above.below) {
                if (temp < dat) {
                    retval = true
                }
            }
            if (u == below_above.above) {
                if (temp > dat) {
                    retval = true
                }
            }
            //basic.pause(1000)
            //}
            //})
            return retval
        }

        /**
         * set I2C address
         */
        //% blockId="Weather_SET_ADDRESS" block="$this set address $addr"
        //% weight=20 blockGap=8
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        //% advanced=true
        Address(addr: Weather_I2C_Address) {
            this.Weather_I2C_Addr = addr
        }

        /**
         * power on
         */
        //% blockId="Weather_POWER_ON" block="$this Power $power"
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
        //% weight=60 blockGap=8
        //% group="Dewpoint"
        //% blockNamespace=Weather
        //% this.shadow=variables_get
        //% this.defl="Weather"
        Dewpoint(u: Weather_T): number {
            this.get();
            let dewPoint = this.T - Math.idiv(100 - this.H, 5)
            dewPoint = u = Weather_T.T_C ? dewPoint : dewPoint * 9.0 / 5.0 + 32.0;
            return dewPoint
        }
    }
}  