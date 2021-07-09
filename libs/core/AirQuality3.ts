//------------------------- Click Board AirQuality3 -----------------------------------
// CCS811 Air quality sensor
//
// Written by Larry Bank - 11/4/2017
// Copyright (c) 2017 BitBank Software, Inc.
// bitbank@pobox.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// Opens a file system handle to the I2C device
// Starts the 'app' in the CCS811 microcontroller
// into continuous mode to read values every second
// Returns 0 for success, 1 for failure
//

/**
* Custom blocks
*/
//% weight=100 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Air_Quality_3 {

    /**
     * Sets LCD object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param AirQuality the LCDSettings
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Air_Quality_3"
    //% clickID.min=1
    //% weight=110
    export function createAirQuality(boardID: BoardID, clickID: ClickID): AirQuality {
        return new AirQuality(boardID, clickID);
    }

    export enum temp_units {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    export enum humidity {
        //% block="50"
        fifty = 50,
        //% block="5"
        five = 5,
        //% block="10"
        ten = 10,
        //% block="15"
        fifteen = 15,
        //% block="20"
        twenty = 20,
        //% block="25"
        twentyfive = 25,
        //% block="30"
        thirty = 30,
        //% block="35"
        thirtyfive = 35,
        //% block="40"
        fourty = 40,
        //% block="45"
        fourtyfive = 45,
        //% block="55"
        fiftyfive = 55,
        //% block="60"
        sixety = 60,
        //% block="65"
        sixtyfive = 65,
        //% block="70"
        seventy = 70,
        //% block="75"
        seventyfive = 75,
        //% block="80"
        eighty = 80,
        //% block="85"
        eightyfive = 85,
        //% block="90"
        ninety = 90,
        //% block="95"
        ninetyfive = 95,
        //% block="100"
        hundred = 100
    }

    export enum airQualityValue {
        eCO2_ppm,
        TVOC_ppb
    }
    export class AirQuality {
        private readonly STATUS = 0x00
        private readonly MEAS_MODE = 0x01
        private readonly ALG_RESULT_DATA = 0x02
        private readonly RAW_DATA = 0x03
        private readonly ENV_DATA  = 0x05
        private readonly THRESHOLDS = 0x10
        private readonly BASELINE = 0x11
        private readonly HW_ID = 0x20
        private readonly HW = 0x21
        private readonly FW_Boot_Version = 0x23
        private readonly FW_App_Version = 0x24
        private readonly Internal_State = 0xA0
        private readonly ERROR_ID = 0xE0
        private readonly APP_ERASE = 0xF1
        private readonly APP_DATA = 0xF2
        private readonly APP_VERIFY = 0xF3
        private readonly APP_START = 0xF4
        private readonly SW_RESET = 0xFF
        private readonly CCS811_DEVICE_ADDRESS = 0x5A
        
        private myBoardID: BoardID
        private myClickID: ClickID
        private myI2CAddress:number

        private eCO2value: number;
        private TVOCvalue: number;
        deviceAddress: number

        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
            this.eCO2value = 0;
            this.TVOCvalue = 0;
            this.initialize()
        }

        initialize() {
            this.myI2CAddress = this.CCS811_DEVICE_ADDRESS
            let statusReg = 0;
            bBoard_Control.writePin(1, clickIOPin.RST, this.myBoardID, this.myClickID)
            this.ccs811Reset();
            this.CCS811AppStart()
            statusReg = this.ccs811Status();
            this.writeCCS811([0x10], this.MEAS_MODE); // constant power mode (001), no interrupts
            //writeCCS811([0x20,0xff, 0xfc,0xa9, 0xf8, 0x80, 0xfa, 0xf0, 0x81, 0x0c, 0x80,0xf2, 0xff],boardID) //Initialize the Config register
        }

        dataReady(): boolean {
            let statusReg = this.ccs811Status();
            if ((statusReg & 0x08) == 0x08) {
                return true;
            }
            return false;
        }
        
        CCS811AppStart() {
            bBoard_Control.clearPin(clickIOPin.CS, this.myBoardID, this.myClickID)
            control.waitMicros(50); //according to datasheet, 50uS minimum to wake
            let i2cBuffer = pins.createBuffer(1)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, this.APP_START)      //0xF4 = App start command
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID);
            bBoard_Control.setPin(clickIOPin.CS, this.myBoardID, this.myClickID)
        }

        //
        // Turn off the sensor and close the I2C handle
        //
        ccs811Shutdown() {
            this.writeCCS811([0x00], this.MEAS_MODE); // Idle mode
        }

        ccs811Status(): number {
            let returnValue = this.readCCS811(1, this.STATUS); // Idle mode
            //this.readCCS811(1,this.MEAS_MODE)
            // this.readCCS811(1,this.ERROR_ID)
            return returnValue[0]
        }

        ccs811Reset() {
            let resetSequence = [0x11, 0xE5, 0x72, 0x8A];
            this.writeCCS811(resetSequence, this.SW_RESET); // Idle mode
            control.waitMicros(5000); //Wait for reset
        }

        //
        // Set the calibration values of temperature and humidity
        // to provide more accurate air quality readings
        // Temperature in Celcius and Humidity as percent (50 = 50%)
        //


        //%blockId=CCS811Calibration
        //%block="Calibrate $this sensor to temperature $cTemp $degrees and humidity $fHumid"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Air_Quality_3
        //% this.shadow=variables_get
        //% this.defl="Air_Quality_3"
        //% cTemp.defl=25 
        //% fHumid.defl=50
        //% degrees.defl="temp_units.C"
        ccs811SetCalibration(cTemp: number, degrees: temp_units, fHumid: humidity) {
            let i: number = 0;
            let ucTemp = [];
            cTemp = degrees == temp_units.C ? cTemp : cTemp * 9.0 / 5.0 + 32.0;
            i = (fHumid * 512); // convert to 512th fractions
            ucTemp[0] = (0xFF00) && (i >> 8); // high byte
            ucTemp[1] = (0x00FF) && i; // low byte
            i = ((cTemp - 25.0) * 512.0); // offset of -25C
            ucTemp[2] = (0xFF00) && (i >> 8); // high byte
            ucTemp[3] = (0x00FF) && i; // low byte
            this.writeCCS811(ucTemp, this.ENV_DATA); // constant power mode (001), no interrupts
        }

        //%blockId=CCS811AirQuality
        //%block="Read $this $valueToRetrieve value"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Air_Quality_3
        //% this.shadow=variables_get
        //% this.defl="Air_Quality_3"
        ccs811AirQuality(valueToRetrieve: airQualityValue): number {
            let ucTemp: number[];
            let i: number;
            let rc: number;
            if (this.dataReady()) //Is data ready?
            {
                ucTemp = this.readCCS811(4, this.ALG_RESULT_DATA)
                this.eCO2value = 0xFF00 & (ucTemp[0] << 8) | 0x00FF & ucTemp[1];
                this.TVOCvalue = 0xFF00 & (ucTemp[2] << 8) | 0x00FF & ucTemp[3];
            }
            switch (valueToRetrieve) {
                case airQualityValue.eCO2_ppm:
                    return this.eCO2value;
                    break;
                case airQualityValue.TVOC_ppb:
                    return this.TVOCvalue;
                    break;
                default:
                    return 0;
            }
        }

        //%blockId=CCS811_write
        //%block="Write $this array $values to CCS811 register$register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Air_Quality_3
        //% this.shadow=variables_get
        //% this.defl="Air_Quality_3"
        writeCCS811(values: number[], register: number) {
            bBoard_Control.clearPin(clickIOPin.CS, this.myBoardID, this.myClickID)
            control.waitMicros(50); //according to datasheet, 50uS minimum to wake
            let i2cBuffer = pins.createBuffer(values.length + 1)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
            for (let i = 0; i < values.length; i++) {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i + 1, values[i])
            }
            bBoard_Control.i2cWriteBuffer(this.myI2CAddress, i2cBuffer, this.myBoardID, this.myClickID)
            bBoard_Control.setPin(clickIOPin.CS, this.myBoardID, this.myClickID)
        }

        //%blockId=CCS811_read
        //%block="$this Read $numBytes bytes from register$register"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=Air_Quality_3
        //% this.shadow=variables_get
        //% this.defl="Air_Quality_3"
        readCCS811(numBytes: number, register: number): number[] {
            bBoard_Control.clearPin(clickIOPin.CS, this.myBoardID, this.myClickID)
            control.waitMicros(50); //according to datasheet, 50uS minimum to wake
            bBoard_Control.i2cWriteNumber(this.myI2CAddress, register, NumberFormat.UInt8LE, true, this.myBoardID, this.myClickID)
            let i2cBuffer = bBoard_Control.I2CreadNoMem(this.myI2CAddress, numBytes, this.myBoardID, this.myClickID)
            let dataArray: number[] = []; //Create an array to hold our read values
            for (let i = 0; i < numBytes; i++) {
                dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
                // serial.writeValue(i.toString(),dataArray[i])
            }
            bBoard_Control.setPin(clickIOPin.CS, this.myBoardID, this.myClickID)
            return dataArray
        }
    }
}