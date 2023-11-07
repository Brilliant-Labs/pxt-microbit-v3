let defaultWiFiTimeoutmS = 30000
let response: number;
let receivedData: string
let MQTTMessageRetrieveState: number;
let MQTTMessage: string;
let boardIDGlobal = 0;
let clickIDGlobal = 0;
let MQTTString: string

let CyberWiFiTimeoutmS = 7000;
let CyberWiFiConsoleTimeoutmS = 1000;

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
* Custom blocks
*/
//% weight=301 
//% color=#9E4894 
//% icon=""
//% labelLineWidth=1001
//% advanced=true
namespace bBoard_WiFi {
    //% groups=" 'Initialize and Connect' weight=200 , 'IFTTT' weight=200, 'Brilliant Labs Cloud' weight=198"

    ////////////////
    /**  
    * Publishes your data to your BL Cloud feed (feedName) using your
    * username "example: brilliantLabs@gmail.com"
    * and your Project API Key (Select "Users" and the key icon on BL Cloud)
    * @param username to username ,eg: "ex:brilliantlabs@gmail.com"
    * @param apiKey to apiKey ,eg: "ex:312a9205-8675-429f-98c5-023cb8325390"
    * @param feedName to feedName ,eg: "ex:temperature"
    * @param data data
    */
    //% blockId=publishBLMQTT
    //% block="BL MQTT publish$data=text|feed$feedName|username$username|API Key%apiKey"
    //% block.loc.fr="BL MQTT publier$data=text|flux$feedName|nom d'utilisateur$username|API clé%APIKey"
    //% subcategory="Brilliant Labs Cloud"
    //% group="MQTT"
    //% weight=70   
    //% blockGap=7
    export function publishBLMQTT(username: string, apiKey: string, feedName: string, data: any): void {
        let currentBufferIndex = 0;
        feedName = "feeds/" + feedName;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        let mqttBody: string;
        if (typeof data == 'string') {
            mqttBody = data;
        }
        else if (typeof data == 'number') {
            mqttBody = data.toString();
        }
        else {
            mqttBody = "Invalid Data Type Passed";
        }
        //remaining length =  topic Length = 2 bytes +  topic = topic.length bytes + mqttBody.length bytes
        let remainingLength = 2 + feedName.length + mqttBody.length;
        //publishPacketSize = control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let publishPacketSize = 1 + 1 + remainingLength
        let MQTTpublishPacket = pins.createBuffer(publishPacketSize)
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x30); //Publish Packet header
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length >> 8); //Topic (project key) Length MSB 
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length & 0xFF); //Topic (project key) Length LSB
        MQTTpublishPacket.write(currentBufferIndex, control.createBufferFromUTF8(feedName + mqttBody))
        if (isConnected() == false) {
            connectBLMQTT(username, apiKey);
        }
        BLMQTTPacketSend(MQTTpublishPacket);
        basic.pause(200)
    }

    //% blockId=connectBLMQTT
    //% block="|BL MQTT connect with username$username and API Key%apiKey"
    //% block.loc.fr="|BL MQTT connecter avec nom d'utilisateur$username et API clé%APIKey"
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=200   
    //% blockGap=7
    //% depracted = true
    //% defl="bBoard_WiFi" 
    function connectBLMQTT(username: string, apiKey: string): void {
        let currentBufferIndex = 0;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        let clientID = control.deviceSerialNumber().toString()
        let clientIDLength = clientID.length
        let usernameLength = username.length
        let apiKeyLength = apiKey.length
        let remainingLength = clientIDLength + 12 + usernameLength + apiKeyLength + 4;
        let packetSize = remainingLength + 1 + 1; //Remaining length + 1 byte for control packet + 1 byte for remaining length byte (Note: assuming remaining length < 127 bytes)
        let MQTTconnectPacket = pins.createBuffer(packetSize)
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x10); //Publish Control Packet header
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Protocol Name "MQTT" Length MSB = 0 
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 4); //Protocol Name "MQTT" Length LSB = 4 characters
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x4D); //M
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x51); //Q
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x04); //Protocol Level
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0xC2); //Protocol Flags
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Keep Alive MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 60); //Keep Alive LSB = 60 seconds
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //ClientID Length MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, clientIDLength); //ClientID Length LSB 
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(clientID))
        currentBufferIndex += clientIDLength
        MQTTconnectPacket.setNumber(NumberFormat.UInt16BE, currentBufferIndex, usernameLength);
        currentBufferIndex += 2;
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(username))
        currentBufferIndex += usernameLength;
        MQTTconnectPacket.setNumber(NumberFormat.UInt16BE, currentBufferIndex, apiKeyLength);
        currentBufferIndex += 2;
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(apiKey))
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"SSL\",\"cloud.brilliantlabs.ca\",8883,30\r\n", boardIDGlobal, clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        BLMQTTPacketSend(MQTTconnectPacket)
    }

    // -------------- 3. Cloud ----------------
    //% blockId=subscribeBLMQTT
    //% block="| BL MQTT subscribe to feed $topic"
    //% block.loc.fr="| BL MQTT s'abonner à fil $topic",
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=199   
    //% blockGap=7
    //% deprecated=true
    //% defl="bBoard_WiFi"  
    function subscribeBLMQTT(username: string, apiKey: string, topic: string): void {
        topic = "feeds/" + topic; //append -rsp to the API key as this is the proper subscription topic name
        let currentBufferIndex = 0;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        //remaining length =  PackedID = 2 bytes + topic Length = 2 bytes +  topic = topic.length bytes + QOS = 1 byte
        let remainingLength = 2 + 2 + topic.length + 1;
        //publishPacketSize = subscribe control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let subscribePacketSize = 1 + 1 + remainingLength
        let MQTTsubscribePacket = pins.createBuffer(subscribePacketSize)
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x82); //Subscribe Control Packet header
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Packed ID MSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 1); //Packet ID LSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length >> 8); //Topic (project key) Length MSB 
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length & 0xFF); //Topic (project key) Length LSB
        MQTTsubscribePacket.write(currentBufferIndex, control.createBufferFromUTF8(topic))
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, MQTTsubscribePacket.length - 1, 0); //QOS
        if (isConnected() == false) {
            connectBLMQTT(username, apiKey);
        } 
        BLMQTTPacketSend(MQTTsubscribePacket)
        control.inBackground(function () {
            while (1) {
                basic.pause(10000);
                pingBLMQTT(50)
            }
        })
    }
    let MQTTMessageObject = {
        feedName: "", //Feed name
        value: "" //Value received 
    }
    let mqttMessageList = [MQTTMessageObject]; //Create a blank array of MQTTMessageObject objects
    mqttMessageList.pop();

    export function isBLMQTTMessage(feedName: string): boolean {
        let startIndex = 0;
        let endIndex = 0;
        let remainingLength = 0;
        let topicLength = 0;
        let key: string;
        if (UARTRawData.length > 500) {
            UARTRawData = ""
        }
        if (bBoard_Control.isUARTDataAvailable(boardIDGlobal, clickIDGlobal) || UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
        {
            UARTRawData = UARTRawData + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal); // Retrieve the new data and append it
            let IPDIndex = UARTRawData.indexOf("+IPD,0,") //Look for the ESP WiFi response +IPD which indicates data was received
            if (IPDIndex != -1) //If +IPD, was found 
            {
                startIndex = UARTRawData.indexOf(":") //Look for beginning of MQTT message (which comes after the :)
                if (startIndex != -1) //If a : was found
                {
                    let IPDSizeStr = UARTRawData.substr(IPDIndex + 7, startIndex - IPDIndex - 7) //The length of the IPD message is between the , and the :
                    let IPDSize = parseInt(IPDSizeStr)
                    if (UARTRawData.length >= IPDSize + startIndex + 1) //Is the whole message here?
                    {
                        startIndex += 1; // Add 1 to the start index to get the first character after the ":"
                        if (UARTRawData.charCodeAt(startIndex) != 0x30) //If message type is not a publish packet
                        {
                            UARTRawData = UARTRawData.substr(startIndex); //Remove all data other than the last character (in case there is no more data)
                            return false; //Not a publish packet
                        }
                        startIndex += 1; // Add 1 to the start index to get the remaining length in bytes
                        let remainingLength = UARTRawData.charCodeAt(startIndex)
                        let topicLength = UARTRawData.charCodeAt(startIndex + 2)  //This assumes the topic Length <127 bytes
                        let payloadLength = remainingLength - topicLength - 2; //Assuming 2 bytes for topic length fields 
                        let payloadStr = UARTRawData.substr(startIndex + remainingLength - payloadLength + 1, payloadLength)
                        let receivedFeedName = UARTRawData.substr(startIndex + 3 + 6, topicLength - 6) //remove "feeds/"" 
                        MQTTMessageObject.feedName = receivedFeedName
                        MQTTMessageObject.value = payloadStr
                        mqttMessageList.push(MQTTMessageObject); //Add the latest message to our list
                        UARTRawData = UARTRawData.substr(IPDSize + startIndex) //Remove all data other than the last character (in case there is no more data)
                    }
                }
            }
            else {
                UARTRawData = ""
            }
        }
        let results = mqttMessageList.filter(tempResults => tempResults.feedName === feedName)
        if (results.length >= 1) //If a value was found
        {
            return true;
        }
        return false;
    }

    ////////////
    export function clearSerialBuffer() {
        //   serial.clearRxBuffer()
    }

    let UARTRawData: string
    let BLpingActive = false;
    let prevTime: number;
    let pingActive = false;
    let lastPing = 0;
    function BLMQTTPacketSend(packet: Buffer) {
        clearSerialBuffer()
        bBoard_Control.UARTSendString("AT+CIPSEND=0," + packet.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        bBoard_Control.UARTSendBuffer(packet, boardIDGlobal, clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)
    }

    export function getBLMQTTMessage(feedName: string): string {
        let returnValue: string;
        if (isBLMQTTMessage(feedName)) {
            for (let i = 0; i < mqttMessageList.length; i++) {
                if (mqttMessageList[i].feedName == feedName) {
                    returnValue = mqttMessageList[i].value;
                    mqttMessageList.removeAt(i);
                    return returnValue
                }
            }
        }
        return returnValue = null
    }

    export enum DataType {
        //% block="Number"
        numberType,
        //% block="String"
        stringType
    }

    /**  
    * When new data is published to your BL Cloud feed (feedName) using your
    * username "example: brilliantLabs@gmail.com"
    * and your Project API Key (Select "Users" and the key icon on BL Cloud)
    * the data will be stored in the variable "receivedData" as a String or
    * number depending on your selection
    * @param username to username ,eg: "ex:brilliantlabs@gmail.com"
    * @param apiKey to apiKey ,eg: "ex:312a9205-8675-429f-98c5-023cb8325390"
    * @param feedName to feedName ,eg: "ex:temperature"
    * @param data to data ,eg: 0
    */
    //% blockId=onBLMQTT 
    //% block="on BL MQTT received $dataType $receivedData|feed $feedName|username$username|API Key$apiKey" 
    //% block.loc.fr="sur nuage BL reçu $dataType $receivedData|flux $feedName|nom d'utilisateur$username|API clé$apiKey"
    //% blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% receivedData.shadow=variables_get
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% draggableParameters=variable
    export function onBLMQTT(feedName: string, dataType: DataType, username: string, apiKey: string, a: (receivedData: any) => void): void { //Pass user blocks as a callback export function "a". 
        bBoard_Control.eventInit(bBoardEventsMask.UARTRx, 0, 0) //set on BLiX
        control.onEvent(bBoard_Control.getbBoardEventBusSource(BoardID.zero, BUILT_IN_PERIPHERAL, bBoardEvents.UARTRx), 0, () => BLMQTTEvent(feedName, dataType, a)) //Set interrupt mb
        subscribeBLMQTT(username, apiKey, feedName);
    }

    function BLMQTTEvent(feedName: string, dataType: DataType, a: (data: any) => void) {
        let feedData = getBLMQTTMessage(feedName)
        if (feedData != null) {
            if (dataType == DataType.numberType) {
                a(parseInt(feedData))
            }
            else {
                a(feedData)
            }
        }
    }

    // -------------- 3. Cloud ----------------
    export function pingBLMQTT(pingInterval: number) {
        if (BLpingActive == false) {
            lastPing = input.runningTime();
            let MQTTPingPacket = pins.createBuffer(2);
            MQTTPingPacket.setNumber(NumberFormat.UInt8LE, 0, 0xC0); //Subscribe Control Packet header
            MQTTPingPacket.setNumber(NumberFormat.UInt8LE, 1, 0x00); //Remaining Length = 0 
            BLMQTTPacketSend(MQTTPingPacket)
            BLpingActive = true;
        }
        else //If a ping has been sent
        {
            if ((input.runningTime() - lastPing) > pingInterval * 1000) {
                BLpingActive = false;
            }
        }
    }
    /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     * @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="Connect to ssid $ssid| with password $pwd"
    //%block.loc.fr="connecter à ssid $ssid| avec mot de passe $pwd"
    //% weight=110
    //% group="Initialize and Connect"
    export function WifiConnect(ssid: string, pwd: string): void {
        bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
        bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
        basic.pause(1000)
        bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);
        bBoard_Control.UARTSendString("AT+CWMODE=1\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if (response == 0) {
            while (1) {
                basic.showIcon(IconNames.Sad, 2000)
                basic.showString("WiFi Error #1 CWMODE")
            }
        }
        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n", boardIDGlobal, clickIDGlobal);  //Enable multiple connections
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if (response == 0) {
            while (1) {
                basic.showIcon(IconNames.Sad, 2000)
                basic.showString("WiFi Error #2 CIPMUX")
            }
        }
        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n", boardIDGlobal, clickIDGlobal);  //Connect to WiFi Network
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if (response == 0) {
            while (1) {
                basic.showIcon(IconNames.Sad, 2000)
                basic.showString("WiFi Error #3 CWJAP")
            }
        }
        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);  //Get information about the connection status
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if (response == 0) {
            while (1) {
                basic.showIcon(IconNames.Sad, 2000)
                basic.showString("WiFi Error #4 CIPSTATUS")
            }
        }
        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIFSR\r\n", boardIDGlobal, clickIDGlobal);  //Get local IP Address
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if (response == 0) {
            while (1) {
                basic.showIcon(IconNames.Sad, 2000)
                basic.showString("WiFi Error #5 CIFSR")
            }
        }
    }




// // -------------- 3. Cloud ----------------
//  // //% blockId=WiFi_BLE_HTTPSsendCommand
// // //% block="| BL HTTPS command %command|feed name %feedName|data %data|project key %topic|"
//// //% weight=90
//// //% group="HTTPS"
//// //% subcategory="Brilliant Labs Cloud"
//// //% blockGap=7
///// //% defl="bBoard_WiFi"
// export function HTTPSsendCommand(
//     command:Command,
//     feedName: string,
//     data: number,
//     topic: string
// ): void {
//     let cmd = ''
//     switch(command)
//     {
//         case Command.Add_Data:
//             cmd = "ADD_FEED_DATA";
//             break;
//         case Command.Create_Feed:
//             cmd = "CREATE_FEED";
//             break;     
//         case Command.Delete_Feed:
//             cmd = "DELETE_FEED";
//             break;           
//             case Command.Delete_Feed_Data:
//             cmd = "DELETE_FEED_DATA";
//             break;        
//     }
//     let bodyString = "{\n    \"key\": \""+topic+ "\",\n   \"cmd\": \""+cmd+"\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
//     if(command = Command.Create_Feed)
//     {
//         bodyString = "{\n    \"key\": \""+topic+ "\",\n   \"cmd\": \""+cmd+"\",\n   \"type\": \"LINE\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
//     }
//     let getData ="GET /api? HTTP/1.1\r\n" +
//         "Host: cloud.brilliantlabs.ca\r\n" +
//         "Content-Type: application/json\r\n" +
//         "cache-control: no-cache\r\n" +
//         "Content-Length: "+bodyString.length.toString()+"\r\n\r\n" + bodyString;
//     if( isConnected() == 0){
//         bBoard_Control.UARTSendString("AT+CIPSTART=0,\"SSL\",\"cloud.brilliantlabs.ca\",443\r\n",boardIDGlobal,clickIDGlobal); 
//         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//     }
//     bBoard_Control.UARTSendString(
//         "AT+CIPSEND=0," + getData.length.toString() + "\r\n",boardIDGlobal,clickIDGlobal);
//         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//         bBoard_Control.UARTSendString(getData,boardIDGlobal,clickIDGlobal);
//         response = WiFiResponse("OK", true, defaultWiFiTimeoutmS);
// }
// //% blockId=WiFi_BLE_getVariable
// //% block="| BL HTTPS get feed $feedName with project key$key"
// //% weight=90
// //% group="HTTPS"
// //% subcategory="Brilliant Labs Cloud"
// //% blockGap=7
// //% defl="bBoard_WiFi"
// export function BLgetVariable(
//     feedName: string,
//     key: string
// ): number {
//     let bodyString = "{\n    \"key\": \""+key+ "\",\n   \"cmd\": \"GET_VARIABLE\",\n    \"name\": \""+feedName+"\"\n}";
//     let getData ="GET /api? HTTP/1.1\r\n" +
//         "Host: cloud.brilliantlabs.ca\r\n" +
//         "Content-Type: application/json\r\n" +
//         "cache-control: no-cache\r\n" +
//         "Content-Length: "+bodyString.length.toString()+"\r\n\r\n" + bodyString;
//         if( isConnected() == 0){
//             bBoard_Control.UARTSendString("AT+CIPSTART=0,\"SSL\",\"cloud.brilliantlabs.ca\",443\r\n",boardIDGlobal,clickIDGlobal); 
//             response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//         }
//         bBoard_Control.UARTSendString(
//         "AT+CIPSEND=0," + getData.length.toString() + "\r\n",boardIDGlobal,clickIDGlobal);
//         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//         bBoard_Control.UARTSendString(getData,boardIDGlobal,clickIDGlobal);
//         response = WiFiResponse("OK", true, defaultWiFiTimeoutmS);
//     let startIndex = receivedData.indexOf("\""+feedName+"\":")+feedName.length+3; 
//     let endIndex = receivedData.indexOf("}",startIndex)-1;
//     return parseInt(receivedData.substr(startIndex,endIndex-startIndex+1))
// }

// getThingspeak(channelID: number, fieldNum: number): string {
//     let getData =
//         "GET /channels/" +
//         channelID.toString() +
//         "/fields/" +
//         fieldNum.toString() +
//         ".json?results=1\r\n";
//     let data = "";
//     bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n")
//     response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
//     bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"api.thingspeak.com\",80\r\n"); 
//     response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
//     bBoard_Control.UARTSendString(
//         "AT+CIPSEND=0," + getData.length.toString() + "\r\n"
//     );
//     response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
//     bBoard_Control.UARTSendString(getData);
//     response = WiFiResponse("OK", true, defaultWiFiTimeoutmS); //Wait for the response "OK"
//     data = ThingSpeakResponse();
//     //*** Need to address  Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received
//     // UARTs.bBoard_Control.UARTSendString("AT+CIPCLOSE=0\r\n",boardID)
//     // SetResponseObj.response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK" //Wait for the response "OK"
//     return data;
// }

    ////////////////
    /**
    * Trigger actions on one of your IFTTT Applets using this webhooks block.
    * The event name and API key can be found in your Webhooks documentation on IFTTT
    * @param value1 to value1 ,eg: "ex:1234"
    * @param key to key, eg: "ex:bxJtVBvseCjqROZyeFo7GG"
    * @param eventname to eventname ,eg: "ex:temperature"
    */
    //% blockId=BL_SendIFTTT
    //% block=" IFTTT send$value1 with API key$key to event name$eventname"
    //% block.loc.fr="IFTTT envoyer$value1 avec la clé API$key à l'événement$eventname"
    //% weight=80
    //% subcategory="IFTTT"
    //% group="IFTTT"
    //% blockGap=7
    export function sendIFTTT(
        key: string,
        eventname: string,
        value1: number
    ): void {
        let getData =
            "GET /trigger/" +
            eventname +
            "/with/key/" +
            key +
            "?value1=" +
            value1.toString() +
            " HTTP/1.1\r\nHost: maker.ifttt.com\r\n\r\n";
        bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n", boardIDGlobal, clickIDGlobal); //Multiple connections enabled
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"SSL\",\"maker.ifttt.com\",443\r\n", boardIDGlobal, clickIDGlobal); //Make a TCP connection to the host
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        bBoard_Control.UARTSendString(
            "AT+CIPSEND=0," + getData.length.toString() + "\r\n"
            , boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        bBoard_Control.UARTSendString(getData, boardIDGlobal, clickIDGlobal); //Send the contents of the packet
        response = WiFiResponse("OK", true, defaultWiFiTimeoutmS); //Wait for the response "OK"
        bBoard_Control.UARTSendString("AT+CIPCLOSE=0\r\n", boardIDGlobal, clickIDGlobal); //Close your SSL connection
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    }

    // -------------- 4. MQTT generic ----------------

    /**  
    * Publishes your data to your BL Cloud feed (feedName) using your
    * username "example: brilliantLabs@gmail.com"
    * your password and your server Address
    * @param username to username ,eg: "ex:my user"
    * @param password to password ,eg: "ex:my password"
    * @param serverADD to serverADD ,eg: "ex:ip address"
    * @param feedName to feedName ,eg: "ex:temperature"
    * @param data data
    */

    //% blockId=publishMQTT
    //% block="MQTT publish$data=text|feed$feedName"
    //% block.loc.fr="MQTT publier$data=text|flux$feedName|nom"
    //% group="MQTT"
    //% subcategory="Advanced"
    //% weight=80   
    //% blockGap=7
    //% defl="bBoard_WiFi"  
    // export function publishMQTT(feedName: string, data: number): void {
    //     let currentBufferIndex = 0;
    //     //feedName = "feeds/" + feedName;
    //     let mqttBody = data.toString();
    //     //remaining length =  topic Length = 2 bytes +  topic = topic.length bytes + mqttBody.length bytes
    //     let remainingLength = 2 + feedName.length + mqttBody.length;
    //     //publishPacketSize = control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
    //     let publishPacketSize = 1 + 1 + remainingLength
    //     let MQTTpublishPacket = pins.createBuffer(publishPacketSize)
    //     MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x30); //Publish Packet header
    //     MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
    //     MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length >> 8); //Topic (project key) Length MSB 
    //     MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length & 0xFF); //Topic (project key) Length LSB
    //     MQTTpublishPacket.write(currentBufferIndex, control.createBufferFromUTF8(feedName + mqttBody))
    //     BLMQTTPacketSend(MQTTpublishPacket);


    export function publishMQTT(feedName: string, data: any): void {
        let currentBufferIndex = 0;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        let mqttBody: string;
        if (typeof data == 'string') {
            mqttBody = data;
        }
        else if (typeof data == 'number') {
            mqttBody = data.toString();
        }
        else {
            mqttBody = "Invalid Data Type Passed";
        }
        //remaining length =  topic Length = 2 bytes +  topic = topic.length bytes + mqttBody.length bytes
        let remainingLength = 2 + feedName.length + mqttBody.length;
        //publishPacketSize = control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let publishPacketSize = 1 + 1 + remainingLength
        let MQTTpublishPacket = pins.createBuffer(publishPacketSize)
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x30); //Publish Packet header
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length >> 8); //Topic (project key) Length MSB 
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, feedName.length & 0xFF); //Topic (project key) Length LSB
        MQTTpublishPacket.write(currentBufferIndex, control.createBufferFromUTF8(feedName + mqttBody))
        if (isConnected() == false) {    
            basic.showIcon(IconNames.Sad, 1000)
            basic.showString("MQTT Error #1 WiFi connection")
            basic.pause(1000)
        } else {
            BLMQTTPacketSend(MQTTpublishPacket);
            basic.pause(200)
        }
    }

    // -------------- 3. Cloud ----------------
    //% blockId=connectMQTT
    //% block="MQTT connect with server$serverADD username$username and Key$password "
    //% block.loc.fr="MQTT connecter avec server$serverADD nom d'utilisateur$username et API clé%APIKey"
    //% group="MQTT"
    //% subcategory="Advanced"
    //% weight=200   
    //% blockGap=7
    //% defl="bBoard_WiFi" 

    export function connectMQTT(username: string, password: string, serverADD: string): void {
        let currentBufferIndex = 0;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        let clientID = control.deviceSerialNumber().toString()
        let clientIDLength = clientID.length
        let usernameLength = username.length
        let passwordLength = password.length
        let remainingLength = clientIDLength + 12 + usernameLength + passwordLength + 4;
        let packetSize = remainingLength + 1 + 1; //Remaining length + 1 byte for control packet + 1 byte for remaining length byte (Note: assuming remaining length < 127 bytes)
        let MQTTconnectPacket = pins.createBuffer(packetSize)
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x10); //Publish Control Packet header
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Protocol Name "MQTT" Length MSB = 0 
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 4); //Protocol Name "MQTT" Length LSB = 4 characters
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x4D); //M
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x51); //Q
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x04); //Protocol Level
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0xC2); //Protocol Flags
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Keep Alive MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 60); //Keep Alive LSB = 60 seconds
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //ClientID Length MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, clientIDLength); //ClientID Length LSB 
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(clientID))
        currentBufferIndex += clientIDLength
        MQTTconnectPacket.setNumber(NumberFormat.UInt16BE, currentBufferIndex, usernameLength);
        currentBufferIndex += 2;
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(username))
        currentBufferIndex += usernameLength;
        MQTTconnectPacket.setNumber(NumberFormat.UInt16BE, currentBufferIndex, passwordLength);
        currentBufferIndex += 2;
        MQTTconnectPacket.write(currentBufferIndex, control.createBufferFromUTF8(password))
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+serverADD+"\",1883,30\r\n", boardIDGlobal, clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        BLMQTTPacketSend(MQTTconnectPacket)
        control.inBackground(function () {
            while (1) {
                basic.pause(30000);
                pingBLMQTT(50)    
            }
        })

    }

    /**  
    * When new data is published to your feed (feedName) using your
    * username "example: brilliantLabs@gmail.com"
    * and your Project API Key (Select "Users" and the key icon on BL Cloud)
    * the data will be stored in the variable "receivedData" as a String or
    * number depending on your selection
    * @param username to username ,eg: "ex:brilliantlabs@gmail.com"
    * @param apiKey to apiKey ,eg: "ex:312a9205-8675-429f-98c5-023cb8325390"
    * @param feedName to feedName ,eg: "ex:temperature"
    * @param data to data ,eg: 0
    * @param server to server ,eg: "ex:ip address"
    */
    //% blockId=onMQTT 
    //% block="on MQTT received $dataType $receivedData|feed $feedName|username$username|API Key$apiKey|server $server" 
    //% block.loc.fr="sur nuage reçu $dataType $receivedData|flux $feedName|nom d'utilisateur$username|API clé$apiKey|server $server"
    //% blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% receivedData.shadow=variables_get
    //% group="MQTT"
    //% subcategory="Advanced"
    //% draggableParameters=variable
    export function onMQTT(feedName: string, dataType: DataType, username: string, apiKey: string, server: string, a: (receivedData: any) => void): void { //Pass user blocks as a callback export function "a". 
        bBoard_Control.eventInit(bBoardEventsMask.UARTRx, 0, 0) //set on BLiX
        control.onEvent(bBoard_Control.getbBoardEventBusSource(BoardID.zero, BUILT_IN_PERIPHERAL, bBoardEvents.UARTRx), 0, () => MQTTEvent(feedName, dataType, a)) //Set interrupt mb
        subscribeMQTTgen(username, apiKey, feedName, server);
    }

    function MQTTEvent(feedName: string, dataType: DataType, a: (data: any) => void) {
        let feedData = getMQTTMessagegen(feedName)
        if (feedData != null) {
            if (dataType == DataType.numberType) {
                a(parseInt(feedData))
            }
            else {
                a(feedData)
            }
        }
    }


    // -------------- 3. Cloud ----------------
    //% blockId=subscribeMQTTgen
    //% block="|MQTT subscribe to topic $topic"
    //% group="MQTT"
    //% subcategory="Advanced"
    //% weight=90   
    //% blockGap=7
    //% deprecated=true
    //% defl="bBoard_WiFi" 
    export function subscribeMQTTgen(username: string, apiKey: string, topic: string, server: string): void {
        topic = topic; //append -rsp to the API key as this is the proper subscription topic name
        let currentBufferIndex = 0;
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        //remaining length =  PackedID = 2 bytes + topic Length = 2 bytes +  topic = topic.length bytes + QOS = 1 byte
        let remainingLength = 2 + 2 + topic.length + 1;
        //publishPacketSize = subscribe control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let subscribePacketSize = 1 + 1 + remainingLength
        let MQTTsubscribePacket = pins.createBuffer(subscribePacketSize)
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x82); //Subscribe Control Packet header
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Packed ID MSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 1); //Packet ID LSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length >> 8); //Topic (project key) Length MSB 
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length & 0xFF); //Topic (project key) Length LSB
        MQTTsubscribePacket.write(currentBufferIndex, control.createBufferFromUTF8(topic))
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, MQTTsubscribePacket.length - 1, 0); //QOS
        if (isConnected() == false) {
            connectMQTT(username, apiKey, server);
        } 
        BLMQTTPacketSend(MQTTsubscribePacket)
        control.inBackground(function () {
            while (1) {
                basic.pause(10000);
                pingBLMQTT(50)
            }
        })
    }

    

    // -------------- 3. Cloud ----------------
    //% blockId=getMQTTMessagegen
    //% block="MQTT get message"
    //% group="MQTT"
    //% subcategory="Advanced"
    //% weight=70   
    //% blockGap=7
    //% defl="bBoard_WiFi" 
    export function getMQTTMessagegen(feedName: string): string {
        let returnValue: string;
        if (isMQTTMessagegen(feedName)) {            
            for (let i = 0; i < mqttMessageListgen.length; i++) {
                if (mqttMessageListgen[i].feedName == feedName) {
                    returnValue = mqttMessageListgen[i].value;
                    mqttMessageListgen.removeAt(i);
                    return returnValue
                }
            }
        }
        return returnValue = null
    }

    let MQTTMessageObjectgen = {
        feedName: "", //Feed name
        value: "" //Value received 
    }
    let mqttMessageListgen = [MQTTMessageObjectgen]; //Create a blank array of MQTTMessageObject objects
    mqttMessageListgen.pop();


    // -------------- 3. Cloud ----------------
    //% blockId=isMQTTMessagegen
    //% block="MQTT is message available?"
    //% group="MQTT"
    //% subcategory="Advanced"
    //% weight=70   
    //% blockGap=7
    //% defl="bBoard_WiFi"
    export function isMQTTMessagegen(feedName: string): boolean {
        let startIndex = 0;
        let endIndex = 0;
        let remainingLength = 0;
        let topicLength = 0;
        let key: string;
        if (UARTRawData.length > 500) {
            UARTRawData = ""
        }
        if (bBoard_Control.isUARTDataAvailable(boardIDGlobal, clickIDGlobal) || UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
        {
            UARTRawData = UARTRawData + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal); // Retrieve the new data and append it
            let IPDIndex = UARTRawData.indexOf("+IPD,0,") //Look for the ESP WiFi response +IPD which indicates data was received
            if (IPDIndex != -1) //If +IPD, was found 
            {
                startIndex = UARTRawData.indexOf(":") //Look for beginning of MQTT message (which comes after the :)
                if (startIndex != -1) //If a : was found
                {
                    let IPDSizeStr = UARTRawData.substr(IPDIndex + 7, startIndex - IPDIndex - 7) //The length of the IPD message is between the , and the :
                    let IPDSize = parseInt(IPDSizeStr)
                    if (UARTRawData.length >= IPDSize + startIndex + 1) //Is the whole message here?
                    {
                        startIndex += 1; // Add 1 to the start index to get the first character after the ":"
                        if (UARTRawData.charCodeAt(startIndex) != 0x30) //If message type is not a publish packet
                        {
                            UARTRawData = UARTRawData.substr(startIndex); //Remove all data other than the last character (in case there is no more data)
                            return false; //Not a publish packet
                        }
                        startIndex += 1; // Add 1 to the start index to get the remaining length in bytes
                        let remainingLength = UARTRawData.charCodeAt(startIndex)
                        let topicLength = UARTRawData.charCodeAt(startIndex + 2)  //This assumes the topic Length <127 bytes
                        let payloadLength = remainingLength - topicLength - 2; //Assuming 2 bytes for topic length fields 
                        let payloadStr = UARTRawData.substr(startIndex + remainingLength - payloadLength + 1, payloadLength)
                        let receivedFeedName = UARTRawData.substr(startIndex + 3, topicLength) 


                        MQTTMessageObjectgen.feedName = receivedFeedName
                        MQTTMessageObjectgen.value = payloadStr
                        mqttMessageListgen.push(MQTTMessageObjectgen); //Add the latest message to our list
                        UARTRawData = UARTRawData.substr(IPDSize + startIndex) //Remove all data other than the last character (in case there is no more data)
                    }
                }
            }
            else {
                UARTRawData = ""
            }
        }
        let results = mqttMessageListgen.filter(tempResults => tempResults.feedName === feedName)
        if (results.length >= 1) //If a value was found
        {
            return true;
        }
        return false;
    }

    //% blockId=pingMQTT
    //% block="$this MQTT ping interval $pingInterval"
    //% block.loc.fr="$this MQTT ping interval $pingInterval"
    //% weight=110 
    //% advanced=false
    //% group="MQTT"
    //% subcategory="Advanced"
    //% this.shadow=variables_get
    //% this.defl="pingMQTT"
    export function pingMQTT(pingInterval: number) {
        if (pingActive == false) {
            lastPing = input.runningTime();
            let controlPacket = pins.createBuffer(1);
            controlPacket.setNumber(NumberFormat.UInt8LE, 0, 0xC0); //Subscribe Control Packet header
            let remainingLength = pins.createBuffer(1) //size of remaining Length packet
            remainingLength.setNumber(NumberFormat.UInt8LE, 0, 0x00); //Remaining Length = 0 
            bBoard_Control.UARTSendString("AT+CIPSEND=0,2\r\n", boardIDGlobal, clickIDGlobal)
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
            bBoard_Control.UARTSendBuffer(controlPacket, boardIDGlobal, clickIDGlobal);
            bBoard_Control.UARTSendBuffer(remainingLength, boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
            pingActive = true;
        }
        else //If a ping has been sent
        {
            if ((input.runningTime() - lastPing) > pingInterval * 1000) {
                pingActive = false;
            }
        }
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

    //% blockId=isConnected
    //% block="$this WIFI IS connected"
    //% block.loc.fr="$this WiFi est connecté?"
    //% weight=110 
    //% advanced=false
    //% group="MQTT"
    //% subcategory="More"
    //% this.shadow=variables_get
    //% this.defl="isConnected"
    export function isConnected(): boolean {
        bBoard_Control.UARTSendString("AT+CWSTATE?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse
        ("OK", false, defaultWiFiTimeoutmS);
        let statusStartIndex = receivedData.indexOf("STATUS:")
        let connected = parseInt(receivedData.substr(statusStartIndex + 7, 1)); //Convert the characters we received representing the length of the IPD response to an integer
        if (connected == 4) {
            return true;
        }
        return false;
    }

}
























//------------------------- CYBERSECURITY -----------------------------------
/** Cybersecurity */
//% block="CyberSecurity"
//% block.loc.fr="Cybersécurité"
//% advanced=true
//% weight=100 color=#9E4894 icon="\uf21b"      //LOGO CYBER
//% labelLineWidth=1001
//% groups="['Networking', 'Valuable Date', 'Remote Comands']"

//------------------------- Networking -----------------------------------   

 namespace Cybersec {

//--------------------- Initialize and Connections ----------------------    
    
    /* Secuence Animation */ 
    /** | >> Es << | Show a lighting secuence on bBoard´s BLiXels and sound "twinkle".
        | >> Fr << | Montrer une séquence d'éclairage sur les BLiXels de bBoard et le son "twinkle". 
    */
        //% blockId="Secuence Animation" 
        //% block="Secuence BLiXels on bBoard"
        //% block.loc.fr="BLiXels de secuence au bBoard"
        //% advanced=false
        //% group="Initialize and Connections" 
        //% weight=100 
            export function Animation() {        
                soundExpression.twinkle.play()
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));                             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));                             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));              
            }

    /* Coding Check bBoard */ 
    /** | >> Es << | Turn on bBoard BLiXel to be notified when your code crosses this point.
        | >> Fr << | Activez le BLixel bBoard pour être averti lorsque votre code franchit ce point.
        * @param pixelONset position of the BLiXel in bBoard
    */
        //% blockId="Coding Check bBoard" 
        //% block="bBoard BliXel $pixelONset=BLiXel_Index to check your code crosing here. "
        //% block.loc.fr="bBoard BliXel $pixelONset=BLiXel_Index pour vérifier votre code qui se croise ici."            //% advanced=false
        //% advanced=false
        //% group="Initialize and Connections" 
        //% weight=100  
            export function setBLCode(pixelONset: number): void {       
                let BLiXelBuffer = pins.createBuffer(5);
                if (pixelONset >= 5)
                {
                    pixelONset = 4;
                }
                BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0,0xFF00FF)                           // Purple = 0xFF00FF
                BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixelONset)
                bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null, BLiXelBuffer,0)
                bBoard_Control.sendData (parseInt(clickIOPin.PWM.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)//Show
//                basic.pause(300) 
//                BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0,0x000000)// Black = 0x000000
//                BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixelONset)
//                bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null, BLiXelBuffer,0)
//                bBoard_Control.sendData (parseInt(clickIOPin.PWM.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)//Show
            }

    /* WiFi Connection */
    /** | >> Es << | Initializes WiFi capabilities. bBoard power switch should be ON.
        | >> Fr << | Initialise les capacités WiFi. bBoard l'interrupteur d'alimentation de la carte doit être sur ON.         
        * @param ssid to ssid, eg: "BrilliantLabs AP"           
        * @param pwd to ssid, eg: "CYBERSEC"
    */
        //% blockId="Wifi Connection" 
        //% block="Connect to WiFi: $ssid| with Password: $pwd"
        //% block.loc.fr="Connexion au WiFi : $ssid| avec mot de passe :$pwd"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WifiConnect(ssid: string, pwd: string): void { 

                control.waitMicros(4)                                                                   // Enable Console to display info

                bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
                bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
                basic.pause(1000)
                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);    
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal);            // Reset previous WiFi//Disconnect the created conextion,                  
                // Animation using BLiXel
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20);
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); 
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                
                bBoard_Control.UARTSendString("AT+CWMODE=1\r\n", boardIDGlobal, clickIDGlobal);
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);                               // Wait for the response "OK" 
    
                bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n", boardIDGlobal, clickIDGlobal);         // Enable multiple connections
                response = WiFiResponse("OK",false,CyberWiFiTimeoutmS); 
                
                bBoard_Control.UARTSendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n", boardIDGlobal, clickIDGlobal); //Connect to WiFi Network
                response = WiFiResponse("OK",false,CyberWiFiTimeoutmS);

                bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);    // Mode 0 = Active (data receive instantly to MCU),  Mode 1 = Passive (data reveice keep in socket)
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);

                bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);        // CHECK NO connection MAKE INFINITE LOOP you have to reset bBoard
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
                
                if (response==0){                                                                       // WiFi Error 
                    serial.writeLine("Done! AP available? Error Try Again") 
                    basic.showIcon(IconNames.Sad, 400)  
                    basic.showString("Error AP not available Try Again")
                    basic.pause(1000)
                }
                else{                                                                                   // WiFI Connected
                    basic.pause(300)
                    serial.writeLine("") 
                    serial.writeLine("(Connected!)")
                    basic.showLeds(`
                    . . . . .
                    . . . . # 
                    . # . # .
                    . . # . .
                    . . . . .
                    `)  
                    basic.pause(300)
                    basic.clearScreen()              
  //              Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
  //              Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
  //              Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));             
  //              Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
  //              Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));      
                }
            }
            
    /* WiFi Off */
    /** | >> Es << | Turn off Wi-Fi capabilities; to reestablish, you need to turn off and then turn on the board again.
        | >> Fr << | Désactivez les capacités Wi-Fi; pour les rétablir, vous devez éteindre puis rallumer le bBoard.      
    */
        //% blockId="WiFi Off"
        //% block="WiFi Off"
        //% block.loc.fr="désactiver le wifi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WiFi_OFF(): void {
                serial.writeLine("" + "bBoard->" + "")     // Always to publish in Console, the last "" completes the line to send and show
                
                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
                bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
                bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion,
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
                serial.writeLine("WiFi Off" + "")
            }          
       
    /* WiFi Reset */
    /** | >> Es << | Reset Wi-Fi capabilities. You need to enter WiFi information. 
        | >> Fr << | Réinitialiser les capacités Wi-Fi. Vous devez saisir les informations relatives au Wi-Fi.      
    */
        //% blockId="WiFi Reset"
        //% block="WiFi Reset"
        //% block.loc.fr="Réinitialiser le Wi-Fi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WiFi_RST(): void {
                serial.writeLine("" + "bBoard->" + "")     // Always to publish in Console, the last "" completes the line to send and show

                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
                bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
                bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
                bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32 
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion,
                bBoard_Control.UARTSendString("AT+CWAUTOCONN=0\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
                bBoard_Control.UARTSendString("AT+RESTORE\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
                bBoard_Control.UARTSendString("AT+RST\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS); //Wait for the response "OK" 
                basic.pause(300)                    // Delay to publish in console
                serial.writeLine("WiFi Reset" + "")
            }  
        
    /* WiFi Disconnect */
    /** | >> Es << | Discconect from the current WiFi.
        | >> Fr << | Se déconnecter du réseau Wi-Fi actuel.      
    */
        //% blockId="WiFi Disconnect"
        //% block="WiFi Disconnect"
        //% block.loc.fr="Déconnexion du WiFi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100 
            export function Disconnect():void {
                serial.writeLine("" + "bBoard->" + "")     // Always to publish in Console, the last "" completes the line to send and show

                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
                bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32  
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS); //Wait for the response "OK" 
                basic.pause(300)                    // Delay to publish in console
                serial.writeLine("Disconnected" + "")
        }

    /* WiFi Check  */
    /** | >> Es << | Check the WiFi status. 
        | >> Fr << | Vérifiez l'état du WiFi. 
        | >> 
        #O: The ESP32 station is not initialized. 
        #1: THe ESP32 station is initialized, but not started a Wi-Fi connection yet. 
        #2: The ESP32 station is connected to an AP and its IP address is obteined.  
        #3: The ESP32 station has created a TCP/SSL transmission. 
        #4: All of the TCO/UPD/SSL connections of th ESP32 station are disconnected. 
        #5: The ESP32 station started a WiFi connection, but was not connected to an AP or disconnected from an AP.
        << |
        */
        //% blockId="WiFi Check"
        //% block="the bBoard WiFi is Connected"
        //% block.loc.fr="le WiFi du bBoard est connecté"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100 
            export function WiFi_Connected(): boolean {
                pause(3000)    
                bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal); 
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS); 
                let statusStartIndex = receivedData.indexOf("STATUS:")
                let connected = parseInt(receivedData.substr(statusStartIndex + 7, 1)); //Convert the characters we received representing the length of the IPD response to an integer        
                if (connected == 0){                                // O:The ESP32 station is not initialized
                    while (1){
                    basic.showLeds(`
                    . . . . .
                    . # . # .
                    . . # . .
                    . # . # .
                    . . . . .
                    `)
//                    basic.showString("#0")
                    serial.writeLine("IsConnected? Error #0")
                    serial.writeLine("") 
                    return false;
                }}
                if (connected == 1){                                // 1: THe ESP32 station is initialized, but not started a Wi-Fi connection yet
                    while (1){
                    basic.showLeds(`
                    . . . . .
                    . # . # .
                    . . # . .
                    . # . # .
                    . . . . .
                    `)
//                    basic.showString("#1")
                    serial.writeLine("IsConnected? Error #1")
                    serial.writeLine("")  
                    return false;
                }}
                if (connected == 2){                                // 2: The ESP32 station is connected to an AP and its IP address is obteined.    
                    while (1){
                    basic.showLeds(`
                    . . . . .
                    . . . . # 
                    . # . # .
                    . . # . .
                    . . . . .
                    `)
//                    basic.showString("#2")                
                    serial.writeLine("IsConnected? OK #2")
                    serial.writeLine("")  
                    return true;
                }}
                if (connected == 3){                                // 3: The ESP32 station has created a TCP/SSL transmission.
                    while (1){
                    basic.showLeds(`
                    . . . . #
                    . # . # . 
                    . . # . .
                    . . . . .
                    . . . . .
                    `)
//                    basic.showString("#3")
                    serial.writeLine("IsConnected? OK #3")
                    serial.writeLine("")  
                    return true;
                }}
                if (connected == 4){                                // 4: All of the TCO/UPD/SSL connections of th ESP32 station are disconnected
                    while (1){
                    basic.showIcon(IconNames.Sad,400)
//                    basic.showString("#4")
                    serial.writeLine("IsConnected? Error #4")
                    serial.writeLine("")  
                    return false;
                }}
                if (connected == 5){                                // 5: The ESP32 station started a WiFi connection, but was not connected to an AP or disconnected from an AP
                    while (1){
                    basic.showIcon(IconNames.Sad, 400)
//                    basic.showString("#5")
                    serial.writeLine("IsConnected? Error #5")
                    serial.writeLine("")  
                    return false;
                }}
                basic.showIcon(IconNames.Sad, 400)
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));        
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
                serial.writeLine("IsConnected? NO")
                serial.writeLine("")  
                return false;
            }
    
    /* Signal Strength */
    /** | >> Es << | Get the signal strength from bBoard to the access point. 
        | >> Fr << | Obtenir la force du signal entre le bBoard et le point d'accès.
        | >> 
        Excellent > -60. 
        Good -61 to -75. 
        Fair -76 to -80. 
        Bad -81 to -89. 
        Very bad <-90.
         << |
    */
        //% blockId="SignalStrength"
        //% block="$this Get the signal strength"
        //% block.loc.fr="$this Obtenir la force du signal"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% receivedData.shadow=variables_get
        //% draggableParameters=variable
        export function getSignalStrength(): string {
            bBoard_Control.UARTSendString("AT+CWJAP?\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);//CyberWiFiConsoleTimeoutmS=1000
            serial.writeLine("RRSI is: " + receivedData.substr(53, 3) + "")
            return("RSSI:" + receivedData.substr(53, 3))
        }

//------------------------- Networking -----------------------------------  

    /* MAC Address bBoard */
    /** | >> Es << | Display the bBoard MAC Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse MAC du bBoard sur le PC de la console et sur l'écran du Micro:Bit. 
    */
        //% blockId="GetMACbBoard"
        //% block="$this Get MAC bBoard"
        //% block.loc.fr="$this Obtenir le MAC bBoard"
        //% advanced=false
        //% group="Networking"        
        //% weight=100 

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="Get_MAC_bBoard"
        export function getMACaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CWJAP?\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);//CyberWiFiConsoleTimeoutmS=1000
            serial.writeLine("MAC bBoard: " + receivedData.substr(32, 17) + "")
            return("MAC bBoard:" + receivedData.substr(32,17));
        }
        
    /* MAC Address AP */
    /** | >> Es << | Display the bBoard access point MAC Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse point d'accès MAC du bBoard sur le PC de la console et sur l'écran du Micro:Bit. 
     */
        //% blockId=GetMACAP
        //% block="$this Get MAC AP"
        //% block.loc.fr="$this Obtenir le MAC AP"
        //% advanced=false
        //% group="Networking"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="MAC_AP"
        export function getMACaddressAP(): string {
            bBoard_Control.UARTSendString("AT+CIPAPMAC?\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);
            serial.writeLine("MAC AP: " + (receivedData.substr(25,17)) + "")
            return("MAC AP:" + receivedData.substr(25,17));
    }
        
    /* IP Address bBoard */   
    /** | >> Es << | Display the bBoard IP Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse IP du bBoard sur le PC de la console et sur l'écran du Micro:Bit. 
     */
        //% blockId="GetIPBoard"
        //% block="$this Get IP bBoard"
        //% block.loc.fr="$this Obtenir le IP bBoard"
        //% advanced=false
        //% group="Networking"        
        //% weight=100 

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="IP_bBoard"
        export function getIPaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);
            serial.writeLine("IP bBoard: " + (receivedData.substr(24,11)) + "")
            return("IP bBoard:" + receivedData.substr(24,11));//20,17
        }
        
    /* IP Address AP */
    /** | >> Es << | Display the access point IP Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse IP du point d'accès sur le PC de la console et sur l'écran du Micro:Bit. 
    */
        //% blockId="GetIPAP"
        //% block="$this Get IP AP"
        //% block.loc.fr="$this Obtenir le IP AP"
        //% advanced=false
        //% group="Networking"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="IP_bBoard"
        export function getIPaddressAP(): string {
            bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);
            serial.writeLine("IP AP: " + (receivedData.substr(22,11)) + "")
            return("IP AP:" + receivedData.substr(22,11));//18,17
        }
    
//------------------------- More -----------------------------------     
    
    /* Firmware ESP32 */
    /** | >> Es << | Display the ESP32 firmware version. 
        | >> Fr << | Affichez la version du firmware de l'ESP32. 
        | >>  We strongly recommend version 3.2 or higher.  << |
    */
        //% blockId="GetFirmwareESP32"
        //% block="$this Get firmware ESP32 on bBoard"
        //% block.loc.fr="$this Télécharger le firmware ESP32 sur la bBoard"
        //% advanced=true
        //% group="Networking"
        //% weight=100 
       
        //% afterOnStart=true 
        //% this.shadow=variables_get
        //% this.defl="getFirmwareESP32"
        export function getFirmwareESP32(): string {
            bBoard_Control.UARTSendString("AT+GMR\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
            serial.writeLine("ESP32 V.: "+(receivedData.substr(19,3)))
            basic.showString("ESP32 V.:" + receivedData.substr(19,3))
            return(receivedData.substr(19,3));
        }

    // Set here to publis  BLiXel ON 
        export function setPixelColourON(pixelONset: number): void {       
            let BLiXelBuffer = pins.createBuffer(5);
            if (pixelONset >= 5)
            {
                pixelONset = 4;
            }
            BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0,0xFF00FF)// Purple = 0xFF00FF
            BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixelONset)
            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null, BLiXelBuffer,0)
            bBoard_Control.sendData (parseInt(clickIOPin.PWM.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)//Show
        }

    // Set here to publis  BLiXel OFF         
        export function setPixelColourOFF(pixelOFFset: number): void {       
            let BLiXelBuffer = pins.createBuffer(5);
            if (pixelOFFset >= 5)
            {              
                pixelOFFset = 4;
            }
            BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0,0x000000)// Black = 0x000000
            BLiXelBuffer.setNumber(NumberFormat.UInt8LE, 4, pixelOFFset)
            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_PIXEL, null, BLiXelBuffer,0)
            bBoard_Control.sendData (parseInt(clickIOPin.PWM.toString()), moduleIDs.BLiXel_module_id, BLiXel_SHOW, [],0,0)//Show
        }
        
//------------------------- Valuable Date -----------------------------------  


    //* Set HostName */
    /** | >> Es << | Configure your HostName for the network. Others can then use this name to perform a PING.. 
        | >> Fr << | Configurez votre nom d'hôte pour le réseau. D'autres personnes peuvent ensuite utiliser ce nom pour effectuer un PING.              
        | >> It can be use as a "Role" into the Cyberville.  << |
        * @param HNamebB to HNamebB, eg: "SCHOOL"
    */
        //% blockId="SetHostName"
        //% block="HostName: $HNamebB"
        //% block.loc.fr="Nom d'hôte: $HNamebB"
        //% advanced=false
        //% group="Valuable Date"      
        //% weight=100
        
        export function HostNamebB(HNamebB:string):void{
            bBoard_Control.UARTSendString("AT+CWDHCP=1,1\r\n", boardIDGlobal, clickIDGlobal);                           // ENABLE DHCP with softAP
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);

            bBoard_Control.UARTSendString("AT+CIPDNS=0\r\n", boardIDGlobal, clickIDGlobal);                             // Enable DNS automatic
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);

            bBoard_Control.UARTSendString("AT+MDNS=1,\""+HNamebB+"\",\"_http\",80\r\n", boardIDGlobal, clickIDGlobal);  // Set MDNS same name Hostname
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
        
            bBoard_Control.UARTSendString("AT+CIPDNS?\r\n", boardIDGlobal, clickIDGlobal);                              // Query DNS server info
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
//serial.writeLine(""+(receivedData))

            bBoard_Control.UARTSendString("AT+CWHOSTNAME=\"" + HNamebB+ "\"\r\n", boardIDGlobal, clickIDGlobal);        // Set Hostname
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);        
//serial.writeLine(""+(receivedData))

            bBoard_Control.UARTSendString("AT+CIPDNS?\r\n", boardIDGlobal, clickIDGlobal);                              // Query DNS server info
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
//serial.writeLine("" + (receivedData))
                 
            serial.writeLine("HostName: "+(HNamebB))
        }

    /* PING IP */
    /** | >> Es << | Do PING to a IP address.  If the destination responds, you will see a smiley face; otherwise, a sad face. 
        *| >> Fr << | Faites un PING vers une adresse IP.  Si la destination répond, vous verrez un smiley ; sinon, un visage triste.
        *| >> The response time should not exceed 10 seconds  << |
        * @param PingbB to PingbB, eg: "192.168.4.1"
    */
        //% blockId="PINGIP"
        //% block="Do PING to IP: $PingbB"
        //% block.loc.fr="Effectuez un PING vers l'IP: $PingbB"
        //% advanced=false
        //% group="Valuable Date"      
        //% weight=100
        export function PingbBfrend(PingbB:string):void{  
            bBoard_Control.UARTSendString("AT+PING=\"" + PingbB +"\"\r\n", boardIDGlobal, clickIDGlobal); 
//  serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK",false,10000);//defaultWiFiTimeoutmS=30000
            serial.writeLine("" + (receivedData))
            if (receivedData == "TIMEOUT"){
                basic.showIcon(IconNames.No,2000) 
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to IP: "+ PingbB)
            }
            if (response == 1) {                                //RESPONSE ==1 connected
                basic.showIcon(IconNames.Happy,2000)
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to IP: "+ PingbB)
            }
            if (response == 0) {   
                basic.showIcon(IconNames.Sad,2000)            //response ==0 NO conected
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to IP: "+ PingbB)
            }
        }
                   
    /* PING HostName*/
    /** | >> Es << | Do PING to a HostName.  If the destination responds, you will see a smiley face; otherwise, a sad face. 
        *| >> Fr << | Faites un PING vers une nom d'hôte.  Si la destination répond, vous verrez un smiley ; sinon, un visage triste.
        *| >> The response time should not exceed 10 seconds  << |
        * @param PingbBDNS to PingbBDNS ,eg: "WiFi_BL"
        */
        //% blockId="PingHostName"
        //% block="Do PING to DNS: $PingbBDNS"
        //% block.loc.fr="Effectuez un PING vers l' nom d'hôte: $PingBDNS"
        //% advanced=false
        //% group="Valuable Date"      
        //% weight=100 
        export function PingbBDNS(PingbBDNS:string):void{
            let dnslocal=PingbBDNS+".local"
            serial.writeLine("dnslocal is: " + dnslocal)
//         bBoard_Control.UARTSendString("AT+PING=\"" + PingbBDNS+"\"+\".local\"\r\n", boardIDGlobal, clickIDGlobal); 
            bBoard_Control.UARTSendString("AT+PING=\"dnslocal\"\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK",false,10000);//defaultWiFiTimeoutmS=30000
serial.writeLine("" + (receivedData))
            
            if (receivedData == "TIMEOUT"){
                basic.showIcon(IconNames.No,2000) 
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to HostName: "+ PingbBDNS)
            }
            if (response == 1) {                                //RESPONSE ==1 connected
                basic.showIcon(IconNames.Happy,2000)
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to HostName: "+ PingbBDNS)
            }
            if (response == 0) {   
                basic.showIcon(IconNames.Sad,2000)              //response ==0 NO conected
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to HostName: "+ PingbBDNS)
            }
        }

    /* Read HostName */
    /** | >> Es << | Display your current HostName.  
        *| >> Fr << | Affichez votre nom d'hôte actuel.
        *| >> The default HostName is espressif wich is the the manufacturer of ESP32<< |
    */       
        //% blockId="ReadHostName"
        //% block="$this Get your HostName"
        //% block.loc.fr="$this Obtenez votre nom d'hôte"
        //% advanced=false
        //% group="Valuable Date"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% receivedData.shadow=variables_get
        //% draggableParameters=variable       
        export function getHostNamebB(): string {
            bBoard_Control.UARTSendString("AT+CWHOSTNAME?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
            serial.writeLine("HostName: "+(receivedData.substr(28,10))) 
            return("HostName:"+receivedData.substr(28,10));
        }













}  //Here END Cyberville 1






//DON´T for Cyberville 1



////------------------------- Remote Comands -----------------------------------
//    //% block 
//    //% group="Activity 9-Remote Commands"
//    //% icon="\uf7c0"
    
///**  Send Data
//    * @param IPAdd to IPAdd, eg: "192.168.4.1"
//    * @param MSG to MSG, eg:"on?"
//    */
//    //% block="For IP number: $IPAdd | send data: $MSG"
//    //% blockId=Wifi_Send_Message
//    //% weight=110
//    //% group="Remote Commands"
//    export function send_MSG_MPCR(IPAdd: string, MSG:string): void {

//        //Getting my IP address
//        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//        response = WiFiResponse("OK", false, 300);//use OJJO300 00ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        let ipStartIndex = receivedData.indexOf("ip:")
//        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
////        serial.writeLine("My IP is:"+MyIP)//Print my IP address idex       
       
//        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long       

//        let MSGS = "GET /"+MSG+"\r"     // This is the message to send.   the last \r means end of tha line sended, Carriage Return
//        let LENMSGS = MSG.length+7      // Size message     

//        bBoard_Control.UARTSendString("AT+CIPSEND=0,"+LENMSGS+"\r\n", boardIDGlobal, clickIDGlobal); //s add \r to the packet 
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK
        
//        bBoard_Control.UARTSendString(MSGS, boardIDGlobal, clickIDGlobal); //Send the contents of the packet              
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK
//        serial.writeLine("Sending... "+MSGS)
////        serial.writeLine("Len... "+LENMSGS)//Lenght MSGS

//        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal); //Close ALL your connections
//        response = WiFiResponse("OK", false, 300); //Wait for the response "OK"

//    }

///**  Receive Data                            
////     @param IPAddR to IPAddR, eg: "192.168.4.1"
////     @param DatosRCV to DatosRCV, eg: ""          //Datos Received from AP 192.168.4.1 or....
//*/
//    //% blockId="WiFi_Receive_Message from AP"
//    //% block="Receive Data From IP number: $IPAddR"
//    //% advanced=false
//    //% group="Remote Commands"
//    //% weight=200     
////export function ReceiV(DatosRCV: string):string{     
//    export function recv_MSG_MPCR(): void{      
////    export function ReceiV(IPAdd: string, DatosRCV: string){
//   // export function ReceiV():string{
//    bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
//    response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long 

//        //Getting AP IP address
//        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        let APipStartIndex = receivedData.indexOf("ip:")
//        let APIP = (receivedData.substr(APipStartIndex+4,11)); // get ip Address local
//        //serial.writeLine("AP IPadd is: "+APIP)//Print my IP address idex    
//        //_____

//        //Getting my IP address
//        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        let ipStartIndex = receivedData.indexOf("ip:")
//        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//        //serial.writeLine("My IP is:"+MyIP)//Print my IP address idex       
//        //_____

//        //Sending request "GET /" to start communication with AP
////WITH VARIABLE     bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ APIP +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); 
//        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long
        
//        let MSGSR = "GET /\r"     // Message "GET /\r" to start communication ->Package

//        bBoard_Control.UARTSendString("AT+CIPSEND=0,"+7+"\r\n", boardIDGlobal, clickIDGlobal); //size packet = 7 
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK

//        bBoard_Control.UARTSendString(MSGSR, boardIDGlobal, clickIDGlobal); //Send the contents of the packet              
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK
//        serial.writeLine("Sending... "+MSGSR)
//        //_____

//    serial.writeLine("READY TO RECEIVE...") //no usar CIPMODE
 
//        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive  mode 
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);
//        serial.writeLine("cipstatus is here: " + (receivedData))      
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));

//        let DatosRCV="";    
//        let RCVInfo="";
//        let RCVdone="";  
//        let MyData="";

//        //Getting LENGHT data 
//        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);     //
//        serial.writeLine("len: " + (receivedData))   
  
//        let LENStartIndex = receivedData.indexOf(":")
//        let MyLEN = (receivedData.substr(LENStartIndex+1,3)); 
//        serial.writeLine("MyLEN is:"+MyLEN)//Print my IP address idex      
//        //_____

//        //Getting data received
//        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,"+MyLEN+"\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);     //
////OK        let DataStartIndex = receivedData.indexOf("M5")
//        let DataStartIndex = receivedData.indexOf("M5STACK_DATA")//pointer on webserver
//        MyData = (receivedData.substr(DataStartIndex+1,3)); 
//        serial.writeLine("MyData is:"+MyData)//Print my IP address idex      

//        RCVdone=("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////       RCVdone=receivedData.substr(761, 3)//find a specific info
//        serial.writeLine("esto recivi:"+RCVdone)


//        serial.writeLine("done! RECEIVE...") 
//        //_______

//        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300); 

//        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//    }





































































































// /** Send ON BLiXel for a IP 
//    * @param IPAdd to IPAdd, eg: "192.168.4.1"
//    * @param pixelONsetTEST position of the BLiXel in the strip
//    */
//    //% blockId="Send BLiXel_ON_# for a IP " 
//    //% block="For IP number: $IPAdd | Ask to Turn ON BliXel #: $pixelONsetTEST=BLiXel_Index"
//    //% advanced=false
//    //% group="Remote Commands"
//    //% weight=200  
//    export function send_LEDMSG_ON(IPAdd: string, pixelONsetTEST: number): void {
   
   
////SENDING REQUEST   
//        let BLiXelBuffer = pins.createBuffer(5);
//        let LEDMSGON = "";
//            if (pixelONsetTEST == 0){ LEDMSGON="GET /ON_1";}
//            if (pixelONsetTEST == 1){ LEDMSGON="GET /ON_2";}
//            if (pixelONsetTEST == 2){ LEDMSGON="GET /ON_3";}
//            if (pixelONsetTEST == 3){ LEDMSGON="GET /ON_4";}
//            if (pixelONsetTEST == 4){ LEDMSGON="GET /ON_5";}
//        serial.writeLine("" + (LEDMSGON))

//    //Getting my IP address
//        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//        response = WiFiResponse("OK", false, 300);//use OJJO300 00ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        let ipStartIndex = receivedData.indexOf("ip:")
//        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("My IP is:"+MyIP)//Print my IP address idex       
//    //______

//    //Getting AP IP address
//        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

//        let APipStartIndex = receivedData.indexOf("ip:")
//        let APIP = (receivedData.substr(APipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("AP IPadd is: "+APIP)//Print my IP address idex    
//    //_____

//        let RCVInfoIPON="";
//        let RCVdoneIPON="";  
        
//        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);//MODE0 TO SENDING
//        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
////        serial.writeLine("" + (receivedData))

//        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
////        serial.writeLine("" + (receivedData))


// //EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,\r\n", boardIDGlobal, clickIDGlobal); 
////        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,\r\n", boardIDGlobal, clickIDGlobal); 
////        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
//          bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
//        response = WiFiResponse("OK", true, 300);
////EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
   
//        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGON.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        response = WiFiResponse("OK", true, 300);
//        bBoard_Control.UARTSendString(LEDMSGON, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
//        response = WiFiResponse("OK", true, 300);
//        serial.writeLine("Sending" +LEDMSGON)
//        serial.writeLine("len" +LEDMSGON.length.toString())
        

  
////RECIVING

//        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))      

//    bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
//    response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long 
//pause(500)
//    bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
//    response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long 



//    serial.writeLine("OTRAVES LEN")
//        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))
//pause(400);//OJO 
//        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,40\r\n", boardIDGlobal, clickIDGlobal);
//        RCVInfoIPON = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
//        RCVdoneIPON=RCVInfoIPON.substr(36, 4)
//        serial.writeLine(RCVInfoIPON)
// //-   return (RCVInfo.substr(36, 4))   
//        if (RCVdoneIPON == "ON_1"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));}
//        if (RCVdoneIPON == "ON_2"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));}
//        if (RCVdoneIPON == "ON_3"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));}
//        if (RCVdoneIPON == "ON_4"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));}
//        if (RCVdoneIPON == "ON_5"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));}
// //-   return (RCVInfoIP.substr(36, 4))

////-*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
//        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);

////-        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////-        serial.writeLine("" + (receivedData))
//        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send
//        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long
//    }

///** Send OFF BLiXel for a IP 
//    * @param IPAdd to IPAdd, eg: "192.168.4.1"
//    * @param pixelOFFsetTEST position of the BLiXel in the strip
//    */
//    //% blockId="Send BLiXel_OFF_# for a IP " 
//    //% block="For IP number: $IPAdd | Ask to Turn OFF BliXel #: $pixelOFFsetTEST=BLiXel_Index"
//    //% advanced=false
//    //% group="Remote Commands"
//    //% weight=200  
//    export function send_LEDMSG_OFF(IPAdd: string, pixelOFFsetTEST: number): void {
//        let BLiXelBuffer = pins.createBuffer(5);
//        let LEDMSGOFF = "";
//            if (pixelOFFsetTEST == 0){ LEDMSGOFF="GET /OFF1";}
//            if (pixelOFFsetTEST == 1){ LEDMSGOFF="GET /OFF2";}
//            if (pixelOFFsetTEST == 2){ LEDMSGOFF="GET /OFF3";}
//            if (pixelOFFsetTEST == 3){ LEDMSGOFF="GET /OFF4";}
//            if (pixelOFFsetTEST == 4){ LEDMSGOFF="GET /OFF5";}
//        serial.writeLine("" + (LEDMSGOFF))

//        let RCVInfoIPOFF="";
//        let RCVdoneIPOFF="";  
//            bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);//0=Passive  1=Active
//            response = WiFiResponse("OK", false, 300);        
//            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//    //        serial.writeLine("" + (receivedData))

//            bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//            response = WiFiResponse("OK", false, 300);
//            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//    //      serial.writeLine("" + (receivedData))

////EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,\r\n", boardIDGlobal, clickIDGlobal); 
//        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,\r\n", boardIDGlobal, clickIDGlobal); 
////        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////        response = WiFiResponse("OK", false, 300);
////        serial.writeLine("" + (receivedData))    

////EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGOFF.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
////        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////        response = WiFiResponse("OK", false, 300); 
////        serial.writeLine("" + (receivedData)) 

//        bBoard_Control.UARTSendString(LEDMSGOFF, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
////        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////        response = WiFiResponse("OK", false, 300); 
////        serial.writeLine("" + (receivedData)) 

////pause(200);

//        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))      
    
//        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))

//        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,40\r\n", boardIDGlobal, clickIDGlobal);
////Example//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal).substr(37, 40))//don´t move position    
//    RCVInfoIPOFF = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
//    RCVdoneIPOFF=RCVInfoIPOFF.substr(36, 4)
//    serial.writeLine(RCVInfoIPOFF)
// //   return (RCVInfo.substr(36, 4))  

//    if (RCVdoneIPOFF == "OFF1"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
//    if (RCVdoneIPOFF == "OFF2"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
//    if (RCVdoneIPOFF == "OFF3"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}
//    if (RCVdoneIPOFF == "OFF4"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));}
//    if (RCVdoneIPOFF == "OFF5"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));}

    
// //   return (RCVInfoIP.substr(36, 4))


////*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
////        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
////        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
////        response = WiFiResponse("OK", false, 300);
////        serial.writeLine("" + (receivedData))









































































    
//       //------------------------- Passwords -----------------------------------
//            //% block
//            //% group="Activity 10"
//            //% icon="\uf084"
//            export function Passwords() {
//            }
    
//       //------------------------- Firewall -----------------------------------   
//            //% block
//            //% group="Activity 11"
//            //% icon="\uf637"
//            export function Firewall() {
//            }
    
//       //------------------------- Intelligent Comunity -----------------------------------   
//            //% block
//            //% group="Activity 12"
//            //% icon="\uf509"
//            export function IntelligentComunity() {
//            }   
            


 
            

    

//   /* BLiXel ON */ 
//        /**  LEDS  ON
//        /** Set ON bBoard BLixel to Purple Color in a specif number
//        * @param pixelONset position of the BLiXel in the strip
//        */
//        //% blockId="BLiXel_ON_Set_#"
//        //% block="ON BLiXel #: $pixelONset=BLiXel_Index"
//        //% advanced=false
//        //% group="Valuable Date"
//        //% weight=200 
  
//    /* BLiXel OFF */
//        /**  LEDS OFF 
//        /** Set OFF bBoard BLixel in a specific number
//        * @param pixelOFFset position of the BLiXel in the strip
//        */
//        //% blockId="BLiXel_OFF_Set_#" 
//        //% block="OFF BLiXel #: $pixelOFFset=BLiXel_Index"
//        //% group="Valuable Date"
//        //% advanced=false      
//        //% weight=200 










//bBoard_Control.UARTSendString("AT+CWHOSTNAME=\"Electricity\" \r\n", boardIDGlobal, clickIDGlobal);
    //bBoard_Control.sendData(0,moduleIDs.BLiXel_module_id,BLiXel_SHOW,  // BLiXel_SHOW, [],0,0)
      //      pause(500)
    //        bBoard_Control.sendData(0,      0,       BLiXel_SHOW,          [],               1,       2) 
            ////                 (BASE    MODULO       ON led     [currentBrightness]       COLOR   NUM blix)
            ////                 0,A,B  mickrobus    Analog-Dig                              RGB        #   
            ////Derive the address of the click port (0= on board 1=A 2=B on b.Board)(3 = on board, 4=A, 5=B on Expansion 1 etc)
            ////    let colourBuffer = pins.createBuffer(4);  // borrar apagar color 4
            ////     export function  blixelsOff() {
////       let colourBuffer = pins.createBuffer(4);
///            colourBuffer.setNumber(NumberFormat.UInt32LE, 0, 0)
////            currentBLiXelBuffer.fill(0)
////            bBoard_Control.BLiX(0,0,clickIOPin.PWM, moduleIDs.BLiXel_module_id, BLiXel_STRIP_SET_COLOUR, null,colourBuffer,0)
///            show();



//bBoard_Control.UARTSendString("AT+CWJAP=\"Mario SE\",\"11111111\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32 
//        response = WiFiResponse("OK",false,defaultWiFiTimeoutmS);  
 //////  EJEMPLO    AT+CWJAP="abc","0123456789"
        ////// EJEMPLO    AT+CWJAP=[<ssid>],[<pwd>][,<bssid>][,<pci_en>][,<reconn_interval>][,<listen_interval>][,<scan_mode>][,<jap_timeout>][,<pmf>]
 //       bBoard_Control.UARTSendString("AT+CWSTATE?\r\n", boardIDGlobal, clickIDGlobal); NO usar cwstate
         //let PingbB = "192.168.4.1";  //Example to introduce
        //let PingbB = "CyberSec #1";  //Example to introduce

    //-------------------------Clear ESP32  ------------------------------   
 //   bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
 //   bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
 //   basic.pause(300)      
 //   bBoard_Control.clearUARTMPCR();
 //   bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);
 //   bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32 
 //   bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
 //   bBoard_Control.UARTSendString("AT+CWAUTOCONN=0\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
 //   bBoard_Control.UARTSendString("AT+RESTORE\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
 //   bBoard_Control.UARTSendString("AT+RST\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one






//Vanished
       // export function clearSerialBuffer() {
            // serial.clearRxBuffer()
     // }



// enum BLiXelcolours {
//    //% block=red
//    //% block.loc.fr=rouge
//    Red = 0xFF0000,
//    //% block=orange
//    Orange = 0xFFA500,
//    //% block=yellow
//    Yellow = 0xFFFF00,
//    //% block=green
//    Green = 0x00FF00,
//    //% block=blue
//    Blue = 0x0000FF,
//    //% block=indigo
//    Indigo = 0x4b0082,
//    //% block=violet
//    Violet = 0x8a2be2,
//    //% block=purple
//    Purple = 0xFF00FF,
//    //% block=white
//    White = 0xFFFFFF,
//    //% block=black
//    Black = 0x000000
//    }




//MESSAGES BACK TO SHOW ON SERIAL   NEVER SPACE BEFORE \r\n
    // Behavior AT commands
    // serial.writeLine("" + (receivedData)) //ALWAYS STATUS=2
    // serial.writeLine("" + (response))// ALWAYS 0  MEANS OK
    // serial.writeLine("" + (bBoard_Control.UARTSendString("AT+CIPMODE=1 \r\n", boardIDGlobal, clickIDGlobal)))// ALWAYS UNDEFINED
    // serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))     // ALWATS ERROR
    // response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); // GENERALY OK
    
//    serial.writeLine("ak1")
//    bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("ak2")
//    bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("ak3")

//    bBoard_Control.UARTSendString("AT+CIPSTART=1,\"TCP\",\"192.168.4.1/Temp\",80\r\n", boardIDGlobal, clickIDGlobal);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("" + (response))
//    serial.writeLine("" + (WiFiResponse))
//    serial.writeLine("" + (receivedData))
    // serial.writeLine("ak4")
    // serial.writeLine("" + (receivedData)) //ALWAYS STATUS=2
    // serial.writeLine("" + (response))// ALWAYS 1
    // bBoard_Control.UARTSendString("AT+CIPSEND=4,10,\r\n", boardIDGlobal, clickIDGlobal);
    // serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal))
    // serial.writeLine("ak5")
    // bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
    // serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal))
    // response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//    serial.writeLine("ak6")
//    bBoard_Control.UARTSendString("AT+CIPCLOSE=0\r\n", boardIDGlobal, clickIDGlobal);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//basic.showIcon(IconNames.Heart)


//    OJO CIPMODE doesn´t work
//    CIPCLOSE=5 close ALL

//     let ms = "test";
//    bBoard_Control.UARTSendString("AT+CIPSEND=0," + ms.length.toString() + "192.168.4.3" + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//    serial.writeLine("" + (receivedData)) 
//    bBoard_Control.UARTSendString(ms, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//    serial.writeLine("" + (receivedData)) 
//bBoard_Control.UARTSendString("AT+CWHOSTNAME=\"Farm\"\r\n", boardIDGlobal, clickIDGlobal);

//MDNS

//bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);
//bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
//bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
//bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//bBoard_Control.UARTSendString("AT+CWMODE=1\r\n", boardIDGlobal, clickIDGlobal);
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//Cybersec.HostNamebB("Food")

//bBoard_Control.UARTSendString("AT+CWDHCP=1,1\r\n", boardIDGlobal, clickIDGlobal);// ENABLE DHCP
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);

                //bBoard_Control.UARTSendString("AT+MDNS=1,\"Food\",\"_http\",80\r\n", boardIDGlobal, clickIDGlobal);
                //serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
                //response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
                //Cybersec.WifiConnect("M5BrilliantLabs_Ap_2", "")// conect to wifi M5 AP

//bBoard_Control.UARTSendString("AT+MDNS=1,\"Food\",\"_http\",80\r\n", boardIDGlobal, clickIDGlobal);
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        basic.showIcon(IconNames.Heart)
//bBoard_Control.UARTSendString("AT+CIPDNS?\r\n", boardIDGlobal, clickIDGlobal);
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);




//            serial.writeLine("Initializing")  NEver use after fuction or command wating for responce 

//serial.writeLine("Initializing") // do not use first in a function



//VERSION & commands
//bBoard_Control.UARTSendString("AT+GMR\r\n", boardIDGlobal, clickIDGlobal);
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//serial.writeLine("" + (receivedData))
//bBoard_Control.UARTSendString("AT+CMD?\r\n", boardIDGlobal, clickIDGlobal);
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//serial.writeLine("" + (receivedData))







//RECEIVE +0-

//      let RCVInfo = "";
//      let RCVdone = "";
//      let MILOCAL = "";
//      let MILOCAL2 ="";
//      bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//      MILOCAL2 = bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal);
//      MILOCAL=MILOCAL2.substr(24, 17);
//      serial.writeLine(MILOCAL);

// CIPMUX ESTA EN 1 . CIPMODE ESTA EN 0,    
//    bBoard_Control.UARTSendString("AT+CIPMODE?\r\n", boardIDGlobal, clickIDGlobal);  
//    response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//    serial.writeLine("" + (receivedData))

//EXAMPLE    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.0.1\",80,,\"192.168.0.3\"\r\n", boardIDGlobal, clickIDGlobal); 
//      bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.0.1\",80,,\""+MILOCAL+"\"\r\n", boardIDGlobal, clickIDGlobal);
//      response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//      serial.writeLine("" + (receivedData))    

//        bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//      bBoard_Control.UARTSendString("AT+CIPSEND=0," + 5 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))    

//bBoard_Control.UARTSendString("GET /", boardIDGlobal, clickIDGlobal); //Send the contents of the packet
//        response = WiFiResponse("OK", true, defaultWiFiTimeoutmS);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))    

//bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//serial.writeLine("" + (receivedData))




//        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))





//        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,50\r\n", boardIDGlobal, clickIDGlobal);
//Example//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal).substr(37, 40))//don´t move position    
//    RCVInfo = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
//    RCVdone=RCVInfo.substr(36, 4)
//   serial.writeLine(RCVInfo)
//   return (RCVInfo.substr(36, 4))
//   Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));       

//   if (RCVdone == "ON_1"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));}
//  if (RCVdone == "ON_2"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));}
//  if (RCVdone == "ON_3"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));}
//  if (RCVdone == "ON_4"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));}
//  if (RCVdone == "ON_5"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));}

//if (RCVdone == "OFF1"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
//if (RCVdone == "OFF2"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
//if (RCVdone == "OFF3"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}
//if (RCVdone == "OFF4"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));}
//if (RCVdone == "OFF5"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));}



//  return (RCVInfo.substr(36, 4))

//return (RCVInfo)
// return (receivedData);

//bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal);
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))



//EXAMPLE//     bBoard_Control.UARTSendString("AT+CIPSEND=0," + LENMSGS + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//EXAMPLE//     bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//EXAMPLE//     len s ="";
//              bBoard_Control.UARTSendString("AT+CIPSEND=0,"+s+"\r\n", boardIDGlobal, clickIDGlobal); //s add \r to the packet
//EXAMPLE//     bBoard_Control.UARTSendString("AT+CIPSEND=0," + MSGS.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//test bBoard_Control.UARTSendString("GET /ron?\r", boardIDGlobal, clickIDGlobal); //Send the contents of the packet              
//EXAMPLE       bBoard_Control.UARTSendString("AT+MDNS=1,\"Food\",\"_http\",80\r\n", boardIDGlobal, clickIDGlobal);




//EXAMPLE//  Getting my IP address
//bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//let ipStartIndex = receivedData.indexOf("ip:")
//let MyIP = (receivedData.substr(ipStartIndex+4,11)); 
//serial.writeLine("My IP indx is:"+MyIP)//Print my IP address idex       
//____

//EXAMPLE//        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\"192.168.4.2\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication



//EXAMPLE//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//EXAMPLE//        serial.writeLine("" + (receivedData))
//EXAMPLE//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));




//% blockId=WiFiOff
        //% block="Turn WiFi Off"
        //% block.loc.fr="Définir WiFi Off"
        //% weight=110
        //% advanced=false
        //% group="Initialize and Connections"
        //% this.shadow=variables_get
        //% this.defl="WiFiOff"
    

// #O: La station ESP32 n'est pas initialisée. #1: La station ESP32 est initialisée, mais n'a pas encore démarré de connexion Wi-Fi. #2: La station ESP32 est connectée à un AP et son adresse IP est obtenue.  #3: La station ESP32 a créé une transmission TCP/SSL. #4: Toutes les connexions TCO/UPD/SSL de la station ESP32 sont déconnectées. #5: La station ESP32 a démarré une connexion WiFi, mais n'était pas connectée à un AP ou déconnectée d'un AP.

//Excellent > -60. Bon -61 à -75. Moyen -76 à -80. Mauvais -81 à -89. Très mauvais <-90.

//afterOnStart=true //This block will only execute after the onStart block is finished

////% blockId=onBLMQTT 
//    //% block="on BL MQTT received $dataType $receivedData|feed $feedName|username$username|API Key$apiKey" 
//    //% block.loc.fr="sur nuage BL reçu $dataType $receivedData|flux $feedName|nom d'utilisateur$username|API clé$apiKey"
//    //% blockAllowMultiple=1
//    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
//    //% receivedData.shadow=variables_get
//    //% group="MQTT"
//    //% subcategory="Brilliant Labs Cloud"
//    //% draggableParameters=variable
