let defaultWiFiTimeoutmS = 5000;//30000
let response: number;
let receivedData: string
let MQTTMessageRetrieveState: number;
let MQTTMessage: string;
let boardIDGlobal = 0;
let clickIDGlobal = 0;
let MQTTString: string

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

/** Cybersecurity
 */
//% block="CyberSecurity"
//% advanced=true
//% weight=100 color=#9E4894 icon="\uf21b"//LOGO CYBER
//% labelLineWidth=1001
//% groups="['Activity 7-Networking', 'Activity 8-Valuable Date', 'Activity 9-Remote Comands', 'Activity 10 Passwords', 'Activity 11-Firewall', 'Activity 12-Intelligent Comunity']"
 //------------------------- Networking -----------------------------------   

 namespace Cybersec {

    //--------------------- Initialize and Connections ----------------------    
    
    /* Animation */ 
            //% block="Animation bBoard"
            //% weight=100 
            //% advanced=false
            //% group="Initialize and Connections" 
            //% this.shadow=variables_get
            //% this.defl="Animation" 
            export function Animation() {        
                soundExpression.twinkle.play()
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));                             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));                             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));              
            }

    /* WiFi Connect */
         /** Initializes WiFi capabilities
         * @param ssid to ssid ,eg: "M5BrilliantLabs_Ap"              //"CyberSec #1"
         * @param pwd to ssid ,eg: ""               //"11111111"
         */
        //% block="Connect to WiFi: $ssid| with Password: $pwd"
        //% weight=110
        //% group="Initialize and Connections"
        export function WifiConnect(ssid: string, pwd: string): void {  
            bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
            bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
            basic.pause(1000)
            bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);          
            // Animation using BLiXel
            Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
            Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
            Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three)); 
            Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
            Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                
            bBoard_Control.UARTSendString("AT+CWMODE=1\r\n", boardIDGlobal, clickIDGlobal);
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK" 
    
            bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n", boardIDGlobal, clickIDGlobal);  //Enable multiple connections
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK",false,defaultWiFiTimeoutmS); 
        
            bBoard_Control.UARTSendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n", boardIDGlobal, clickIDGlobal);  //Connect to WiFi Network
            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK",false,defaultWiFiTimeoutmS);
    
            bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);  // CHECK NO connection MAKE INFINITE LOOP
//           serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
            if (response==0){
                while (1){
                    serial.writeLine("Done! IsConnected? Error") 
                    basic.showIcon(IconNames.Sad, 400)  
                    basic.showString(" WiFi Error")
                }
            }    
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));               
                serial.writeLine("Done! Initialize")               
        }
     
    /* WiFi OFF */
        //% blockId=WiFiOff
                //% block="Turn WiFi Off"
                //% block.loc.fr="Définir WiFi Off"
                //% weight=110
                //% advanced=false
                //% group="Initialize and Connections"
                //% this.shadow=variables_get
                //% this.defl="WiFiOff"
        export function WiFi_OFF(): void {
            bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
            bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32 
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion,
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            bBoard_Control.writePin(0,clickIOPin.CS,boardIDGlobal,clickIDGlobal);       //OFF ESP32            serial.writeLine("Done! WiFi Off")
            basic.pause(200)
        }          
            
    /* WiFi Reset */
        //% blockId=Reset
        //% block="Reset WiFi"
        //% weight=110
        //% advanced=false
        //% group="Initialize and Connections"
        export function WiFi_RST(): void {
            bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
            bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
            bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
            bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32 
            bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion,
            bBoard_Control.UARTSendString("AT+CWAUTOCONN=0\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
            bBoard_Control.UARTSendString("AT+RESTORE\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
            bBoard_Control.UARTSendString("AT+RST\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            bBoard_Control.eventInit(bBoardEventsMask.UARTRx, 0, 0) //set on BLiX  ASK TO JOSH   
            serial.writeLine(""+("Done! Reset"))
        }  
          
    /* WiFi Disconnect */
        //% blockId=Disconnect
        //% block="Disconnect WiFi"
        //% weight=110 
        //% advanced=false
        //% group="Initialize and Connections"
        export function Disconnect():void {
            bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
            bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32  
            bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK" 
            serial.writeLine("Done! Disconnected")   
        }
        
    /* WiFi Check  */
        //% blockId=WiFi_Connected
        //% block="WiFi Connected"
        //% weight=110 
        //% advanced=false
        //% group="Initialize and Connections"
        export function WiFi_Connected(): boolean {
        pause(3000)    
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal); 
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))  
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
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
                basic.showString("#0")
                serial.writeLine("Done! IsConnected? Error #0") 
                return false;
            }}
        if (connected == 1){                                //1: THe ESP32 station is initialized, but not started a Wi-Fi connection yet
            while (1){
                basic.showLeds(`
                . . . . .
                . # . # .
                . . # . .
                . # . # .
                . . . . .
                `)
                basic.showString("#1")
                serial.writeLine("Done! IsConnected? Error #1") 
                return false;
            }}
        if (connected == 2){    //2: The ESP32 station is connected to an AP and its IP address is obteined.    basic.showString("#2")
            while (1){
                basic.showLeds(`
                . . . . .
                . . . . # 
                . # . # .
                . . # . .
                . . . . .
                `)                
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));             
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));               
                serial.writeLine("") 
                serial.writeLine("Done! IsConnected? OK #2") 
                return true;
            }}
        if (connected == 3){     // 3: The ESP32 station has created a TCP/SSL transmission.    basic.showString("#3")
            while (1){
                basic.showLeds(`
                . . . . #
                . # . # . 
                . . # . .
                . . . . .
                . . . . .
                `)
                serial.writeLine("Done! IsConnected? OK #3") 
                return true;
            }}
        if (connected == 4){                //4: All of the TCO/UPD/SSL connections of th ESP32 station are disconnected
            while (1){
                basic.showIcon(IconNames.Sad,400)
                basic.showString("#4")
                serial.writeLine("Done! IsConnected? Error #4") 
                return false;
            }}
        if (connected == 5){ //5: The ESP32 station started a WiFi connection, but was not connected to an AP or disconnected from an AP
            while (1){
                basic.showIcon(IconNames.Sad, 400)
                basic.showString("#5")
                serial.writeLine("Done! IsConnected? Error #5") 
                return false;
            }}
        basic.showIcon(IconNames.Sad, 400)
        Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five)); basic.pause(20);Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five)); 
        Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));
        Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));        
        Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two)); 
        Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one)); basic.pause(20); Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one)); 
        serial.writeLine("Done! IsConnected? NO") 
        return false;
        }
    
    //------------------------- Networking -----------------------------------  
    /* MAC Address bBoard */
        //% blockId=getMACaddressbBoard
        //% block="$this Get MAC address bBoard"
        //% weight=100 
        //% advanced=false
        //% group="Activity 7-Networking"
        //% this.shadow=variables_get
        //% this.defl="MAC_bBoard"
        export function getMACaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CIPSTAMAC?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal))) 
            response = WiFiResponse("OK", false, 1000);
            serial.writeLine("")
            serial.writeLine(""+(receivedData.substr(27,17)))
            return(receivedData.substr(27,17));
        }
        
     /* MAC Address AP */
        //% blockId=getMACaddressAP
        //% block="$this Get MAC address AP"
        //% weight=100 
        //% advanced=false
        //% group="Activity 7-Networking"
        //% this.shadow=variables_get
        //% this.defl="MAC_AP"
        export function getMACaddressAP(): string {
            bBoard_Control.UARTSendString("AT+CIPAPMAC?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, 1000);
            serial.writeLine("")
            serial.writeLine(""+(receivedData.substr(25,17)))
            return(receivedData.substr(25,17));
        }
        
    /* IP Address bBoard */   
        //% blockId=getIPaddressbBoard
        //% block="$this Get IP address bBoard"
        //% weight=100 
        //% advanced=false
        //% group="Activity 7-Networking"
        //% this.shadow=variables_get
        //% this.defl="IP_AP"
        export function getIPaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, 1000);
            serial.writeLine("")
            serial.writeLine(""+(receivedData.substr(20,17)))
            return(receivedData.substr(20,17));
        }
        
    /* IP Address AP */
        //% blockId=getIPaddressAP
        //% block="$this Get IP address AP"
        //% weight=100 
        //% advanced=false
        //% group="Activity 7-Networking"
        //% this.shadow=variables_get
        //% this.defl="IP_bBoard"
        export function getIPaddressAP(): string {
            bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, 1000);
            serial.writeLine("")
            serial.writeLine(""+(receivedData.substr(18,17)))
            return(receivedData.substr(18,17));
        }
    
    //------------------------- More -----------------------------------     
    
    /* Firmware ESP32 */
        //% blockId=Get Firmware ESP32 on bBoard
        //% block="Get firmware ESP32 on bBoard"
        //% weight=100 
        //% advanced=true
        //% group="Activity 7-Networking"
        //% this.shadow=variables_get
        //% this.defl="getFirmwareESP32"
        export function getFirmwareESP32(): string {
            bBoard_Control.UARTSendString("AT+GMR\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, 1000);
//            serial.writeLine("")
            serial.writeLine(""+(receivedData.substr(18,17)))
            return(receivedData.substr(19,3));
        }
    
    
    //------------------------- Valuable Date -----------------------------------  
    /**Valuavble Date
     * 
     */
    
    /* PING */
        /** Do PING to a IP address
        * @param PingbB to PingbB ,eg: "192.168.4.1"
        */
        //% blockId=PingbBoard?
        //% block="Do PING to IP: $PingbB"
        //% weight=110
        //% group="Activity 8-ValuableDate" 
        export function PingbBfrend(PingbB:string):void{          
            bBoard_Control.UARTSendString("AT+PING=\"" + PingbB +"\"\r\n", boardIDGlobal, clickIDGlobal); 
            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK",false,defaultWiFiTimeoutmS);
        
            if (receivedData == "TIMEOUT"){
                basic.showIcon(IconNames.No,2000) 
                serial.writeLine("" + (receivedData))
                serial.writeLine("Done! ping")
            }
            if (response == 1) {                                //RESPONSE ==1 connected
                basic.showIcon(IconNames.Happy,2000)
                serial.writeLine("" + (receivedData))
                serial.writeLine("Done! ping")
            }
            if (response == 0) {   
                basic.showIcon(IconNames.Sad,2000)            //response ==0 NO conected
                serial.writeLine("" + (receivedData))
                serial.writeLine("Done! ping")
            }
        }
                   
    /* Set HostName */             
        /** Set Host Name
        * Set Host Name
        * @param HNamebB to HNamebB ,eg: "Ex: Hospital"
        */
        //% blockId=HostNamebBoard?
        //% block="Enter your HostName: $HNamebB"
        //% weight=110
        //% group="Activity 8-ValuableDate"
        export function HostNamebB(HNamebB:string):void{       
            bBoard_Control.UARTSendString("AT+CWHOSTNAME=\"" + HNamebB+ "\"\r\n", boardIDGlobal, clickIDGlobal);
    //    serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);              
        }
     
    /* Read HostName */                        
        //% blockId="HostNameView
        //% block="Get your HostName"
        //% weight=100 
        //% group="Activity 8-ValuableDate"
        export function getHostNamebB(): string {
            bBoard_Control.UARTSendString("AT+CWHOSTNAME?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
//            serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal))) // Don´t move it 
            response = WiFiResponse("OK", false, 1000);
//            serial.writeLine("")
//            serial.writeLine(""+(receivedData.substr(28,10)))
            return(receivedData.substr(28,10));
        }
               
    /* BLiXel ON */ 
        /**  LEDS  ON
        /** Set ON bBoard BLixel to Purple Color in a specif number
        * @param pixelONset position of the BLiXel in the strip
        */
        //% blockId="BLiXel_ON_Set_#"
        //% block="ON BLiXel #: $pixelONset=BLiXel_Index"
        //% advanced=false
        //% group="Activity 8-ValuableDate"
        //% weight=200 
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
    
    /* BLiXel OFF */    
        /**  LEDS OFF 
        /** Set OFF bBoard BLixel in a specific number
        * @param pixelOFFset position of the BLiXel in the strip
        */
        //% blockId="BLiXel_OFF_Set_#" 
        //% block="OFF BLiXel #: $pixelOFFset=BLiXel_Index"
        //% group="Activity 8-ValuableDate"
        //% advanced=false      
        //% weight=200 
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
    























    
//------------------------- Remote Comands -----------------------------------
    //% block 
    //% group="Activity 9-Remote Commands"
    //% icon="\uf7c0"
    
/**  send Data
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param MSG to MSG, eg:"GET /ON_"
    */
    //% block="For IP number: $IPAdd | send data: $MSG MPCR"
    //% blockId=Wifi_send_message
    //% weight=110
    //% group="Activity 9-Remote Commands"
    export function send_MSG_MPCR(IPAdd: string, MSG:string): void {
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,\r\n", boardIDGlobal, clickIDGlobal); 
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))    

        bBoard_Control.UARTSendString("AT+CIPSEND=0," + MSG.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine("" + (receivedData))    


        bBoard_Control.UARTSendString(MSG, boardIDGlobal, clickIDGlobal); //Send the contents of the packet
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", true, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))    
        
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal); //Close ALL your connections
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
//        serial.writeLine("" + (receivedData))
    }



/** Send ON BLiXel for a IP 
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param pixelONsetTEST position of the BLiXel in the strip
    */
    //% blockId="Send BLiXel_ON_# for a IP " 
    //% block="For IP number: $IPAdd | Ask to Turn ON BliXel #: $pixelONsetTEST=BLiXel_Index"
    //% advanced=false
    //% group="Activity 9-Remote Commands"
    //% weight=200  
    export function send_LEDMSG_ON(IPAdd: string, pixelONsetTEST: number): void {
        let BLiXelBuffer = pins.createBuffer(5);
        let LEDMSGON = "";
            if (pixelONsetTEST == 0){ LEDMSGON="GET /ON_1";}
            if (pixelONsetTEST == 1){ LEDMSGON="GET /ON_2";}
            if (pixelONsetTEST == 2){ LEDMSGON="GET /ON_3";}
            if (pixelONsetTEST == 3){ LEDMSGON="GET /ON_4";}
            if (pixelONsetTEST == 4){ LEDMSGON="GET /ON_5";}
        serial.writeLine("" + (LEDMSGON))

        let RCVInfoIPON="";
        let RCVdoneIPON="";  
            bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
    //        serial.writeLine("" + (receivedData))

            bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
    //      serial.writeLine("" + (receivedData))

//EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,\r\n", boardIDGlobal, clickIDGlobal); 
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,\r\n", boardIDGlobal, clickIDGlobal); 
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))    

//EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGON.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine("" + (receivedData)) 

        bBoard_Control.UARTSendString(LEDMSGON, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine("" + (receivedData)) 

//pause(400);


        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))      
    
        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))

pause(400);

    bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,40\r\n", boardIDGlobal, clickIDGlobal);
//Example//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal).substr(37, 40))//don´t move position    
    RCVInfoIPON = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
    RCVdoneIPON=RCVInfoIPON.substr(36, 4)
    serial.writeLine(RCVInfoIPON)
 //   return (RCVInfo.substr(36, 4))   

    if (RCVdoneIPON == "ON_1"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));}
    if (RCVdoneIPON == "ON_2"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));}
    if (RCVdoneIPON == "ON_3"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));}
    if (RCVdoneIPON == "ON_4"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));}
    if (RCVdoneIPON == "ON_5"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));}

    
 //   return (RCVInfoIP.substr(36, 4))


//*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))

    }

/** Send OFF BLiXel for a IP 
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param pixelOFFsetTEST position of the BLiXel in the strip
    */
    //% blockId="Send BLiXel_OFF_# for a IP " 
    //% block="For IP number: $IPAdd | Ask to Turn OFF BliXel #: $pixelOFFsetTEST=BLiXel_Index"
    //% advanced=false
    //% group="Activity 9-Remote Commands"
    //% weight=200  
    export function send_LEDMSG_OFF(IPAdd: string, pixelOFFsetTEST: number): void {
        let BLiXelBuffer = pins.createBuffer(5);
        let LEDMSGOFF = "";
            if (pixelOFFsetTEST == 0){ LEDMSGOFF="GET /OFF1";}
            if (pixelOFFsetTEST == 1){ LEDMSGOFF="GET /OFF2";}
            if (pixelOFFsetTEST == 2){ LEDMSGOFF="GET /OFF3";}
            if (pixelOFFsetTEST == 3){ LEDMSGOFF="GET /OFF4";}
            if (pixelOFFsetTEST == 4){ LEDMSGOFF="GET /OFF5";}
        serial.writeLine("" + (LEDMSGOFF))

        let RCVInfoIPOFF="";
        let RCVdoneIPOFF="";  
            bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
    //        serial.writeLine("" + (receivedData))

            bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
    //      serial.writeLine("" + (receivedData))

//EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80,\r\n", boardIDGlobal, clickIDGlobal); 
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,\r\n", boardIDGlobal, clickIDGlobal); 
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))    

//EXAMPLE//    bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGOFF.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine("" + (receivedData)) 

        bBoard_Control.UARTSendString(LEDMSGOFF, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
//        serial.writeLine("" + (receivedData)) 

//pause(200);



bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))      
    
        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))

        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,40\r\n", boardIDGlobal, clickIDGlobal);
//Example//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal).substr(37, 40))//don´t move position    
    RCVInfoIPOFF = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
    RCVdoneIPOFF=RCVInfoIPOFF.substr(36, 4)
    serial.writeLine(RCVInfoIPOFF)
 //   return (RCVInfo.substr(36, 4))  

    if (RCVdoneIPOFF == "OFF1"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
    if (RCVdoneIPOFF == "OFF2"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
    if (RCVdoneIPOFF == "OFF3"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}
    if (RCVdoneIPOFF == "OFF4"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));}
    if (RCVdoneIPOFF == "OFF5"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));}

    
 //   return (RCVInfoIP.substr(36, 4))


//*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
//        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
//        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//        serial.writeLine("" + (receivedData))
    }




/** Receive 
* Receive data from AP, first the Client need do ask using "GET /ON_1", then AP put it back +CIPRECVDATA:4,ON_1 
*/
    //% blockId="Receive data from AP"
    //% block="Receive "
    //% weight=200 
    //% advanced=false
    //% group="Activity 9-Remote Commands"
    //% this.shadow=variables_get
    //% this.defl="Receive_bBoard"
    //export function ReceiV(){
         
    export function ReceiV(): string{      
    let RCVInfo="";
    let RCVdone="";  
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))

        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))

//VERSION
        bBoard_Control.UARTSendString("AT+GMR\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
        serial.writeLine("" + (receivedData))
        bBoard_Control.UARTSendString("AT+CMD?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
        serial.writeLine("" + (receivedData))


        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"192.168.4.1\",80\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))

        bBoard_Control.UARTSendString("AT+CIPSEND=0," + 9 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))    

        bBoard_Control.UARTSendString("GET /ON_1", boardIDGlobal, clickIDGlobal); //Send the contents of the packet
        response = WiFiResponse("OK", true, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))    
    
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))      
    
        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))

        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0,40\r\n", boardIDGlobal, clickIDGlobal);
//Example//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal).substr(37, 40))//don´t move position    
    RCVInfo = "" + bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
    RCVdone=RCVInfo.substr(36, 4)
    serial.writeLine(RCVInfo)
 //   return (RCVInfo.substr(36, 4))
    Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));       

    if (RCVdone == "ON_1"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));}
  //  if (RCVdone == "ON_2"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));}
  //  if (RCVdone == "ON_3"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));}
  //  if (RCVdone == "ON_4"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));}
  //  if (RCVdone == "ON_5"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));}

    //if (RCVdone == "OFF1"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
    //if (RCVdone == "OFF2"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
    //if (RCVdone == "OFF3"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}
    //if (RCVdone == "OFF4"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));}
    //if (RCVdone == "OFF5"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));}


    
    return (RCVInfo.substr(36, 4))

    
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); 
        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
        serial.writeLine("" + (receivedData))
    }







    
       //------------------------- Passwords -----------------------------------
            //% block
            //% group="Activity 10"
            //% icon="\uf084"
            export function Passwords() {
            }
    
       //------------------------- Firewall -----------------------------------   
            //% block
            //% group="Activity 11"
            //% icon="\uf637"
            export function Firewall() {
            }
    
       //------------------------- Intelligent Comunity -----------------------------------   
            //% block
            //% group="Activity 12"
            //% icon="\uf509"
            export function IntelligentComunity() {
            }    
}
    


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

