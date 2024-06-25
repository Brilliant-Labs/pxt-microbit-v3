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

let CyberComTimeoutmS=300;//use 300ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long
let ProtCode=0;
let ProtCodeStr="";
let MSG_PCS="";
let FullMSG_PCS="";
let LenPCS=0;

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
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
* Custom blocks
*/
//% block="CyberSecurity"
//% block.loc.fr="Cybersécurité"
//% advanced=true
//% weight=100
//% color=#9E4894 
//% icon="\uf21b"      //LOGO CYBER
//% labelLineWidth=1001
//% groups="['Initialize and Connections', 'Networking', 'Roles','Version ESP32', 'Remote Comands', 'Missions', 'Missions1']"

//------------------------- Networking -----------------------------------   

 namespace Cybersec {


//--------------------- Initialize and Connections ----------------------    
    
    /* Secuence Animation */ 
    /** | >> En << | Show a lighting secuence on b.Board´s BLiXels and sound "twinkle".
        | >> Fr << | Montrer une séquence d'éclairage sur les BLiXels de b.Board et le son "twinkle". 
    */
        //% blockId="Sequence Animation" 
        //% block="Sequence BLiXels on b.Board"
        //% block.loc.fr="Séquence des BLiXels du b.Board"
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

    /* Coding Check b.Board */ 
    /** | >> En << | Turn on b.Board BLiXel to be notified when your code crosses this point.
        | >> Fr << | Activez le BLixel b.Board pour être averti lorsque votre code franchit ce point.
        * @param pixelONset position of the BLiXel in b.Board
    */
        //% blockId="Coding Check b.Board" 
        //% block="b.Board BliXel $pixelONset=BLiXel_Index to check when it reaches this point"
        //% block.loc.fr="b.Board BliXel $pixelONset=BLiXel_Index pour vérifier si le code francît ce point"
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
    /** | >> En << | Initializes WiFi capabilities. b.Board power switch should be ON.
        | >> Fr << | Initialise les capacités WiFi. b.Board l'interrupteur d'alimentation de la carte doit être sur ON.         
        * @param ssid to ssid, eg: "Cyberville #1"           
        * @param pwd to ssid, eg: ""
    */
        //% blockId="Wifi Connection" 
        //% block="Connect to WiFi: $ssid| with Password: $pwd"
        //% block.loc.fr="Connexion au WiFi : $ssid| avec mot de passe :$pwd"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WifiConnect(ssid: string, pwd: string): void { 

//\\                control.waitMicros(4)                                                                   // Enable Console to display info. It doesn´t work properly.

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

//                bBoard_Control.UARTSendString("AT+CWLAPOPT=1,31\r\n", boardIDGlobal, clickIDGlobal);    // Set the Configuration for the Command AT+CWLAP "list AP´s".  (It is not tested yet)
//                response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);                        
               
                bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);        // CHECK NO connection MAKE INFINITE LOOP you have to reset b.Board
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
                
                if (response==0){                                                                       // WiFi Error 
                    serial.writeLine("Done! AP available? Error Try Again") 
                    basic.showIcon(IconNames.Sad, 400)  
                    basic.showString("Error AP not available Try Again")
                    basic.pause(1000)
                }
                else{                                                                                   // WiFI Connected
                    serial.writeLine("") 
                    serial.writeLine("Connected!")
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
    /** | >> En << | Turn off Wi-Fi capabilities; to reestablish, you need to turn off and then turn on the b.Board again.
        | >> Fr << | Désactivez les capacités Wi-Fi; pour les rétablir, vous devez éteindre puis rallumer le b.Board.      
    */
        //% blockId="WiFi Off"
        //% block="WiFi Off"
        //% block.loc.fr="désactiver le wifi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WiFi_OFF(): void {
                serial.writeLine("" + "b.Board->" + "")     // Always to publish in Console, the last "" completes the line to send and show
                
                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
                bBoard_Control.writePin(0, clickIOPin.CS, boardIDGlobal, clickIDGlobal)     
                bBoard_Control.writePin(1, clickIOPin.CS, boardIDGlobal, clickIDGlobal)
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion,
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
                serial.writeLine("WiFi Off" + "")
            }          
       
    /* WiFi Reset */
    /** | >> En << | Reset Wi-Fi capabilities. You need to enter WiFi information. 
        | >> Fr << | Réinitialiser les capacités Wi-Fi. Vous devez saisir les informations relatives au Wi-Fi.      
    */
        //% blockId="WiFi Reset"
        //% block="WiFi Reset"
        //% block.loc.fr="Réinitialiser le Wi-Fi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100
            export function WiFi_RST(): void {
                serial.writeLine("" + "b.Board->" + "")     // Always to publish in Console, the last "" completes the line to send and show

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
    /** | >> En << | Discconect from the current WiFi.
        | >> Fr << | Se déconnecter du réseau Wi-Fi actuel.      
    */
        //% blockId="WiFi Disconnect"
        //% block="WiFi Disconnect"
        //% block.loc.fr="Déconnexion du WiFi"
        //% advanced=false
        //% group="Initialize and Connections"
        //% weight=100 
            export function Disconnect():void {
                serial.writeLine("" + "b.Board->" + "")     // Always to publish in Console, the last "" completes the line to send and show

                bBoard_Control.clearUARTRxBuffer(boardIDGlobal, clickIDGlobal);             //  bBoard.clearUARTRxBuffer(clickBoardNum);
                bBoard_Control.UARTSendString("AT+CWJAP=\"SSID_CLEAR\",\"pwd_CLEAR\"\r\n", boardIDGlobal, clickIDGlobal);  //SSID_CLEAR and pwd_CLEAR are nothing, I use them to clear de ESP32  
                bBoard_Control.UARTSendString("AT+CWQAP\r\n", boardIDGlobal, clickIDGlobal); //Disconnect the created conextion, now is ready to a new one
                response = WiFiResponse("OK", false, CyberWiFiTimeoutmS); //Wait for the response "OK" 
                basic.pause(300)                    // Delay to publish in console
                serial.writeLine("Disconnected" + "")
        }

    /* WiFi Check  */
    /** | >> En << | Check the WiFi status. 
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
        //% block="the b.Board WiFi is Connected"
        //% block.loc.fr="le WiFi du b.Board est connecté"
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
    /** | >> En << | Get the signal strength from b.Board to the access point. 
        | >> Fr << | Obtenir la force du signal entre le b.Board et le point d'accès.
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

    /* MAC Address b.Board */
    /** | >> En << | Display the b.Board MAC Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse MAC du b.Board sur le PC de la console et sur l'écran du Micro:Bit. 
    */
        //% blockId="GetMACbBoard"
        //% block="$this Get the b.Board MAC address"
        //% block.loc.fr="$this Obtenir Ládresse MAC du b.Board"
        //% advanced=false
        //% group="Networking"        
        //% weight=100 

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="Get_MAC_bBoard"
        export function getMACaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CIPSTAMAC?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);//CyberWiFiConsoleTimeoutmS=1000
            serial.writeLine("My MAC: " + receivedData.substr(27, 17) + "")    //55,17 CIFSR
            return("My MAC:" + receivedData.substr(27,17));     
//            serial.writeLine("My MAC: " + receivedData.substr(27, 17) + "")          
            }

    /* IP Address b.Board */   
    /** | >> Es << | Display the b.Board IP Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse IP du b.Board sur le PC de la console et sur l'écran du Micro:Bit. 
     */
        //% blockId="GetIPBoard"
        //% block="$this Get the b.Board´s IP address"
        //% block.loc.fr="$this Obtenir I´IP du b.Board"
        //% advanced=false
        //% group="Networking"        
        //% weight=100 

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="IP_bBoard"
        export function getIPaddressbBoard(): string {
            bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, 30000);
            let ipStartIndex = receivedData.indexOf("ip:")
            // get IP STA
            let MyIP = receivedData.substr(ipStartIndex + 4, 11)
            serial.writeLine("My IP: " + MyIP)
            return("My IP:" + MyIP);

//corrected ^            
//            bBoard_Control.UARTSendString("AT+CIFSR\r\n", boardIDGlobal, clickIDGlobal);
//            response = WiFiResponse("OK", false, CyberWiFiConsoleTimeoutmS);
//            serial.writeLine("My IP: " + (receivedData.substr(23,15)) + "")//22,17
//            return("My IP:" + receivedData.substr(23,15));
//            serial.writeLine("My IP: " + receivedData.substr(23, 15) + "")          
        }   

    /* MAC Address AP */
    /** | >> En << | Display the b.Board access point MAC Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse point d'accès MAC du b.Board sur le PC de la console et sur l'écran du Micro:Bit. 
     */
        //% blockId=GetMACAP
        //% block="$this Get the AP´s MAC address"
        //% block.loc.fr="$this Obtenir Ládresse MAC du point d´accès"
        //% advanced=false
        //% group="Networking"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="MAC_AP"
        export function getMACaddressAP(): string {
            let macAP=""
            bBoard_Control.UARTSendString("AT+CWJAP?\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
//            serial.writeLine("" + (receivedData))          
            let startIndex = receivedData.indexOf("+CWJAP:") + 8
            let endIndex = receivedData.indexOf(",",startIndex) - 1
            let wfname = receivedData.substr(startIndex, endIndex - startIndex )
            let szwf = wfname.length
            let startIndexMAC = receivedData.indexOf("+CWJAP:") +11 + szwf
            let endIndexMAC = receivedData.indexOf(",", startIndexMAC) -2
            macAP = receivedData.substr(startIndexMAC, endIndexMAC - startIndexMAC+1) 
            serial.writeLine("AP MAC: " + macAP)              
            return("AP MAC:" + macAP);
            }
        
    /* IP Address AP */
    /** | >> En << | Display the access point IP Address on the Console PC and on the Micro:Bit screen.
        | >> Fr << | Affichez l'adresse IP du point d'accès sur le PC de la console et sur l'écran du Micro:Bit. 
    */
        //% blockId="GetIPAP"
        //% block="$this Get the AP´s IP address"
        //% block.loc.fr="$this Obtenir L´IP du point d´accés"
        //% advanced=false
        //% group="Networking"
        //% weight=100

        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.shadow=variables_get
        //% this.defl="IP_bBoard"
        export function getIPaddressAP(): string {

        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, 30000);
        let ipStartIndex = receivedData.indexOf("ip:")
        // get IP AP
        let APIP = receivedData.substr(ipStartIndex + 4, 11)
        serial.writeLine("AP IP: " + APIP)
        return("AP IP:" + APIP);
            
//corrected ^
//            bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal);
//            response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);        
////            serial.writeLine("" + (receivedData))
//            let startIndex = receivedData.indexOf("gateway:")+9
//            let endIndex = receivedData.indexOf("+",startIndex) - 3
//            let APIP = receivedData.substr(startIndex, endIndex - startIndex )
//            serial.writeLine("AP IP: "+ APIP)
//            return("AP IP:" + APIP);
        }
    
        
//------------------------- Roles -----------------------------------  


    //* Set HostName */
    /** | >> En << | Configure your Name in Cyberville for the network. Others can then use this name to perform a PING.. 
        | >> Fr << | Configurez votre nom d'hôte pour le réseau. D'autres personnes peuvent ensuite utiliser ce nom pour effectuer un PING.              
        * @param HNamebB to HNamebB, eg: "SCHOOL"
    */
        //% blockId="SetHostName"
        //% block="Your name in Cyberville: $HNamebB"
        //% block.loc.fr="Votre nom à Cyberville: $HNamebB"
        //% advanced=false
        //% group="Roles"      
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
                 
            serial.writeLine("Name in Cyberville: "+(HNamebB))
        }

    /* PING IP */
    /** | >> En << | Do PING to a IP address.  If the destination responds, you will see a smiley face; otherwise, a sad face. 
        | >> Fr << | Faites un PING vers une adresse IP.  Si la destination répond, vous verrez un smiley ; sinon, un visage triste.
        | >> The response time should not exceed 10 seconds  << |
        * @param PingbB to PingbB, eg: "192.168.4.1"
    */
        //% blockId="PINGIP"
        //% block="Do PING to IP: $PingbB"
        //% block.loc.fr="Effectuez un PING vers l'IP: $PingbB"
        //% advanced=false
        //% group="Roles"      
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
    /** | >> En << | Do PING to a Name in Cyberville.  If the destination responds, you will see a smiley face; otherwise, a sad face. 
        | >> Fr << | Faites un PING vers une nom Cyberville.  Si la destination répond, vous verrez un smiley ; sinon, un visage triste.
        | >> The response time should not exceed 10 seconds  << |
        * @param PingbBDNS to PingbBDNS ,eg: "WiFi-BL"
        */
        //% blockId="PingHostName"
        //% block="Do PING to a Name in Cyberville: $PingbBDNS"
        //% block.loc.fr="Faire PING à un nom dans Cyberville: $PingBDNS"
        //% advanced=false
        //% group="Roles"      
        //% weight=100 
        export function PingbBDNS(PingbBDNS:string):void{
            let dnslocal=PingbBDNS+".local"
            serial.writeLine("dnslocal is: " + dnslocal)
//         bBoard_Control.UARTSendString("AT+PING=\"" + PingbBDNS+"\"+\".local\"\r\n", boardIDGlobal, clickIDGlobal); 
            bBoard_Control.UARTSendString("AT+PING=\"dnslocal\"\r\n", boardIDGlobal, clickIDGlobal); 
            response = WiFiResponse("OK",false,10000);//defaultWiFiTimeoutmS=30000
//serial.writeLine("" + (receivedData))
            
            if (receivedData == "TIMEOUT"){
                basic.showIcon(IconNames.No,2000) 
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to Name in Cyberville: "+ PingbBDNS)
            }
            if (response == 1) {                                //RESPONSE ==1 connected
                basic.showIcon(IconNames.Happy,2000)
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to Name in Cyberville: "+ PingbBDNS)
            }
            if (response == 0) {   
                basic.showIcon(IconNames.Sad,2000)              //response ==0 NO conected
                serial.writeLine("" + (receivedData))
                serial.writeLine("PING to Name in Cyberville: "+ PingbBDNS)
            }
        }

    /* Read HostName */
    /** | >> En << | Display your current Name in Cyberville.  
        | >> Fr << | Affichez votre nom Cyberville actuel.
        | >> The default HostName is espressif wich is the the manufacturer of ESP32<< |
    */       
        //% blockId="ReadHostName"
        //% block="$this Get your Name in Cyberville"
        //% block.loc.fr="$this Obtenez votre nom à Cyberville"
        //% advanced=false
        //% group="Roles"
        //% weight=100
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% receivedData.shadow=variables_get
        //% draggableParameters=variable       
        export function getHostNamebB(): string {
            bBoard_Control.UARTSendString("AT+CWHOSTNAME?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
            response = WiFiResponse("OK", false, CyberWiFiTimeoutmS);
            serial.writeLine("Name in Cyberville: "+(receivedData.substr(28,10))) 
            return("Name in Cyberville:"+receivedData.substr(28,10));
        }

//------------------------- Version ESP32 - Others -----------------------------------     
    //% block 
    //% group="Version ESP32"
    //% icon="\uf7c0"
    //% afterOnStart=true
    //% blockGap=9
    //% advanced=false

    /* Firmware ESP32 */
    /** | >> En << | Display the ESP32 firmware version. 
        | >> Fr << | Affichez la version du firmware de l'ESP32. 
        | >>  We strongly recommend version 3.2 or higher.  << |
    */
        //% blockId="GetFirmwareESP32"
        //% block="Get firmware ESP32 on b.Board"
        //% block.loc.fr="Télécharger le firmware ESP32 sur la b.Board"
        //% advanced=false
        //% group="Version ESP32"
        //% blockGap=9
        //% weight=110    
        //% afterOnStart=true
        //% advanced=false
        //% blockHidden=false 
        export function getFirmwareESP32(): string {
            bBoard_Control.UARTSendString("AT+GMR\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
            response = WiFiResponse("OK", false,CyberWiFiConsoleTimeoutmS);
            serial.writeLine("ESP32 V.: "+(receivedData.substr(19,3)))
            basic.showString("V" + receivedData.substr(19,3))
            return(receivedData.substr(19,3));
        }

        
    // Colours
    // Red = 0xFF0000, Orange = 0xFFA500, Yellow = 0xFFFF00, Green = 0x00FF00, White = 0xFFFFFF
    // Blue = 0x0000FF, Indigo = 0x4b0082,Violet = 0x8a2be2,Purple = 0xFF00FF, Black = 0x000000

    // Set here to publish  BLiXel ON GREEN
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
    
    // Set here to publish  BLiXel ON RED
        export function setPixelColourRED(pixelONset: number): void {       
            let BLiXelBuffer = pins.createBuffer(5);
            if (pixelONset >= 5)
            {
                pixelONset = 4;
            }
            BLiXelBuffer.setNumber(NumberFormat.UInt32LE, 0,0xFF0000)// RED = 0xFF0000
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

//Here END Cyberville 1



//"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//"""""""""""""""""""""""""""""""""""""""""""" 2024 """""""""""""""""""""""""""""""""""""""
//"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

//------------------------- Remote Comands -----------------------------------
    //% block 
    //% group="Remote Commands"
    //% icon="\uf7c0"
    //% afterOnStart=true
    //% blockGap=9
    //% advanced=false
//------------------------- Send Data -----------------------------------    
/**  Send Data
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param MSG to MSG, eg:"Data to send"
    */
    //% block="For IP number: $IPAdd | send data: $MSG"
    //% blockId=Wifi_Send_Message
    //% afterOnStart=true
    //% weight=110
    //% blockGap=9
    //% group="Remote Commands"
    //% blockHidden=true 
    //% advanced=false
    export function send_MSG_MPCR(IPAdd: string, MSG:string): void {

        //Getting my IP address
        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        let ipStartIndex = receivedData.indexOf("ip:")
        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get IP STA
//      serial.writeLine("My IP: "+MyIP)//Print my IP address idex       
//      serial.writeLine("AP IP: "+IPAdd)//Print my IP address idex       
        //_____

        //Start comunication
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); 
        response = WiFiResponse("OK", false, CyberComTimeoutmS);       
        let MSGS = "GET1/PCBL_"+MSG//((+"\r"     // This is the message to send.   the last \r means end of tha line sended, Carriage Return
        let LENMSGS = MSG.length+10      // Size message 10 characters {GET1/PCBL_}
        //_____

        //Sending request "GET /" to start communication with AP. Sending GET /xxxMSGSxxx
        bBoard_Control.UARTSendString("AT+CIPSEND=0,"+LENMSGS+"\r\n", boardIDGlobal, clickIDGlobal); //s add \r to the packet 
        response = WiFiResponse("OK", false, CyberComTimeoutmS);     
   
        bBoard_Control.UARTSendString(MSGS, boardIDGlobal, clickIDGlobal); //Send the contents of the packet              
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        serial.writeLine("Sending: "+MSGS)
//      serial.writeLine("Len... "+LENMSGS)//Lenght MSGS
        //_____

        //Close comunication
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal); //Close ALL your connections
        response = WiFiResponse("OK", false, CyberComTimeoutmS); //Wait for the response "OK"
    }

//------------------------- Receive Data -----------------------------------      
/**  Receive Data from AP                           
    */
    //% block="Receive Message from 192.168.4.1 | $RCVInfo"
    //% blockId="Receive Data From 192.168.4.1"
    //% weight=110     
    //% group="Remote Commands"
    //% BlockAllowMultiple=1
    //% RCVInfo.shadow=variables_get
    //% draggableParameters=variable
    //% afterOnStart=true 
    //% blockGap=9
    //% blockHidden=true 
    //% advanced=false
    export function ReceiV(): string {  
        let IPAddR = "192.168.4.1"    //Tipe here the AP address
   
        //Mode=1 to Receive
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
//            serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//            serial.writeLine("receiveData: " + (receivedData))      
        pause(500)//Important

    //Getting my IP address
        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        let ipStartIndex = receivedData.indexOf("ip:")
        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//          serial.writeLine("My IP: "+MyIP)//Print my IP address      
//          serial.writeLine("AP IP: "+IPAddR)//Print my AP IPaddress      
        //_____

    //Sending request "GET /" to start communication with AP. 
    bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAddR +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); 
    response = WiFiResponse("OK", false, CyberComTimeoutmS);        
    let MSGSR = "GET /\r"     // Message "GET /\r" to start communication ->Package
    bBoard_Control.UARTSendString("AT+CIPSEND=0,"+5+"\r\n", boardIDGlobal, clickIDGlobal); //size packet = 7 lo cambie a 5
    response = WiFiResponse("OK", false, CyberComTimeoutmS);
    bBoard_Control.UARTSendString(MSGSR, boardIDGlobal, clickIDGlobal); //Send the contents of the packet              
    response = WiFiResponse("OK", false, CyberComTimeoutmS);
//        serial.writeLine("Data to Send: "+MSGSR) //send command GET /
    //_____

    //Ready to Receive.     Important CIPRECVMODE=1
    let RCVInfo = "";
    let receivedStr = ""; //The built string
        //Getting LENGHT data 
            bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
            response = WiFiResponse("OK", false, CyberComTimeoutmS); 
//              serial.writeLine("ReceivedData is: " + (receivedData))
            let startIndexDrcv = receivedData.indexOf("+CIPRECVLEN:") + 12 // +CIPRECVLEN: = 12characters
//              serial.writeLine("start-> " + startIndexDrcv)
            let endIndexDrcv = receivedData.indexOf(",", startIndexDrcv)
//              serial.writeLine("end-> " + endIndexDrcv)
            let LenDrcv = receivedData.substr(startIndexDrcv, endIndexDrcv - startIndexDrcv)
            let LenDrcvSize=LenDrcv.length
//              serial.writeLine("LEN Data ReceiVed: " + LenDrcv)
//              serial.writeLine("LEN Data size: " + LenDrcvSize)
            let TotLen= parseInt(LenDrcv)+LenDrcvSize
            serial.writeLine("Total lenght: " + TotLen)//Totalize Lenght size
        //______           
        pause(500);//Important  
        //Getting Data
            bBoard_Control.UARTSendString("AT+CIPRECVDATA=0," + LenDrcv + "\r\n", boardIDGlobal, clickIDGlobal);//for Link=0        //for ReceivedData, to see data length of link 
            //For ReceivedData
                let startIndexDXrcv = receivedData.indexOf(":")+1 //Ok Ok
                let endIndexDXrcv = receivedData.indexOf(",", startIndexDXrcv)
                let DXrcv = receivedData.substr(startIndexDXrcv, endIndexDXrcv - startIndexDrcv+26)
//              serial.writeLine("Frame DXrcv: " + DXrcv) //to visualize the data frame
                let totDX=DXrcv.length
//              serial.writeLine("len totDX: " + totDX) //to visualize lenght amount
            //___
            //For RCVInfo
                RCVInfo = bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
                let sIndexDXrcv = RCVInfo.indexOf(":") + LenDrcvSize + 2 // Ok Ok OK
//              serial.writeLine("sIndexDXrcv: " + sIndexDXrcv)
                let eIndexDXrcv = RCVInfo.indexOf(",", sIndexDXrcv) + parseInt(LenDrcv)
//              serial.writeLine("eIndexDXrcv: " + eIndexDXrcv)
            //___

//RCVInfo = RCVInfo.substr(sIndexDXrcv, TotLen)
    RCVInfo = RCVInfo.substr(sIndexDXrcv, parseInt(LenDrcv))
    serial.writeLine("Receiving block: " + RCVInfo)// to visualize data received
    //______           

    bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal);
    response = WiFiResponse("OK", false, CyberComTimeoutmS); 

    //Ready to Receive done!     Important CIPRECVMODE=0
    bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send
    response = WiFiResponse("OK", false, CyberComTimeoutmS);

    return("" + RCVInfo);     

}

//------------------------- Send ON BLiXel for AP -----------------------------------   
 /** Send ON BLiXel for a IP 
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param pixelONsetTEST position of the BLiXel in the strip
    */
    //% blockId="Send BLiXel_ON_# for a IP " 
    //% block="For IP number: $IPAdd | Ask to Turn ON BliXel #: $pixelONsetTEST=BLiXel_Index"
     //% afterOnStart=true
    //% group="Remote Commands"
    //% weight=200 
    //% blockGap=9 
    //% blockHidden=true 
    //% advanced=false
    export function send_LEDMSG_ON(IPAdd: string, pixelONsetTEST: number): void {
        
//SENDING REQUEST GET/             Important -> CIPRECVMODE=0  
    let BLiXelBuffer = pins.createBuffer(5);
                       
    let LEDMSGON = "";
            if (pixelONsetTEST == 0){ LEDMSGON="GET /ON_1";}
            if (pixelONsetTEST == 1){ LEDMSGON="GET /ON_2";}
            if (pixelONsetTEST == 2){ LEDMSGON="GET /ON_3";}
            if (pixelONsetTEST == 3){ LEDMSGON="GET /ON_4";}
            if (pixelONsetTEST == 4){ LEDMSGON="GET /ON_5";}
            serial.writeLine("to send..." + (LEDMSGON))

    //Getting my IP address
        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);

        let ipStartIndex = receivedData.indexOf("ip:")
        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("My IP is:"+MyIP)//Print my IP address idex       
    //______

    //Getting AP IP address
        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);

        let APipStartIndex = receivedData.indexOf("ip:")
        let APIP = (receivedData.substr(APipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("AP IPadd is: "+APIP)//Print my IP address idex    
    //_____

        let RCVdoneIPON="";  
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);//MODE0 TO SENDING
        response = WiFiResponse("OK", false, CyberComTimeoutmS);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGON.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
        bBoard_Control.UARTSendString(LEDMSGON, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
//        serial.writeLine("Sending" +LEDMSGON)
//        serial.writeLine("len" +LEDMSGON.length.toString())
        
//RECIVING  Important -> CIPRECVMODE=1
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("receiveData: " + (receivedData))      
        pause(500)//Important

//Getting LENGHT data 
           bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
           response = WiFiResponse("OK", false, CyberComTimeoutmS); 
//           serial.writeLine("ReceivedData is: " + (receivedData))
            let startIndexDrcv = receivedData.indexOf("+CIPRECVLEN:") + 12 // +CIPRECVLEN: = 12characters
//           serial.writeLine("start-> " + startIndexDrcv)
            let endIndexDrcv = receivedData.indexOf(",", startIndexDrcv)
//            serial.writeLine("end-> " + endIndexDrcv)
            let LenDrcv = receivedData.substr(startIndexDrcv, endIndexDrcv - startIndexDrcv)
            let LenDrcvSize=LenDrcv.length
//            serial.writeLine("LEN Data ReceiVed: " + LenDrcv)
//            serial.writeLine("LEN Data size: " + LenDrcvSize)
            let TotLen= parseInt(LenDrcv)+LenDrcvSize
//            serial.writeLine("Total lenght: " + TotLen)//Totalize Lenght size
            pause(500);//Important                     
//Getting Data
            bBoard_Control.UARTSendString("AT+CIPRECVDATA=0," + LenDrcv + "\r\n", boardIDGlobal, clickIDGlobal);//for Link=0        //for ReceivedData, to see data length of link 
            //For ReceivedData
                let startIndexDXrcv = receivedData.indexOf(":")+1 //Ok Ok
                let endIndexDXrcv = receivedData.indexOf(",", startIndexDXrcv)
                let DXrcv = receivedData.substr(startIndexDXrcv, endIndexDXrcv - startIndexDrcv+26)
//              serial.writeLine("Frame DXrcv: " + DXrcv) //to visualize the data frame
                let totDX=DXrcv.length
//            serial.writeLine("len totDX: " + totDX) //to visualize lenght amount
            //___
            //For RCVInfo
            RCVdoneIPON = bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
                let sIndexDXrcv = RCVdoneIPON.indexOf(":") + LenDrcvSize + 2 // Ok Ok OK
//              serial.writeLine("sIndexDXrcv: " + sIndexDXrcv)
                let eIndexDXrcv = RCVdoneIPON.indexOf(",", sIndexDXrcv) + parseInt(LenDrcv)
//              serial.writeLine("eIndexDXrcv: " + eIndexDXrcv)
            //___

        RCVdoneIPON = RCVdoneIPON.substr(sIndexDXrcv, parseInt(LenDrcv))
        serial.writeLine("Receiving: "+RCVdoneIPON)// to visualize data received

        if (RCVdoneIPON == "ON_1"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));}
        if (RCVdoneIPON == "ON_2"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));}
        if (RCVdoneIPON == "ON_3"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));}
        if (RCVdoneIPON == "ON_4"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));}
        if (RCVdoneIPON == "ON_5"){Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));}

//-*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);

        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send
        response = WiFiResponse("OK", false, CyberComTimeoutmS);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long
    }

//------------------------- Send OFF BLiXel for AP -----------------------------------   
/** Send OFF BLiXel for a IP 
    * @param IPAdd to IPAdd, eg: "192.168.4.1"
    * @param pixelOFFsetTEST position of the BLiXel in the strip
    */
    //% blockId="Send BLiXel_OFF_# for a IP " 
    //% block="For IP number: $IPAdd | Ask to Turn OFF BliXel #: $pixelOFFsetTEST=BLiXel_Index"
    //% afterOnStart=true
    //% group="Remote Commands"
    //% weight=200  
    //% blockGap=9
    //% blockHidden=true
    //% advanced=false
    export function send_LEDMSG_OFF(IPAdd: string, pixelOFFsetTEST: number): void {

//SENDING REQUEST GET/             Important -> CIPRECVMODE=0  
    let BLiXelBuffer = pins.createBuffer(5);
    let LEDMSGOFF = "";
            if (pixelOFFsetTEST == 0){ LEDMSGOFF="GET /OFF1";}
            if (pixelOFFsetTEST == 1){ LEDMSGOFF="GET /OFF2";}
            if (pixelOFFsetTEST == 2){ LEDMSGOFF="GET /OFF3";}
            if (pixelOFFsetTEST == 3){ LEDMSGOFF="GET /OFF4";}
            if (pixelOFFsetTEST == 4){ LEDMSGOFF="GET /OFF5";}
        serial.writeLine("" + (LEDMSGOFF))

    //Getting my IP address
        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, 300);//use OJJO300 00ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long


        let ipStartIndex = receivedData.indexOf("ip:")
        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("My IP is:"+MyIP)//Print my IP address idex       
        //______

        //Getting AP IP address
        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

        let APipStartIndex = receivedData.indexOf("ip:")
        let APIP = (receivedData.substr(APipStartIndex+4,11)); // get ip Address local
//        serial.writeLine("AP IPadd is: "+APIP)//Print my IP address idex    
//_____

        let RCVdoneIPOFF="";  
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);//MODE0 TO SENDING
        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, 300);        
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("" + (receivedData))
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ IPAdd +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
        response = WiFiResponse("OK", true, 300);
        bBoard_Control.UARTSendString("AT+CIPSEND=0," + LEDMSGOFF.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        response = WiFiResponse("OK", true, 300);
        bBoard_Control.UARTSendString(LEDMSGOFF, boardIDGlobal, clickIDGlobal); //Send the contents of the packet  
        response = WiFiResponse("OK", true, 300);
//        serial.writeLine("Sending" +LEDMSGOFF)
//        serial.writeLine("len" +LEDMSGOFF.length.toString())

//RECIVING  Important -> CIPRECVMODE=1
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
        response = WiFiResponse("OK", false, 300);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long 
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, 300);
//        serial.writeLine(bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal));
//        serial.writeLine("receiveData: " + (receivedData))      
        pause(500)//Important

//Getting LENGHT data 
        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS); 
//           serial.writeLine("ReceivedData is: " + (receivedData))
        let startIndexDrcv = receivedData.indexOf("+CIPRECVLEN:") + 12 // +CIPRECVLEN: = 12characters
//           serial.writeLine("start-> " + startIndexDrcv)
        let endIndexDrcv = receivedData.indexOf(",", startIndexDrcv)
//            serial.writeLine("end-> " + endIndexDrcv)
        let LenDrcv = receivedData.substr(startIndexDrcv, endIndexDrcv - startIndexDrcv)
        let LenDrcvSize=LenDrcv.length
//            serial.writeLine("LEN Data ReceiVed: " + LenDrcv)
//            serial.writeLine("LEN Data size: " + LenDrcvSize)
        let TotLen= parseInt(LenDrcv)+LenDrcvSize
//            serial.writeLine("Total lenght: " + TotLen)//Totalize Lenght size
        pause(500);//Important                     
//Getting Data
    bBoard_Control.UARTSendString("AT+CIPRECVDATA=0," + LenDrcv + "\r\n", boardIDGlobal, clickIDGlobal);//for Link=0        //for ReceivedData, to see data length of link 
    //For ReceivedData
        let startIndexDXrcv = receivedData.indexOf(":")+1 //Ok Ok
        let endIndexDXrcv = receivedData.indexOf(",", startIndexDXrcv)
        let DXrcv = receivedData.substr(startIndexDXrcv, endIndexDXrcv - startIndexDrcv+26)
//              serial.writeLine("Frame DXrcv: " + DXrcv) //to visualize the data frame
//            let totDX=DXrcv.length
//            serial.writeLine("len totDX: " + totDX) //to visualize lenght amount
    //___
    //For RCVInfo
        RCVdoneIPOFF = bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)
        let sIndexDXrcv = RCVdoneIPOFF.indexOf(":") + LenDrcvSize + 2 // Ok Ok OK
//              serial.writeLine("sIndexDXrcv: " + sIndexDXrcv)
        let eIndexDXrcv = RCVdoneIPOFF.indexOf(",", sIndexDXrcv) + parseInt(LenDrcv)
//              serial.writeLine("eIndexDXrcv: " + eIndexDXrcv)
    //___

    RCVdoneIPOFF = RCVdoneIPOFF.substr(sIndexDXrcv, parseInt(LenDrcv))
    serial.writeLine("Receiving: "+RCVdoneIPOFF)// to visualize data received

    if (RCVdoneIPOFF == "OFF1"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
    if (RCVdoneIPOFF == "OFF2"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
    if (RCVdoneIPOFF == "OFF3"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}
    if (RCVdoneIPOFF == "OFF4"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));}
    if (RCVdoneIPOFF == "OFF5"){Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));}

//*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5,\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, 300);

        serial.writeLine("" + (bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)))
        response = WiFiResponse("OK", false, 300);
    }

//------------------------------------ Missions --------------------------------------   
    //% block 
    //% group="Missions"
    //% icon="\uf7c0"
     //% afterOnStart=true
    //% blockGap=9
    //% advanced=true
    //% blockHidden=false 

//-------Roles_Index----    
 /** Gets the index of Roles
    */
    //% blockGap=9
    //% blockId="BLiXel_IndexR" 
    //% block="%indexR"
    //% block.loc.fr="%indexR"
    //% afterOnStart=true
    //% blockHidden=true 
    //% advanced=true
    export function blixel_indexR(indexR: BLiXelIndexR): number {
        return indexR;
    }
/** Gets the index of Appliance
    */
    //% blockGap=9
    //% blockId="Appliance_Index" 
    //% block="%indexApp"
    //% block.loc.fr="%indexApp"
     //% afterOnStart=true
    //% blockHidden=true 
    //% advanced=true
    export function appliance_index(indexApp: ApplianceIndex): number {
        return indexApp;
    }

/* Mission lights, select the Role and the Appliance (BLixel #) to turn on
    */ 
    /** | >> En << | Select your role. Protect the appliance in the appropriate order.
        | >> Fr << | Sélectionnez votre rôle. Protégez l'appareil dans l'ordre approprié.
        * @param Role in Cyberville
        * @param Appliance in School
    */
        //% blockId="Mission Wired Lights" 
        //% block="Choose your Role: $Role=BLiXel_IndexR | and Protect the: $Appliance=Appliance_Index"
        //% group="Mission 1: Weird Lights at School - What is the order of protection?"
        //% afterOnStart=true
        //% weight=100        
        //% blockHidden=false 
        //% advanced=true
        export function MissionLights(Role: number, Appliance:number): void {       
//            serial.writeLine("Role: " + Role)
        //Getting the Protection Code String
            let ApplianceStr = Appliance.toString()     //number to String
            ProtCodeStr=ProtCodeStr+ApplianceStr;       // Store the string to be sent to M5
//            serial.writeLine("The Appliance number is: " + Appliance)
//            serial.writeLine("The AplicaneStr: "+ ApplianceStr)
//            serial.writeLine("The Protection Code String is: "+ ProtCodeStr)
            LenPCS = ProtCodeStr.length
//            serial.writeLine("Lenght Protection Code String is: "+ LenPCS)
        //____

        //SENDING REQUEST GET/ + Role# + /ON_ + Appliance#            Important -> CIPRECVMODE=0  
        MSG_PCS = "GET"+Role+"/ON_"+Appliance;//Menssage to be sent as request, Protection Cose String
        //serial.writeLine("to send...:  " + (MSG_PCS))
        //serial.writeLine("The code selected was:  " + (ProtCodeStr))

        FullMSG_PCS = "GET"+Role+"/PCBL_"+ProtCodeStr; //message GET + Role number + currentLine.endsWith ProtectionCodeBrilliantLabs          +Appliance;//Menssage to be sent as request, Protection Cose String

        } // assemble  FullMSG_PCS = "GET"+Role+"/PCBL_"+ProtCodeStr; 

/* Send the protection */
    /** | >> En << | Send protection sequence for attack resolution.
        | >> Fr << | Envoi d'une séquence de protection pour la résolution de l'attaque.      
    */
        //% blockId="Send_Protection"
        //% block="Send protection sequence and wait for results!"
        //% block.loc.fr="Envoyez la séquence de protection et attendez les résultats !"
        //% advanced=true
        //% group="Mission 1: Weird Lights at School - What is the order of protection?" 
        //% weight=100
        export function sendprot(): void {
        soundExpression.giggle.play()
//        serial.writeLine("The protection code is: "+ ProtCodeStr + " it is going to be send to m5")
//        serial.writeLine("The full protection code is: "+ FullMSG_PCS + " it is going to be send to m5")

        readytosend();

        bBoard_Control.UARTSendString("AT+CIPSEND=0," + FullMSG_PCS.length.toString() + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
//____________________________________    V   _______________________________
        bBoard_Control.UARTSendString(FullMSG_PCS, boardIDGlobal, clickIDGlobal); //Send FULLMSG_PCS the contents of the packet  
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
//        serial.writeLine("Sending to AP: " + ProtCodeStr + " as code proteccion")
        serial.writeLine("Sending to AP: " + FullMSG_PCS)
//        serial.writeLine("Lenght MSC_PCS is: " +MSG_PCS.length.toString())

        ProtCodeStr=""; //Delete the message to get a new one
        FullMSG_PCS=""; //Delete the message to get a new one  // NO QUITAR
//        serial.writeLine("ProtCodeStr was sent! and deleted.")   
//        serial.writeLine("FULLMSG_PCS was sent! and deleted.")      
       pause(500)//***** Important **** 

        //Flashing
        // Cybersec.setPixelColourON(BLiXel.blixel_index(Appliance-1)); basic.pause(500+LenPCS*1000); Cybersec.setPixelColourOFF(BLiXel.blixel_index(Appliance-1));//Flashing BLixel
        // Cybersec.setPixelColourON(BLiXel.blixel_index(Appliance-1)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(Appliance-1));//Flashing BLixel
        //___________

/* Receiving to confirm */
    //RECIVING  Important -> CIPRECVMODE=1
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=1\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send  1=PASSIVE to receive mode it is "Important"
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);          
        pause(500)//***** Important **** 

        let RCVdonIPON =""; // Variable empty to start

    //Getting LENGHT data 
        bBoard_Control.UARTSendString("AT+CIPRECVLEN?\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS); 
        let startIndexDrcv = receivedData.indexOf("+CIPRECVLEN:") + 12 // +CIPRECVLEN: = 12characters
//           serial.writeLine("start-> " + startIndexDrcv)
        let endIndexDrcv = receivedData.indexOf(",", startIndexDrcv)
//            serial.writeLine("end-> " + endIndexDrcv)
        let LenDrcv = receivedData.substr(startIndexDrcv, endIndexDrcv - startIndexDrcv)
        let LenDrcvSize=LenDrcv.length
//            serial.writeLine("LEN Data ReceiVed: " + LenDrcv)
//            serial.writeLine("LEN Data size: " + LenDrcvSize)
        let TotLen= parseInt(LenDrcv)+LenDrcvSize
//            serial.writeLine("Total lenght: " + TotLen)//Totalize Lenght size
    //_____
//        pause(500);//***** Important ****     

    //Getting Data
        bBoard_Control.UARTSendString("AT+CIPRECVDATA=0," + LenDrcv + "\r\n", boardIDGlobal, clickIDGlobal);//for Link=0        //for ReceivedData, to see data length of link 
        //For ReceivedData
        let startIndexDXrcv = receivedData.indexOf(":")+1 //Ok Ok
        let endIndexDXrcv = receivedData.indexOf(",", startIndexDXrcv)
        let DXrcv = receivedData.substr(startIndexDXrcv, endIndexDXrcv - startIndexDXrcv+26)
//          serial.writeLine("Frame DXrcv: " + DXrcv) //to visualize the data frame
        let totDX=DXrcv.length
//          serial.writeLine("len totDX: " + totDX) //to visualize lenght amount
    //___

    //For RCVInfo
        RCVdonIPON = bBoard_Control.getUARTData(boardIDGlobal, clickIDGlobal)   
        let sIndexDXrcv = RCVdonIPON.indexOf(":") + LenDrcvSize + 2 // Ok Ok OK
//          serial.writeLine("sIndexDXrcv: " + sIndexDXrcv)
        let eIndexDXrcv = RCVdonIPON.indexOf(",", sIndexDXrcv) + parseInt(LenDrcv)
//          serial.writeLine("eIndexDXrcv: " + eIndexDXrcv)
    //___
        let MSG_PCS_RCV  = RCVdonIPON.substr(sIndexDXrcv, parseInt(LenDrcv))
        serial.writeLine("MSG received: " + MSG_PCS_RCV)
    

    // Read the confirmation sent by M5 and turn on the appliance 
        let Confirm="";    // Variable empty to start
        
        Confirm = MSG_PCS_RCV.substr(0,5-4)//First Digit Code
//        serial.writeLine("Confirmed 1: " + Confirm)
        if (Confirm=="1"){
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
    
                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.one));
            }else{
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(0)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(0));//Flashing BLixel
     
                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.one));}
        Confirm = MSG_PCS_RCV.substr(1,1)//Second Digit Code
//        serial.writeLine("Confirmed 2: " + Confirm)
        if (Confirm=="1"){
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel

                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.two));
            }else{
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(1)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(1));//Flashing BLixel

                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.two));}
        Confirm = MSG_PCS_RCV.substr(2,1)//Third Digit Code
//        serial.writeLine("Confirmed 3: " + Confirm)
        if (Confirm=="1"){
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel

                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.three));
            }else{
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(2)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(2));//Flashing BLixel

                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.three));}  
        Confirm = MSG_PCS_RCV.substr(3,1)//Fourth Digit Code
//        serial.writeLine("Confirmed 4: " + Confirm)
        if (Confirm=="1"){
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel

                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.four));
            }else{
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(3)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(3));//Flashing BLixel

                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.four));} 
        Confirm = MSG_PCS_RCV.substr(4,1)//Fiveth Digit Code
//        serial.writeLine("Confirmed 5: " + Confirm)
        if (Confirm=="1"){
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel

                Cybersec.setPixelColourON(BLiXel.blixel_index(BLiXelIndex.five));
            }else{
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(500); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(100); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(400); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(50); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                basic.pause(600);
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(10); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(5); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel
                Cybersec.setPixelColourRED(BLiXel.blixel_index(4)); basic.pause(3); Cybersec.setPixelColourOFF(BLiXel.blixel_index(4));//Flashing BLixel

                Cybersec.setPixelColourOFF(BLiXel.blixel_index(BLiXelIndex.five));} 
    //__________ 
            

       if (MSG_PCS_RCV=="11111"){
            readytosend();
            bBoard_Control.UARTSendString("AT+CIPSEND=0," + 4 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
            response = WiFiResponse("OK", true, CyberComTimeoutmS);
            bBoard_Control.UARTSendString("Good", boardIDGlobal, clickIDGlobal); //Send FULLMSG_PCS the contents of the packet  
            response = WiFiResponse("OK", true, CyberComTimeoutmS);
            serial.writeLine("Good")// This is the word to confirm the code is correct!
            basic.showIcon(IconNames.Happy,2000) 
            soundExpression.happy.play()
            pause(1000)
            basic.clearScreen()
         }
        if (MSG_PCS_RCV!="11111"){
            soundExpression.sad.play()
            basic.showIcon(IconNames.Sad,2000) 
            pause(1000)
            basic.clearScreen()
        }


        MSG_PCS_RCV=""; //Delete the message to get a new one
        RCVdonIPON="";  //Delete the message to get a new one
        Confirm="";     //Delete the message to get a new one


//-***Close the comunication */
        bBoard_Control.UARTSendString("AT+CIPCLOSE=5\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
//Ready to Receive done!     Important CIPRECVMODE=0 
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal); //MODE 0=ACTIVE only to send
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);//use 200ms wating for OK, I am not using defaultWiFiTimeoutmS because it is too long

        serial.writeLine("Client Closed!")


/*        if (MSG_PCS_RCV=="11111"){
            readytosend();
            bBoard_Control.UARTSendString("AT+CIPSEND=0," + 4 + "\r\n", boardIDGlobal, clickIDGlobal); //Get ready to send a packet and specifiy the size
            response = WiFiResponse("OK", true, CyberComTimeoutmS);
            bBoard_Control.UARTSendString("Good", boardIDGlobal, clickIDGlobal); //Send FULLMSG_PCS the contents of the packet  
            response = WiFiResponse("OK", true, CyberComTimeoutmS);
            serial.writeLine("Good")// This is the word to confirm the code is correct!
            basic.showIcon(IconNames.Happy,2000) 
            soundExpression.happy.play()
            pause(1000)
            basic.clearScreen()
         }
*/




  


        }   

export function readytosend(){
        //Getting my IP address
        bBoard_Control.UARTSendString("AT+CIPSTA?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        let ipStartIndex = receivedData.indexOf("ip:")
        let MyIP = (receivedData.substr(ipStartIndex+4,11)); // get ip Address local
//              serial.writeLine("My IP is: "+MyIP)//Print my IP address idex       
    //Getting AP IP address
        bBoard_Control.UARTSendString("AT+CIPAP?\r\n", boardIDGlobal, clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, CyberComTimeoutmS);
        let APipStartIndex = receivedData.indexOf("ip:")
        let APIP = (receivedData.substr(APipStartIndex+4,11)); // get ip Address local
//              serial.writeLine("AP IPadd is: "+APIP)//Print my IP address idex    
//_____
    //Sending MSG_PCS                    
        bBoard_Control.UARTSendString("AT+CIPRECVMODE=0\r\n", boardIDGlobal, clickIDGlobal);//MODE0 TO SENDING
        response = WiFiResponse("OK", false, CyberComTimeoutmS);        
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n", boardIDGlobal, clickIDGlobal);
        response = WiFiResponse("OK", false, CyberComTimeoutmS);        
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\""+ APIP +"\",80,30,\""+ MyIP +"\"\r\n", boardIDGlobal, clickIDGlobal); //Start comuninication
        response = WiFiResponse("OK", true, CyberComTimeoutmS);
}






//------------------------- Missions -----------------------------------

    /* Mission Water */
    /** | >> En << | Mission Water Treatment.
        | >> Fr << | traitement des eaux de mission.      
    */
        //% blockId="Mission Water"
        //% block="For a New Mission!"
        //% block.loc.fr="For a New Mission!"
        //% advanced=true
        //% group="Mission 2: Water Treatment Plant"
        //% weight=100
        export function newmission(): void {
            serial.writeLine("" + "Mission2: Water Treatment Plant" + "")    
        }   



//"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
//"""""""""""""""""""""""""""""""""""""""""""" 2024 """""""""""""""""""""""""""""""""""""""
//"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


}  

// This list SHOULD be out of the namespace Cybersec {}  *Important
enum BLiXelIndexR {
    //% block="SCHOOL ®1"
        one = 1,
    //% block="HOSPITAL ®2"
        two = 2,
    //% block="WATER ®3"
        three = 3,
//    //% block="WiFi-BL ®4"
//    four = 4,
    //% block="GOVERNMENT ®5"
        five = 5,
    //% block="BRILLIANT LABS ®6"
        six = 6,
    //% block="BANK ®7"
        seven = 7,
    //% block="FACTORY ®8"
        eight = 8,
    //% block="INDUSTRY ®9"
        nine = 9,
    //% block="ARTCENTER ®10"
        ten = 10,
//    //% block="CYBERSEGURIDAD ®11"
//        eleven = 11,
    //% block="HOUSES ®12"
        twelve = 12
}

enum ApplianceIndex {
    //% block="Heat Cntr ☼1"
        one = 1,
    //% block="Air Cond  ☼2"
        two = 2,
    //% block="Lamp Cafe ☼3"
        three = 3,
    //% block="Lamps Gym ☼4"
        four = 4,
    //% block="Internet  ☼5"
        five = 5,
}




//backup comments in folder


