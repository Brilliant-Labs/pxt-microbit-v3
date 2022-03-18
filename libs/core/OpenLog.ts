
/**
* OpenLog SD Card reader
*/
//% weight=100 color=#0fbc11  icon=""
//% advanced=true
//% labelLineWidth=1009
namespace openLogSD {


    //% block="Variable names $variablesToSave $boardID $clickID"
    //%block.loc.fr="$this Noms de variables $variablesToSave $boardID $clickID"
    //% blockSetVariable="SDCard"
    //% clickID.min=1
    //% weight=110
    export function createDataLogger(variablesToSave: string[], boardID: BoardID, clickID: ClickID): SDdataLogger {
        return new SDdataLogger(variablesToSave, boardID, clickID);
    }

    export class SDdataLogger {

        private myBoardID: BoardID
        private myClickID: ClickID


        constructor(variablesToSave: string[], boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID
            this.myClickID = clickID
            bBoard_Control.UARTFrequency(9600, this.myBoardID, this.myClickID)
            this.writeString(variablesToSave)
        }
        //%blockId=writeStringToSD
        //%block="$this Send string to SD Card $variables"
        //%block.loc.fr="$this Envoyer string à la carte SD $variables"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=openLogSD
        //% this.shadow=variables_get
        //% this.defl="SDCard"
        writeString(variables: string[]): void {
            let variablesString = ""
            for (let i = 0; i < variables.length; i++) {
                variablesString += variables[i] + ","
            }
            variablesString = variablesString.substr(0, variablesString.length - 1)//remove the comma
            variablesString += "\r\n";
            bBoard_Control.UARTSendString(variablesString, this.myBoardID, this.myClickID)
        }

        //%blockId=writeNumbertoSD
        //%block="$this Send numbers to SD Card $numbers"
        //%block.loc.fr="$this Envoyer nombres à la carte SD $variables"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=openLogSD
        //% this.shadow=variables_get
        //% this.defl="SDCard"
        writeNumbers(numbers: number[]): void {
            let variablesString = ""
            for (let i = 0; i < numbers.length; i++) {
                variablesString += numbers[i].toString() + ","
            }
            variablesString = variablesString.substr(0, variablesString.length - 1)//remove the comma
            variablesString += "\r\n";
            bBoard_Control.UARTSendString(variablesString, this.myBoardID, this.myClickID)
        }
    }
}