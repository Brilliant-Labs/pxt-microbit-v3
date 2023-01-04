/**
* Use this file to define custom functions and blocks.
* Read more at /blocks/custom
*/

let CombinedNums = 0
let LSB = 0
let data = 0
let data1 = 0
let data2 = 0
let data3 = 0
let MSB = 0
let DigCode: number = 0
let current = 0
let voltage = 0
let voltCalibrate = 0
let currentCalibrate = 0
let resistanceCalibrate = 0
let capCalibrate = 0
let stateCount = 0
let stateManager:meterState
let click:ClickID 
let board:BoardID


enum meterState{

    //% block="Voltage"
    Voltage = 0,

    //% block="Current"
    Current = 1,

    //% block="Resistance"
    Resistance = 2,

    //% block="Capacitance"
    Capacitance = 3,

}




/**
 * Multimeter blocks
 */
//% weight=100 color=#33BEBB icon=""
namespace Mulitmeter {
    /**
         * Set up the multimeter on a click board. 
         * @param clickID is the board letter (a or b)
         */
    
    //% block="Set Up Multimeter on $boardId $clickID"
    //% block.loc.fr="Configurer le multimètre à $boardId $clickID"
    export function setUpMultimeter(boardId: BoardID, clickID: ClickID): void {
        CombinedNums = 0
        LSB = 0
        MSB = 0
        DigCode = 0
        bBoard_Control.SPIModeSelect(SPIMode.Mode0, boardId, clickID)
        bBoard_Control.spiFrequency(2000000, boardId, clickID)
        bBoard_Control.spiCS(clickIOPin.AN, boardId, clickID)
        bBoard_Control.writePin(
            1,
            clickIOPin.CS,
            boardId,
            clickID
        )

        click = clickID
        board = boardId

    }


    /**
      * Set up the multimeter on a click board.
      * @param state
      */ 
    //% block="$stateIn"
    //% blockSetVariable="state"
    export function initState(stateIn:meterState): string{
        let state1:string
        switch(stateIn) {   
            case 0: state1 = "Voltage"; break;
            case 1: state1 = "Current"; break;
            case 2: state1 = "Resistance"; break;
            case 3: state1 = "Capacitance"; break;
        }

        return state1
    }


    /**
     * Calibrate the Mulitmeter
     * @param clickID is the board letter (a or b)
     */
    //% block="Calibrate Mulitmeter"
    //% block.loc.fr="Calibrer le mulitmètre"
    export function calibrate(): void {
        
        
        voltCalibrate = 0
        currentCalibrate = 0
        

        // Current Calibrate
        basic.showLeds(`
        # # # # #
        . . # . .
        . . # . .
        . . # . .
        # # # # #
        `)
        currentCalibrate = currentRead()
        basic.showIcon(IconNames.Yes)

        // voltage Calibrate
        basic.showLeds(`
        # . . . #
        # . . . #
        # . . . #
        . # . # .
        . . # . .
        `)
        
        voltCalibrate = voltageRead()
        basic.showIcon(IconNames.Yes)

        
    }

    /**
     * Returns voltage  
     * @param clickID clickboard id number A or B
     */
    //% block="Voltage Read"
    //% block.loc.fr="obtenir le voltage"
    //% advanced=true
    export function voltageRead(): number {

        //flip the data
        data = readFromAdc(64)

        voltage = data *50/3 - voltCalibrate
        
        return voltage
    }

    /**
         * Returns current value
         * 
         */
    //% block="Current Read"
    //% block.loc.fr="obtenir le courant"
    //% advanced=true
    export function currentRead(): number {
        
        data = readFromAdc(0)
       
        current = data-currentCalibrate

        return current;
    }
    /**
     * Return the resistance value
     * @param resRef is the value of the test resistor
     */
    //% block="Resistance Read"
    //% block.loc.fr="obtenir la résistance"
    //% advanced=true
    export function resistanceRead(): number {
        
        setResistor(1,0,1)
       // DelayMs(100)
        basic.pause(250)
        let rRef = 10000000
        data = readFromAdc(128)

        //DEBUG
        //LCDSettings.lcd_writeString("Ranging--(1M): " , LCD_Mini.lineNumber.one)

        if((2.048-data)<.5){
            setResistor(1, 0, 0)
            basic.pause(500)
            rRef = 470000
            data = readFromAdc(128)
            //debug
            //LCDSettings.lcd_writeString("Ranging -- (470k): ", LCD_Mini.lineNumber.one)

            ///100kOhm
            if ((2.048 - data) < .5) {
                //debug
                //LCDSettings.lcd_writeString("Ranging -- (100K): ", LCD_Mini.lineNumber.one)
                setResistor(0, 1, 1)
                basic.pause(500)
                rRef = 100000
                data = readFromAdc(128)

                //10kOhm
                if ((2.048 - data) < .5) {
                    //debug
                    //LCDSettings.lcd_writeString("Ranging -- (10K): ", LCD_Mini.lineNumber.one)
                    setResistor(0, 1, 0)
                    basic.pause(500)
                    rRef = 10000
                    data = readFromAdc(128)

                    //1kOhm
                    if ((2.048 - data) < .5) {
                        //debug
                        //LCDSettings.lcd_writeString("Ranging -- (1K): ", LCD_Mini.lineNumber.one)
                        setResistor(0, 0, 1)
                        basic.pause(500)
                        rRef = 1000
                        data = readFromAdc(128)

                        //100Ohm
                        if ((2.048 - data) < .5) {
                            //debug
                           // LCDSettings.lcd_writeString("Ranging -- (100): ", LCD_Mini.lineNumber.one)
                            setResistor(0, 0, 0)
                            basic.pause(500)
                            rRef = 100
                            data = readFromAdc(128)

                        }
                    }
                }
                
            }
            
        }

        let vADC = data  // - resistanceCalibrate
        //let rUnknown = ((2.048*100)/vADC) - 100
        let rUnknown = ((2.048*rRef)/vADC) - rRef
        //calculate the rUnknown
        //rUnknown = ((2.048 * rRef) - rRef) / DigCode

        setResistor(0, 0, 0)
        basic.pause(500)
        if(rUnknown > 20000000){
            return 0
        }
        return rUnknown
        //return vADC
    }

    /**
        * Return the Capacitance value
        * @param resRef is the value of the test resistor
        */
    //% block="Capacitance Read"
    //% block.loc.fr="obtenir la capacité"
    //% advanced=true
    export function capacitanceRead(): number {

        data = readFromAdc(192)

        let vADC = (6.428e-2/(data))

        return vADC
    }


    //% block="Cycle Output $state"
    //% block.loc.fr="Sortie du cycle $state"
    //% blockSetVariable="state"
    export function cycleState(state:string):string {
        
        switch (state) {
            case "Voltage": state = "Current"; break;
            case "Current": state = "Resistance"; break;
            case "Resistance": state = "Capacitance"; break;
            case "Capacitance": state = "Voltage"; break;
        }
        return state
    }


    //%block="Display Mulitmeter Output given $state"
    //% block.loc.fr="Affichage de la sortie multimètre avec $state"
    export function displayMultimeter(state:string):string {
        
        switch (state) {
            case "Voltage": return "" + voltageRead(); break;
            case "Current": return "" + currentRead(); break;
            case "Resistance": return "" + resistanceRead(); break;
            case "Capacitance": return "" + capacitanceRead(); break;
        }

        return "error"
    }


    function flipLr(data:number):number {

        let temp = 0;
        let flipped = 0;

        for (let i = 0; i < 12; i++) {

            flipped = flipped << 1
            flipped = flipped | (data & 0x001)
            // console.log("and-ing the value  "+flipped.toString(2))

            // console.log("moving flipped:   "+flipped.toString(2))
            data = data >> 1

        }

        return flipped

    }

    function readFromAdc(channel:number):number{
        bBoard_Control.writePin(
            0,
            clickIOPin.CS,
            board,
            click
        )

        //start bits
        bBoard_Control.SPIWrite(6, board, click)

        // channel 2 - Resistance
        bBoard_Control.SPIWrite(channel, board, click)

        //Reading in the data
        data1 = bBoard_Control.SPIread(1, board, click) //read the data in
        data2 = bBoard_Control.SPIread(1, board, click) //read the data in
        data3 = bBoard_Control.SPIread(1, board, click) //read the data in

        bBoard_Control.writePin(
            1,
            clickIOPin.CS,
            board,
            click
        )

        //Assemble the data
        data = ((data1 << 16) | (data2 << 8) | data3)

        //isolate the data bits we want
        data = (data >> 5) & 0x00FFF

        //flip the data
        data = flipLr(data)

        return ((data*2.046) / 4096);
    }


    function setResistor(C:number, B:number, A:number){

        bBoard_Control.writePin(
            C,
            clickIOPin.INT,
            board,
            click
        )
        bBoard_Control.writePin(
            B,
            clickIOPin.PWM,
            board,
            click
        )
        bBoard_Control.writePin(
            A,
            clickIOPin.AN,
            board,
            click
        )

    }


}


