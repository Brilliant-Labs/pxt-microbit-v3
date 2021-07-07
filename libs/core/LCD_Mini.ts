//-------------------------Click Board Blocks Begin -----------------------------------
//% weight=100 color=#D400D4 icon=""
//% advanced=true
//% labelLineWidth=1006
namespace LCD_Mini {
    export enum lineNumber {
        //% block="1"
        one = 0,
        //% block="2"
        two,
    }

    /**
     * Sets LCD object.
     * @param boardID the boardID
     *  @param LCDSettings the LCDSettings
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="LCDSettings"
    //% blockId=LCDSettings
    //% weight=110
    export function createLCDSettings(boardID: BoardID, clickID: ClickID): LCDSettings {
        let handle = new LCDSettings(boardID, clickID);
        handle.lcd_init()
        return handle
    }
    export class LCDSettings {
        private LOW: number;
        private HIGH: number;
        public backlight: clickIOPin;
        private CS: number;
        private CS2: number;
        private RST: number;
        private IODIRB: number;
        private OLATB: number;
        private GPINTENA: number;
        private WRITE_BYTE: number;
        private READ_BYTE: number;
        private myBoardID: number;
        private myClickID: number;

        constructor(boardID: BoardID, clickID: ClickID) {
            this.LOW = 0;
            this.HIGH = 1;
            this.CS = clickIOPin.CS;
            this.CS2 = clickIOPin.AN;
            this.RST = clickIOPin.RST;
            this.IODIRB = 0x01;
            this.GPINTENA = 0x04;
            this.OLATB = 0x15;
            this.WRITE_BYTE = 0b01000000;
            this.READ_BYTE = 0b01000001;
            this.myBoardID = boardID
            this.myClickID = clickID
        }
        get LOWval() {
            return this.LOW
        }
        set LOWval(value) {
            this.LOW = value
        }
        get HIGHval() {
            return this.HIGH
        }
        set HIGHval(value) {
            this.HIGH = value
        }
        get CSval() {
            return this.CS
        }
        set CSval(value) {
            this.CS = value
        }
        get CS2val() {
            return this.CS2
        }
        set CS2val(value) {
            this.CS2 = value
        }
        get RSTval() {
            return this.RST
        }
        set RSTval(value) {
            this.RST = value
        }
        get IODIRBval() {
            return this.RST
        }
        set IODIRBval(value) {
            this.RST = value
        }
        get OLATBval() {
            return this.OLATB
        }
        set OLATBval(value) {
            this.OLATB = value
        }
        get WRITE_BYTEval() {
            return this.WRITE_BYTE
        }
        set WRITE_BYTEval(value) {
            this.WRITE_BYTE = value
        }

        __delay_us(delayuS: number) {
            control.waitMicros(delayuS)
        }
        lcd_init() {
            bBoard_Control.writePin(1, clickIOPin.PWM, this.myBoardID, this.myClickID)
            this.lcd_setup();
            this.lcd_setContrast(0x30)
        }
        lcd_sendNibble(nibble: number, RSbit: number) {
            let packet = (nibble << 4) | (RSbit << 2);
            this.expander_setOutput(packet);
            this.expander_setOutput(packet | (1 << 3));
            this.__delay_us(1);
            this.expander_setOutput(packet);
            this.__delay_us(40);
        }
        lcd_sendByte(byte: number, RSbit: number) {
            let nibbleHigh = byte >> 4;
            let nibbleLow = byte & 0xF;
            let packetHigh = (nibbleHigh << 4) | (RSbit << 2);
            let packetLow = (nibbleLow << 4) | (RSbit << 2);
            this.expander_setOutput(packetHigh);
            this.__delay_us(2);
            this.expander_setOutput(packetHigh | (1 << 3));
            this.__delay_us(2);
            this.expander_setOutput(packetLow)
            this.__delay_us(2);
            this.expander_setOutput(packetLow | (1 << 3));
            this.__delay_us(40);
        }
        lcd_returnHome() {
            this.lcd_sendByte(0b10, 0);
            basic.pause(2)
        }
        lcd_setAddr(row: number, character: number) {
            this.lcd_sendByte(0x80 | (character + (row * 40)), 0);
        }
        lcd_writeChar(character: string) {
            this.lcd_sendByte(character.charCodeAt(0), 1);
        }
        lcd_setContrast(contrast: number) {
            this.digipot_setWiper(contrast);
        }
        lcd_setup() {
            bBoard_Control.writePin(1, this.RST, this.myBoardID, this.myClickID)
            bBoard_Control.writePin(1, this.CS2, this.myBoardID, this.myClickID)
            bBoard_Control.writePin(1, this.CS, this.myBoardID, this.myClickID)
            bBoard_Control.spiCS(this.CS, this.myBoardID, this.myClickID)
            this.expander_setup();
            this.expander_setOutput(0);
            basic.pause(40)
            this.lcd_sendNibble(0b11, 0);
            basic.pause(10)
            this.lcd_sendNibble(0b11, 0);
            basic.pause(10)
            this.lcd_sendNibble(0b11, 0);
            basic.pause(10)
            this.lcd_sendNibble(0x2, 0);
            this.lcd_sendByte(0x2C, 0);
            this.lcd_sendByte(0b1100, 0);
            this.lcd_sendByte(0x06, 0);
            this.lcd_sendByte(0x0C, 0);
            basic.pause(2)
            this.lcd_returnHome();
            this.lcd_clearDisplay();
        }
        expander_sendByte(addr: number, byte: number) {
            //spi1_master_open(LCD);
            //  LCDMini_nCS_LAT = 0;
            let cmd = [this.WRITE_BYTE, addr, byte];
            //bBoard_Control.clearPin(CS,boardID)
            bBoard_Control.SPIWriteArray(cmd, this.myBoardID, this.myClickID)
            //bBoard_Control.setPin(CS,boardID)
        }
        expander_readByte(addr: number): number {
            let cmd = [this.READ_BYTE, addr];
            bBoard_Control.spiCS(0, this.myBoardID, this.myClickID) //Take manual control of the SPI CS
            bBoard_Control.writePin(0, this.CS, this.myBoardID, this.myClickID) //Manually set the CS to 0
            bBoard_Control.SPIWriteArray(cmd, this.myBoardID, this.myClickID) //Send the READ BYTE command followed by register address
            let result = bBoard_Control.SPIread(1, this.myBoardID, this.myClickID) //Send a dummy byte/read the reply
            bBoard_Control.writePin(1, this.CS, this.myBoardID, this.myClickID) //Manually set the CS back to 1
            bBoard_Control.spiCS(this.CS, this.myBoardID, this.myClickID) //Give the SPI module back control of the CS
            return result;
        }
        expander_setup() {
            this.expander_sendByte(this.IODIRB, 0);
            this.expander_sendByte(this.GPINTENA, 1); //INTA is not connected on the LCD mini click. So let's use this register as a way to see if we are initialized or not by writing a 1 to it when initalized
        }
        expander_setOutput(output: number) {
            this.expander_sendByte(this.OLATB, output);
        }
        digipot_setWiper(val: number) {
            let cmd = [0, val];
            // bBoard_Control.clearPin(CS2,boardID)
            bBoard_Control.spiCS(this.CS2, this.myBoardID, this.myClickID)
            bBoard_Control.SPIWriteArray(cmd, this.myBoardID, this.myClickID)
            bBoard_Control.spiCS(this.CS, this.myBoardID, this.myClickID)
            //bBoard_Control.setPin(CS2,boardID)
        }

        /**
         * Writes string value.
         * @param LCDstring the string
         * @param lineNum the lineNum
         */
        //% block="$this Write a $LCDstring to line $lineNum"
        //% blockId=LCDWriteString
        //% blockNamespace=LCD_Mini
        //% this.shadow=variables_get
        //% this.defl="LCDSettings"
        //% weight=90 blockGap=12 color=#9E4894 icon=""
        lcd_writeString(LCDstring: string, lineNum: lineNumber) { //, boardID: BoardID) {
            this.lcd_testInit() //Check to make sure our LCD is initialized first
            this.lcd_setAddr(lineNum, 0);
            let i = 0;
            for (i = 0; i < 16; i++) {
                if (LCDstring[i]) {
                    this.lcd_writeChar(LCDstring[i]);
                }
            }
            this.lcd_returnHome();
        }

        //% blockId=LCD_Clear
        //% block="Clear $this LCD"
        //% weight=80
        //% blockGap=7
        //% blockNamespace=LCD_Mini
        //% this.shadow=variables_get
        //% this.defl="LCDSettings"
        lcd_clearDisplay() {
            this.lcd_sendByte(1, 0);
            basic.pause(2)
        }
        lcd_testInit() {
            bBoard_Control.writePin(1, this.RST, this.myBoardID, this.myClickID) //Make sure the reset line is set
            if (this.expander_readByte(this.GPINTENA) == 0) //If the GPINTENA register is 0, the expander/LCD has not been intialized
            {
                this.lcd_init() //Initialize everything
            }
        }
    }
}