
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
* Custom blocks
*/
//% weight=301 
//% color=#9E4894 
//% icon=""
//% labelLineWidth=1001
//% advanced=true
namespace bBoard_Cybersec {

    let dafaultEspReplyTimeout = 30000;
    let response: number;
    let receivedData: string
    let boardIDGlobal = 0;
    let clickIDGlobal = 0;
    
    
    function WiFiResponse(
        expectedResponse: string,
        IPDResponseTrue: boolean,
        timeoutmS: number
    ) {
    
        let IPDLengthIndexStart = 0;
        let receivedStr = ""; //The built string
        let tempIndex = 0;
        receivedData = "";
        let IPDResponseLength = 0; //IPD Response length
        let expectedResponseIndex = 0; //The current position of the expected response comparison
        let responseState = 0; //Used to track where we are in parsing the response
        let startTime = input.runningTime(); //Get the time when this was called
        while (input.runningTime() < (startTime + timeoutmS)) {
            //Do the code below while timeout hasn't occured
            if (bBoard_Control.isUARTDataAvailable(0, 0)) {
                receivedStr = receivedStr + bBoard_Control.getUARTData(0, 0); //Read the serial port for any received responses
            }
            switch (responseState) {
                case 0:
                    if (receivedStr.indexOf(expectedResponse) != -1) {
                        responseState = 1; //Move to the next stage of response comparison
                    }
                    break;
                case 1:
                    if (IPDResponseTrue == true) {
                        expectedResponseIndex = 0; //Reset the expected response index as we need to start over
                        responseState = 3;
                    }
                    else {
                        receivedData = receivedStr
                        return 1; //Succesfully matched
                    }
                    break;
                case 3:
                    tempIndex = receivedStr.indexOf("+IPD");
                    if (tempIndex != -1) {
                        expectedResponseIndex = tempIndex;
                        responseState = 4;
                    }
                    break;
                case 4:
                    tempIndex = receivedStr.indexOf(",", expectedResponseIndex);
                    if (tempIndex != -1) {
                        IPDLengthIndexStart = tempIndex + 1;
                        responseState = 5;
                    }
                    break;
                case 5:
                    tempIndex = receivedStr.indexOf(":", expectedResponseIndex);
                    if (tempIndex != -1) {
                        expectedResponseIndex = tempIndex;
                        IPDResponseLength = parseInt(receivedStr.substr(IPDLengthIndexStart, (expectedResponseIndex - IPDLengthIndexStart))); //Convert the characters we received representing the length of the IPD response to an integer
                        responseState = 6;
                    }
                    break;
                case 6:
                    if (receivedStr.length >= IPDResponseLength) {  //Make sure all of the message has arrived
                        receivedData = receivedStr.slice(expectedResponseIndex + 1); //Remove everything except the message
                        return 1; //Successfully read
                    }
                    break;
            } //Switch
        }
        return 0;
    }


    
    /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     * @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect mode $mode"
    //%block.loc.fr="connecter mode $mode"
    //% weight=110
    //% group="Initialize and Connect"

    // 0: Null mode. Wi-Fi RF will be disabled.
    // 1: Station mode.
    // 2: SoftAP mode.
    // 3: SoftAP+Station mode.

    export function WifiMode(mode: number): void {
        bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
        bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
        basic.pause(1000)
        bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);
        bBoard_Control.UARTSendString("AT+CWMODE="+mode+"\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, dafaultEspReplyTimeout); //Wait for the response "OK"
        if (response == 0) {
            basic.showString("Err CWMODE")
            serial.writeLine("Err CWMODE")
        } else {
            serial.writeLine("Connection Mode: " + mode)
        }
    }

    /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     * @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect to ssid $ssid| with password $pwd"
    //%block.loc.fr="connecter à ssid $ssid| avec mot de passe $pwd"
    //% weight=110
    //% group="Initialize and Connect"
    export function WifiMUX(mux: number): void {
        bBoard_Control.UARTSendString("AT+CIPMUX="+mux+"\r\n", boardIDGlobal, clickIDGlobal);  //Enable multiple connections
        response = WiFiResponse("OK", false, dafaultEspReplyTimeout); //Wait for the response "OK"
        if (response == 0) {
            basic.showString("Err CIPMUX")
            serial.writeLine("Err CIPMUX")
        } else {
            serial.writeLine("MUX Mode: " + mux)
        }
    }

    /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     * @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect to ssid $ssid| with password $pwd"
    //%block.loc.fr="connecter à ssid $ssid| avec mot de passe $pwd"
    //% weight=110
    //% group="Initialize and Connect"
    export function WifiConnect(ssid: string, pwd: string): void {
        bBoard_Control.UARTSendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n", boardIDGlobal, clickIDGlobal);  //Connect to WiFi Network
        response = WiFiResponse("OK", false, dafaultEspReplyTimeout); //Wait for the response "OK"
        if (response == 0) {
            if (response == 0) {
                basic.showString("Err CWJAP")
                serial.writeLine("Err CWJAP")
            } else {
                serial.writeLine("CWJAP OK: ")
            }
        }
    }


    //% blockId=isConnected
    //% block="$this WiFi is connected"
    //% block.loc.fr="$this WiFi est connecté?"
    //% weight=110 
    //% advanced=false
    //% group="MQTT"
    //% subcategory="More"
    //% this.shadow=variables_get
    //% this.defl="isConnected"
    export function isConnected(): boolean {
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, dafaultEspReplyTimeout);
        let statusStartIndex = receivedData.indexOf("STATUS:")
        let connected = parseInt(receivedData.substr(statusStartIndex + 7, 1)); //Convert the characters we received representing the length of the IPD response to an integer
        if (response == 0) {
            if (response == 0) {
                basic.showString("Err CIPSTATUS")
                serial.writeLine("Err CIPSTATUS")
            } else {
                serial.writeLine("CIPSTATUS: " + connected)
            }
        }
        if (connected == 2) {
            return true;
        }
        return false;
    }

     /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     * @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect to ssid $ssid| with password $pwd"
    //%block.loc.fr="connecter à ssid $ssid| avec mot de passe $pwd"
    //% weight=110
    //% group="Initialize and Connect"
    export function myIP(): string {
        bBoard_Control.UARTSendString("AT+CIFSR\r\n", boardIDGlobal, clickIDGlobal);  //Get local IP Address
        response = WiFiResponse("OK", false, dafaultEspReplyTimeout); //Wait for the response "OK"
        let statusStartIndex = receivedData.indexOf("CIFSR:")
        let connected = receivedData.substr(statusStartIndex + 7, 1); //Convert the characters we received representing the length of the IPD response to an integer
        if (response == 0) {
            basic.showString("Err CIFSR")
            serial.writeLine("Err CIFSR")
        } else {
            serial.writeLine("CIFSR: " + connected)
        }
        return connected;
    }



    //% block="Turn WiFi Off"
    //%block.loc.fr="Définir WiFi Off"
    //% weight=110
    //% group="MQTT"
    //% subcategory="More"
    export function WiFiOff(): void {
        bBoard_Control.writePin(0,clickIOPin.CS,boardIDGlobal,clickIDGlobal);
    }


    //% blockId=getMACaddress
    //% block="$this Get MAC address"
    //% block.loc.fr="$this Obtenir la MAC address"
    //% weight=100 
    //% advanced=false
    //% group="MQTT"
    //% subcategory="More"
    //% this.shadow=variables_get
    //% this.defl="MAC"
    export function getMACaddress(): string {
        bBoard_Control.UARTSendString("AT+CIPSTAMAC?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, 1000);
        return(receivedData.substr(27,17));
    }
}