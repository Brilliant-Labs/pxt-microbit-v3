namespace WiFiSetResponses{




    export class SetResponse extends bBoard_Control.UARTSettings{
    
    readonly defaultWiFiTimeoutmS :number ; 
    response : number;
    receivedData : string
    MQTTMessageRetrieveState : number ;
    
    MQTTMessage : string;

    private clickBoardNumGlobal:number
    private clickSlotNumGlobal:number
    private clickBoardNumGlobalSetResponse:number

    constructor(boardID: BoardID, clickID:ClickID){
    super(boardID, clickID)
    this.defaultWiFiTimeoutmS = 10000; //default time alloted for timeout on WiFi communication
    this.response = 2;
    this.receivedData = ""; //A place to store the response from the WiFi clickwhen requestting HTTP data
    this.MQTTMessageRetrieveState = 0; //Track MQTT message retrieval state.
    this.MQTTMessage = ""; //Used to store the retrieved message
    this.clickBoardNumGlobal=boardID;
    this.clickSlotNumGlobal=clickID;
    this.clickBoardNumGlobalSetResponse=boardID*3+clickID;   
    }
    
    clearSerialBuffer() {
        //   serial.clearRxBuffer()
    }
    
    WiFiResponse(
        expectedResponse: string,
        IPDResponseTrue: boolean,
        timeoutmS: number
    ) {
        
        let IPDLengthIndexStart = 0; 
        let receivedStr = ""; //The built string
        let tempIndex = 0; 
        this.receivedData = "";
        let IPDResponseLength = 0; //IPD Response length
    
    
        let expectedResponseIndex = 0; //The current position of the expected response comparison
    
        let responseState = 0; //Used to track where we are in parsing the response
        let startTime = input.runningTime(); //Get the time when this was called
       
        while (input.runningTime() < (startTime + timeoutmS)) {
            //Do the code below while timeout hasn't occured
          
    
    
            if(this.isUARTDataAvailable())
            {
               
                receivedStr = receivedStr + this.getUARTData(); //Read the serial port for any received responses
              
            }
             
                    switch (responseState) {
                        case 0:
                       
                            if (receivedStr.indexOf(expectedResponse) != -1)
                            {
                               
                                responseState = 1; //Move to the next stage of response comparison
                               
                            }
                            break;
    
                        case 1:
                       
                                    if (IPDResponseTrue == true) {
                                      
                                        expectedResponseIndex = 0; //Reset the expected response index as we need to start over
    
                                        responseState = 3;
                                    } 
                                    else {
                                        
                                        this.receivedData = receivedStr
                                        return 1; //Succesfully matched
                                    }
                               
                            break;
                  
    
                        case 3:
                            tempIndex = receivedStr.indexOf("+IPD");
                           
                            if ( tempIndex != -1)
                                  {
                                  
                                      expectedResponseIndex = tempIndex;
                                      responseState = 4;
                                  }
                             
                            break;
    
                        case 4:
                            tempIndex = receivedStr.indexOf(",",expectedResponseIndex);
                           
                            if (tempIndex != -1) {
                              
                                IPDLengthIndexStart = tempIndex + 1;
                                responseState = 5;
                            }
                            break;
    
                        case 5:
                            tempIndex = receivedStr.indexOf(":",expectedResponseIndex);
                    
                            if (tempIndex != -1) {
                               
                                expectedResponseIndex = tempIndex;
                                IPDResponseLength = parseInt(receivedStr.substr(IPDLengthIndexStart,(expectedResponseIndex - IPDLengthIndexStart))); //Convert the characters we received representing the length of the IPD response to an integer
                                
                                
                             
                                responseState = 6;
                            }
                              
                            break;
    
                        case 6:
                            if(receivedStr.length >= IPDResponseLength){  //Make sure all of the message has arrived
                                this.receivedData = receivedStr.slice(expectedResponseIndex+1); //Remove everything except the message
                                return 1; //Successfully read
    
                            }
                         
                        
    
                            break;
                    } //Switch
               
            
        }
    
        return 0;
    }
    
    
    
    // ThingSpeakResponse() {
    //     let data = 0;
    //     let dataStr = "";
    //     let responseState = 0; //Used to track where we are in parsing the response
    //     let currentCharIndex = 0; //Used to track the character we are currently looking at
    
    //     let expectedResponseStr = "\"feeds\""; //Used to hold the desired response we are looking for
    //     let expectedResponseLen = expectedResponseStr.length; //Length of the expected Response we are looking for
    //     let expectedResponseIndex = 0; //Used to track the character we are currently looking at for the expected response
    
    //     let receivedDataLen = this.receivedData.length; //Length of the response
    
    //     for (
    //         let currentCharIndex = 0;
    //         currentCharIndex < receivedDataLen;
    //         currentCharIndex++
    //     ) {
    //         switch (responseState) {
    //             case 0:
    //                 if (
    //                     this.receivedData
    //                         .charAt(currentCharIndex)
    //                         .compare(
    //                             expectedResponseStr.charAt(expectedResponseIndex)
    //                         ) == 0
    //                 ) {
    //                     expectedResponseIndex++; //Look at the next character in the expected response next time through
    
    //                     if (expectedResponseIndex == expectedResponseLen) {
    //                         expectedResponseStr = "field1\":\""; //Used to hold the desired response we are looking for
    //                         expectedResponseLen = expectedResponseStr.length; //Length of the expected Response we are looking for
    //                         expectedResponseIndex = 0; //Used to track the character we are currently looking at for the expected response
    //                         responseState = 1; //Move to the next stage of response comparison
    //                     }
    //                 }
    //                 break;
    
    //             case 1:
    //                 if (
    //                     this.receivedData
    //                         .charAt(currentCharIndex)
    //                         .compare(
    //                             expectedResponseStr.charAt(expectedResponseIndex)
    //                         ) == 0
    //                 ) {
    //                     expectedResponseIndex++; //Look at the next character in the expected response next time through
    
    //                     if (expectedResponseIndex == expectedResponseLen) {
    //                         expectedResponseStr = "\""; //Used to hold the desired response we are looking for
    //                         expectedResponseLen = expectedResponseStr.length; //Length of the expected Response we are looking for
    //                         expectedResponseIndex = 0; //Used to track the character we are currently looking at for the expected response
    //                         responseState = 2; //Move to the next stage of response comparison
    //                     }
    //                 }
    //                 break;
    //             case 2:
    //                 if (
    //                     this.receivedData
    //                         .charAt(currentCharIndex)
    //                         .compare(expectedResponseStr.charAt(0)) == 0
    //                 ) {
    //                     data = parseInt(dataStr); //Convert the characters we received representing the length of the IPD response to an integer
    //                     return dataStr;
    //                 } else {
    //                     dataStr = dataStr.concat(
    //                         this.receivedData.charAt(currentCharIndex)
    //                     );
    //                 }
    //                 break;
    //         }
    //     }
    
    //     return "";
    
    //     }
    
        }
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

        //% groups=" 'Initialize and Connect' weight=200 , 'IFTTT','MQTT Adafruit', 'Brilliant Labs Cloud','Bluetooth Click Board' weight=50, 'RFID Click Board', 'NFC Click Board' 'LoRaWAN Click, '3G Click Board' "

    /**
     * Initializes WiFi_BLE capabilities
     * @param boardID the board
     * @param clickID the click
     *  @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect to ssid $ssid| with password $pwd"
    //% blockSetVariable="bBoard_WiFi"
    //% weight=110
    //% group="Initialize and Connect"
    export function createWiFiBLE(ssid: string, pwd:string): WiFi_BLE {
        let wirelessHandle = new WiFi_BLE(0, 0);
        wirelessHandle.WifiConnect(ssid,pwd)
        return wirelessHandle
    }

    let MQTTMessageObject ={
        topic:"", //Topic
   
        key:"", //Project Key
 
        cmd:"", //Command Name
  
        feedName:"", //Feed name
 
        value:"" //Value received 
        
     }

    let mqttMessageList = [MQTTMessageObject]; //Create a blank array of MQTTMessageObject objects
    mqttMessageList.pop(); 


    export enum Command
    {
          
            //% block="Add Feed Data"
            Add_Data = 0,
            //% block="Create Feed"
            Create_Feed = 1,
             //% block="Delete Feed"
             Delete_Feed = 2,
            //% block="Delete Data"
           Delete_Feed_Data = 3,
           //% block="Get Feed Data"
           Get_Feed_Data = 4,

                 
    
    }


    export class WiFi_BLE extends WiFiSetResponses.SetResponse{
        
        private UARTRawData  :  string
        private flag : boolean;
        private BLMQTTMessage : string
        private clickBoardNumGlobalWiFi:number
        private clickSlotNumGlobalWiFi:number
        private clickBoardNumGlobalW:number
        private BLpingActive : boolean;
        private prevTime :number;

        private pingActive : boolean;
        private lastPing : number;
        private pingActiveAdafruit : boolean;
        private lastPingAdafruit : number; 

        //% groups=" 'MQTT' weight=100, 'HTTPS' "

        constructor(boardID: BoardID, clickID:ClickID){
            super(boardID, clickID)
            this.MQTTMessage = ""
            this.UARTRawData  = ""
            this.flag = true;
            this.BLMQTTMessage = ""
            this.clickBoardNumGlobalWiFi=boardID;
            this.clickSlotNumGlobalWiFi=clickID;
            this.clickBoardNumGlobalW=boardID*3+clickID; 
            this.BLpingActive = false;
            this.prevTime = 0;
            this.pingActive = false;
            this.lastPing = 0;
            this.pingActiveAdafruit = false;
            this.lastPingAdafruit = 0; 
      
        }

    // -------------- 3. Cloud ----------------
    //% blockId=publishBLMQTT
    //% block="$this BL MQTT publish$command|feed $feedName data$data|project key $topic"
    //% subcategory="Brilliant Labs Cloud"
    //% group="MQTT"
    //% weight=70   
    //% blockGap=7
    //% command.min=0 command.max=2
    //% this.defl="bBoard_WiFi" 
    publishBLMQTT(command:Command,feedName: string, data: number,topic: string): void {
        let publishPacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE, 0, 0x30); //Publish Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let topicLength = pins.createBuffer(2);
        topicLength.setNumber(NumberFormat.UInt8LE, 0, topic.length >> 8);
        topicLength.setNumber(NumberFormat.UInt8LE, 1, topic.length & 0xFF);
        let cmd = ""
        switch(command)
        {
            case Command.Add_Data:
                cmd = "ADD_FEED_DATA";
                break;

            case Command.Create_Feed:
                cmd = "CREATE_FEED";
                break;     
            
            case Command.Delete_Feed:
                cmd = "DELETE_FEED";
                break;           

                case Command.Delete_Feed_Data:
                cmd = "DELETE_FEED_DATA";
                break;        

       

        }
        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet
        let mqttBody = "{\n    \"key\": \""+topic+ "\",\n    \"cmd\": \""+cmd+"\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
        if(command == Command.Create_Feed)
        {
            mqttBody = "{\n    \"key\": \""+topic+ "\",\n    \"cmd\": \""+cmd+"\",\n    \"name\": \""+feedName+"\"\n}";
        }


        X = 0x02 + topic.length + mqttBody.length

        for (i = 0; i < 4; i++) {
            if (X >= 128) {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, 0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1)
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE, j, remainingLengthTemp.getNumber(NumberFormat.UInt8LE, j))

        }

        publishPacketSize = 1 + remainingLength.length + 2 + topic.length + mqttBody.length



        this.sendString("AT+CIPSEND=0," + publishPacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(topicLength)
        this.sendString(topic)
        this.sendString(mqttBody)
        // UARTs.sendString("\r\n",boardID)


        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)


        //  UARTs.sendString("AT+CIPCLOSE=0\r\n",boardID)
        //  SetResponseObj.response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK"



    }


    // -------------- 3. Cloud ----------------
    //% blockId=connectBLMQTT
    //% block="$this|BL MQTT connect"
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=200   
    //% blockGap=7
    //% this.defl="bBoard_WiFi" 
    connectBLMQTT(): void {

        let connectPacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE, 0, 0x10); //Publish Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let protocolName = "MQTT"

        let protocolNameLength = pins.createBuffer(2);
        protocolNameLength.setNumber(NumberFormat.UInt8LE, 0, protocolName.length >> 8);
        protocolNameLength.setNumber(NumberFormat.UInt8LE, 1, protocolName.length & 0xFF);


        let protocolLevel = pins.createBuffer(1);
        protocolLevel.setNumber(NumberFormat.UInt8LE, 0, 0x04);

        let protocolFlags = pins.createBuffer(1);
        protocolFlags.setNumber(NumberFormat.UInt8LE, 0, 0x02);


        let keepAliveSeconds = 60

        let keepAlive = pins.createBuffer(2);
        keepAlive.setNumber(NumberFormat.UInt8LE, 0, keepAliveSeconds >> 8);
        keepAlive.setNumber(NumberFormat.UInt8LE, 1, keepAliveSeconds & 0xFF);


        let clientID = control.deviceSerialNumber().toString();
        let clientIDLength = pins.createBuffer(2);
        clientIDLength.setNumber(NumberFormat.UInt8LE, 0, clientID.length >> 8);
        clientIDLength.setNumber(NumberFormat.UInt8LE, 1, clientID.length & 0xFF);

        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


        X = protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length //Add up all of the bytes to determine the connect packet size
        connectPacketSize = X

        for (i = 0; i < 4; i++) { //This for loop determines if we need more than one byte to store the remaining length. With MQTT, you can use up to 4 bytes to say how long your remaining length is. 
            if (X >= 128) { //If your remaining length is greater than or equal to 128 bytes (making the 8th bit a 1), the MQTT broker automatically knows that the remaining length will expand another byte
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, 0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1) //Now that we've determined 
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE, j, remainingLengthTemp.getNumber(NumberFormat.UInt8LE, j))

        }

        connectPacketSize = controlPacket.length + remainingLength.length + connectPacketSize; //The total size of the packet to send


        this.clearSerialBuffer()

        this.sendString("AT+CIPMUX=1\r\n")

        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        this.clearSerialBuffer()
        this.sendString("AT+CIPSTART=0,\"TCP\",\"cloud.brilliantlabs.ca\",1883,30\r\n")


        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        this.clearSerialBuffer()
        this.sendString("AT+CIPSEND=0," + connectPacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(protocolNameLength)
        this.sendString(protocolName)
        this.sendBuffer(protocolLevel)
        this.sendBuffer(protocolFlags)
        this.sendBuffer(keepAlive)
        this.sendBuffer(clientIDLength)
        this.sendString(clientID)
 
        // basic.pause(1)
        //UARTs.sendString("\r\n", boardID)



        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)



        



    }


    // -------------- 3. Cloud ----------------
    //% blockId=subscribeBLMQTT
    //% block="$this| BL MQTT subscribe to project key $topic"
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=199   
    //% blockGap=7
    //% this.defl="bBoard_WiFi"  
    subscribeBLMQTT(topic: string): void {
        if (topic.indexOf("-rsp") == 0)
        {
            topic = topic + "-rsp"; //append -rsp to the API key as this is the proper subscription topic name
        }
        
        let subscribePacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE, 0, 0x82); //Subscribe Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let packetID = pins.createBuffer(2); // packet ID 
        packetID.setNumber(NumberFormat.UInt8LE, 0, 0);
        packetID.setNumber(NumberFormat.UInt8LE, 1, 1);

        let topicLength = pins.createBuffer(2);

        topicLength.setNumber(NumberFormat.UInt8LE, 0, topic.length >> 8);
        topicLength.setNumber(NumberFormat.UInt8LE, 1, topic.length & 0xFF);

        let QS = pins.createBuffer(1);
        QS.setNumber(NumberFormat.UInt8LE, 0, 0); //Set QOS to 0

        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


        X = 0x02 + 2 + topic.length + 1

        for (i = 0; i < 4; i++) {
            if (X >= 128) {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, 0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE, i, X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1)
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE, j, remainingLengthTemp.getNumber(NumberFormat.UInt8LE, j))

        }

        subscribePacketSize = 1 + remainingLength.length + 2 + 2 + topic.length + 1



        this.sendString("AT+CIPSEND=0," + subscribePacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(packetID)
        this.sendBuffer(topicLength)
        this.sendString(topic)
        this.sendBuffer(QS) //Quality of service




        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)
        this.clearUARTRxBuffer();
     

        control.inBackground(function () {
            while(1){
                basic.pause(10000);
                this.pingBLMQTT(50);

            }

            
        })


    }
    

   
   
    getBLMQTTMessage(feedName: string): number {
        let returnValue = 0
  
        if(this.isBLMQTTMessage(feedName))
        {
        for(let i=0; i < mqttMessageList.length; i++)
        {
            if(mqttMessageList[i].feedName == feedName)
            {
                returnValue =  parseInt(mqttMessageList[i].value)
                mqttMessageList.removeAt(i);
                return returnValue
            }
        
        }
    }
        return returnValue = null
       
    }

 
    //% blockId=onBLMQTT block="$this on BL Cloud MQTT message received $receivedData from feed $feedName" blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% receivedData.shadow=variables_get
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% draggableParameters=variable
    //% this.defl="bBoard_WiFi"
     onBLMQTT(feedName:string, a: (receivedData:number) => void): void { //Pass user blocks as a callback function "a". 
        bBoard_Control.eventInit(); //Initialize the event processor if not already initialized

        let eventHandler = new bBoard_Control.EventHandler(this.clickBoardNumGlobalWiFi,this.clickSlotNumGlobalWiFi,bBoardEvents.UARTRx,[feedName], ()=>this.getBLMQTTMessage(feedName),<any>a,null);
        
        bBoard_Control.addEvent(eventHandler)
    
    
    }
    
 
   

 
   


    isBLMQTTMessage(feedName: string): boolean {
        let startIndex = 0;
        let endIndex = 0;
        let remainingLength = 0;
        let topicLength = 0;
     

        if (this.UARTRawData.length > 500) {
            this.UARTRawData = ""
        }
       
        if (this.isUARTDataAvailable() || this.UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
        {
            this.UARTRawData = this.UARTRawData + this.getUARTData(); // Retrieve the new data and append it

            let IPDIndex = this.UARTRawData.indexOf("+IPD,0,") //Look for the ESP WiFi response +IPD which indicates data was received
            if (IPDIndex != -1) //If +IPD, was found 
            {
     
                startIndex = this.UARTRawData.indexOf(":") //Look for beginning of MQTT message (which comes after the :)

                if (startIndex != -1) //If a : was found
                {
                    let IPDSizeStr = this.UARTRawData.substr(IPDIndex + 7, startIndex - IPDIndex - 7) //The length of the IPD message is between the , and the :


                    let IPDSize = parseInt(IPDSizeStr)
                    if (this.UARTRawData.length >= IPDSize + startIndex + 1) //Is the whole message here?
                    {
                        startIndex += 1; // Add 1 to the start index to get the first character after the ":"

                        if (this.UARTRawData.charCodeAt(startIndex) != 0x30) //If message type is not a publish packet
                        {
                            this.UARTRawData = this.UARTRawData.substr(startIndex, startIndex); //Remove all data other than the last character (in case there is no more data)
                            return false; //Not a publish packet

                        }
 
                        remainingLength = this.UARTRawData.charCodeAt(startIndex + 1); //Extract the remaining length from the MQTT message (assuming RL < 127) *Need to address this for RL >127

                        topicLength = this.UARTRawData.charCodeAt(startIndex + 3); //Extract the topic length from the MQTT message (assuming TL < 127)
                        MQTTMessageObject.topic = this.UARTRawData.substr(startIndex + 4,topicLength) //Extract the topic 
                      
                        this.MQTTMessage = this.UARTRawData.substr(startIndex + 4 + topicLength, remainingLength - topicLength - 2)

                        startIndex = this.MQTTMessage.indexOf("\"key\":")+8; //Retrieve the start of the word "key" and then add 8 to bring it to the first character of the key
                        endIndex = this.MQTTMessage.indexOf("\"",startIndex)-1; //Retrieve the end of the key by looking for the ' " ' and then subtracting 1 to get the last character of the key

                        MQTTMessageObject.key = this.MQTTMessage.substr(startIndex,endIndex-startIndex+1)  //Extract the key 
                     
                        startIndex = this.MQTTMessage.indexOf("\"cmd\":")+7; //Retrieve the start of the word "cmd" and then add 8 to bring it to the first character of the command
                        endIndex = this.MQTTMessage.indexOf("\"",startIndex)-1; //Retrieve the end of the command name by looking for the ' " ' and then subtracting 1 to get the last character of the command

                        MQTTMessageObject.cmd = this.MQTTMessage.substr(startIndex,endIndex-startIndex+1) //Extract the command name 
                    
                        startIndex = this.MQTTMessage.indexOf("\"name\":")+9; //Retrieve the start of the word "name" and then add 9 to bring it to the first character of variable name
                        endIndex = this.MQTTMessage.indexOf("\"",startIndex)-1; //Retrieve the end of the variable name by looking for the ' " ' and then subtracting 1 to get the last character of the name

                        MQTTMessageObject.feedName = this.MQTTMessage.substr(startIndex,endIndex-startIndex+1) //Extract the variable name 
                       
                        startIndex = this.MQTTMessage.indexOf("\"value\":")+9; //Retrieve the start of the word "value" and then add 9 to bring it to the first character of variable value
                        endIndex = this.MQTTMessage.indexOf("}",startIndex)-2; //Retrieve the end of the variable value by looking for the ' " ' and then subtracting 2 to get the last character of the value

                        MQTTMessageObject.value = this.MQTTMessage.substr(startIndex,endIndex-startIndex+1) //Extract the variable value
                        if(MQTTMessageObject.cmd  == "ADD_FEED_DATA") //We are only concerned with the case where an existing variable had a new value added to it (for now)
                        {
                            mqttMessageList.push(MQTTMessageObject); //Add the latest message to our list
                            
                        }
                        

                        this.UARTRawData = this.UARTRawData.substr(IPDSize + startIndex, this.UARTRawData.length - 1) //Remove all data other than the last character (in case there is no more data)

                        

                    }


                }
            }
            else
            {
                this.UARTRawData = ""
            }


        }
       
        let results = mqttMessageList.filter(tempResults => tempResults.feedName === feedName)
        if(results.length >= 1) //If a value was found
        {
            return true; 
        }
        return false;

    }




    // -------------- 3. Cloud ----------------

    pingBLMQTT(pingInterval: number) {
        let PINs = new bBoard_Control.PinSettings(this.clickBoardNumGlobalWiFi, this.clickSlotNumGlobalWiFi);
        if (this.BLpingActive == false) {
            this.lastPing = input.runningTime();
            let controlPacket = pins.createBuffer(1);
            controlPacket.setNumber(NumberFormat.UInt8LE, 0, 0xC0); //Subscribe Control Packet header
            let remainingLength = pins.createBuffer(1) //size of remaining Length packet
            remainingLength.setNumber(NumberFormat.UInt8LE, 0, 0x00); //Remaining Length = 0 

            this.sendString("AT+CIPSEND=0,2\r\n")
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
            this.sendBuffer(controlPacket);
            this.sendBuffer(remainingLength);
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

            this.BLpingActive = true;
        }
        else //If a ping has been sent
        {
            if ((input.runningTime() - this.lastPing) > pingInterval * 1000) {
                this.BLpingActive = false;
            }
        }




    }

    WifiConnect(ssid: string, pwd: string): void {
        let PINs = new bBoard_Control.PinSettings(this.clickBoardNumGlobalWiFi, this.clickSlotNumGlobalWiFi);
        PINs.clearPin(clickIOPin.CS)
        PINs.setPin(clickIOPin.CS)
        basic.pause(1000)
        this.clearUARTRxBuffer();
 


        this.sendString("AT+CWMODE=1\r\n"); //Put the clickinto station (client) mode
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        this.sendString("AT+CIPMUX=1\r\n");  //Enable multiple connections
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        this.sendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n");  //Connect to WiFi Network
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        if(this.response == 0)
        {
            basic.showString("WiFi Error")
        }
        this.clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        this.sendString("AT+CIPSTATUS\r\n");  //Get information about the connection status
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        this.sendString("AT+CIFSR\r\n");  //Get local IP Address
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
    }

 
    // sendThingspeak(
    //     key: string,
    //     fieldNum: number,
    //     data: string
    // ): void {
    //     let getData =
    //         "GET /update?api_key=" +
    //         key +
    //         "&field" +
    //         fieldNum.toString() +
    //         "=" +
    //         data +
    //         "\r\n";

    //         this.sendString("AT+CIPMUX=1\r\n"); 
    //         this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);

    //         this.sendString("AT+CIPSTART=0,\"TCP\",\"api.thingspeak.com\",80\r\n"); 
    //         this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);

    //         this.sendString(
    //         "AT+CIPSEND=0," + getData.length.toString() + "\r\n");
    //         this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);

    //         this.sendString(getData);
    //         this.response = this.WiFiResponse("OK", true, this.defaultWiFiTimeoutmS);
    //     //*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
    //     // UARTs.sendString("AT+CIPCLOSE=0\r\n",boardID)
    //     //response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK"
    // }

    // -------------- 3. Cloud ----------------
    //% blockId=WiFi_BLE_HTTPSsendCommand
    //% block="$this| BL HTTPS command %command|feed name %feedName|data %data|project key %topic|"
    //% weight=90
    //% group="HTTPS"
    //% subcategory="Brilliant Labs Cloud"
    //% blockGap=7
    //% this.defl="bBoard_WiFi"
    HTTPSsendCommand(
        command:Command,
        feedName: string,
        data: number,
        topic: string
    ): void {
        let cmd = ''
        switch(command)
        {
            case Command.Add_Data:
                cmd = "ADD_FEED_DATA";
                break;

            case Command.Create_Feed:
                cmd = "CREATE_FEED";
                break;     
            
            case Command.Delete_Feed:
                cmd = "DELETE_FEED";
                break;           

                case Command.Delete_Feed_Data:
                cmd = "DELETE_FEED_DATA";
                break;        

       



        }

        let bodyString = "{\n    \"key\": \""+topic+ "\",\n   \"cmd\": \""+cmd+"\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
        if(command = Command.Create_Feed)
        {
            bodyString = "{\n    \"key\": \""+topic+ "\",\n   \"cmd\": \""+cmd+"\",\n   \"type\": \"LINE\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
        }
        let getData ="GET /api? HTTP/1.1\r\n" +
            "Host: cloud.brilliantlabs.ca\r\n" +
            "Content-Type: application/json\r\n" +
            "cache-control: no-cache\r\n" +
            "Content-Length: "+bodyString.length.toString()+"\r\n\r\n" + bodyString;
            
        
        if( this.isConnected() == 0){

            this.sendString("AT+CIPSTART=0,\"SSL\",\"cloud.brilliantlabs.ca\",443\r\n"); 
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);
        }
     

        this.sendString(
            "AT+CIPSEND=0," + getData.length.toString() + "\r\n");
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);

            this.sendString(getData);

            this.response = this.WiFiResponse("OK", true, this.defaultWiFiTimeoutmS);



    }

        isConnected():number{
            this.sendString("AT+CIPSTATUS\r\n"); 
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);
        
        let statusStartIndex = this.receivedData.indexOf("STATUS:")
       
        let connected = parseInt(this.receivedData.substr(statusStartIndex+7,1)); //Convert the characters we received representing the length of the IPD response to an integer
      
        if (connected == 3)
        {
          
           
            return 1;
        }
     
        
        return 0;
     }
       
  
    //% blockId=WiFi_BLE_getVariable
    //% block="$this| BL HTTPS get feed $feedName with project key$key"
    //% weight=90
    //% group="HTTPS"
    //% subcategory="Brilliant Labs Cloud"
    //% blockGap=7
    //% this.defl="bBoard_WiFi"
    BLgetVariable(
        feedName: string,
        key: string
    ): number {
        let bodyString = "{\n    \"key\": \""+key+ "\",\n   \"cmd\": \"GET_VARIABLE\",\n    \"name\": \""+feedName+"\"\n}";

        let getData ="GET /api? HTTP/1.1\r\n" +
            "Host: cloud.brilliantlabs.ca\r\n" +
            "Content-Type: application/json\r\n" +
            "cache-control: no-cache\r\n" +
            "Content-Length: "+bodyString.length.toString()+"\r\n\r\n" + bodyString;

            if( this.isConnected() == 0){

                this.sendString("AT+CIPSTART=0,\"SSL\",\"cloud.brilliantlabs.ca\",443\r\n"); 
                this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);
            }

            this.sendString(
            "AT+CIPSEND=0," + getData.length.toString() + "\r\n");
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS);

            this.sendString(getData);

            this.response = this.WiFiResponse("OK", true, this.defaultWiFiTimeoutmS);

        let startIndex = this.receivedData.indexOf("\""+feedName+"\":")+feedName.length+3; 

        let endIndex = this.receivedData.indexOf("}",startIndex)-1;
      

        return parseInt(this.receivedData.substr(startIndex,endIndex-startIndex+1))



    }



    // getThingspeak(channelID: number, fieldNum: number): string {
    //     let getData =
    //         "GET /channels/" +
    //         channelID.toString() +
    //         "/fields/" +
    //         fieldNum.toString() +
    //         ".json?results=1\r\n";
    //     let data = "";

    //     this.sendString("AT+CIPMUX=1\r\n")
    //     this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

    //     this.sendString("AT+CIPSTART=0,\"TCP\",\"api.thingspeak.com\",80\r\n"); 
    //     this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

    //     this.sendString(
    //         "AT+CIPSEND=0," + getData.length.toString() + "\r\n"
    //     );
    //     this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

    //     this.sendString(getData);
    //     this.response = this.WiFiResponse("OK", true, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

    //     data = this.ThingSpeakResponse();

    //     //*** Need to address this. Use CIPSTATUS to see when TCP connection is closed as thingspeak automatically closes it when message sent/received */
    //     // UARTs.sendString("AT+CIPCLOSE=0\r\n",boardID)
    //     // SetResponseObj.response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK" //Wait for the response "OK"

    //     return data;
    // }

    //% blockId=BL_set_ifttt
    //% block="$this IFTTT send key $key event_name $event data $value1 "
    //% subcategory="IFTTT"
    //% weight=90
    //% this.defl="bBoard_WiFi"
    sendIFTTT(
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

            this.sendString("AT+CIPMUX=1\r\n");  //Multiple connections enabled
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

            this.sendString("AT+CIPSTART=0,\"TCP\",\"maker.ifttt.com\",80\r\n");  //Make a TCP connection to the host
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

            this.sendString(
            "AT+CIPSEND=0," + getData.length.toString() + "\r\n"
        ); //Get ready to send a packet and specifiy the size
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendString(getData); //Send the contents of the packet
        this.response = this.WiFiResponse("OK", true, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendString("AT+CIPCLOSE=0\r\n");  //Close your TCP connection
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
    }

    // -------------- 3. Cloud ----------------
    //% blockId=publishAdafruitMQTT
    //% block="$this Adafruit MQTT publish data %data to topic %topic  "
    //% group="MQTT"
    //% subcategory="Adafruit.io"
    //% weight=70   
    //% blockGap=7
    //% this.defl="bBoard_WiFi"  
    publishAdafruitMQTT(topic: string, data: number): void {
        let publishPacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE,0,0x30); //Publish Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let topicLength = pins.createBuffer(2);
        topicLength.setNumber(NumberFormat.UInt8LE,0,topic.length >> 8); 
        topicLength.setNumber(NumberFormat.UInt8LE,1,topic.length & 0xFF); 

        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


        X = 0x02 + topic.length + data.toString().length 

        for (i = 0; i < 4; i++) {
            if (X >= 128) {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1)
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

        }

        publishPacketSize = 1 + remainingLength.length + 2 + topic.length + data.toString().length


  
        this.sendString("AT+CIPSEND=0," + publishPacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(topicLength)
        this.sendString(topic)
        this.sendString(data.toString())
       // UARTs.sendString("\r\n",boardID)


       this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)


      //  UARTs.sendString("AT+CIPCLOSE=0\r\n",boardID)
      //  SetResponseObj.response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK"



    }


    // -------------- 3. Cloud ----------------
    //% blockId=connectMQTT
    //% block="$this|Adafruit MQTT connect with username$userName and AIO Key$password "
    //% group="MQTT"
    //% subcategory="Adafruit.io"
    //% weight=70   
    //% blockGap=7
    //% this.defl="bBoard_WiFi" 
    connectMQTT(userName: string, password: string): void {

        let connectPacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE,0,0x10); //Publish Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let protocolName = "MQTT"

        let protocolNameLength = pins.createBuffer(2);
        protocolNameLength.setNumber(NumberFormat.UInt8LE,0,protocolName.length >> 8); 
        protocolNameLength.setNumber(NumberFormat.UInt8LE,1,protocolName.length & 0xFF); 


        let protocolLevel = pins.createBuffer(1);
        protocolLevel.setNumber(NumberFormat.UInt8LE,0,0x04); 
      
        let protocolFlags = pins.createBuffer(1);
        protocolFlags.setNumber(NumberFormat.UInt8LE,0,0xC2); 
      
     
        let keepAliveSeconds = 60

        let keepAlive = pins.createBuffer(2);
        keepAlive.setNumber(NumberFormat.UInt8LE,0,keepAliveSeconds >> 8); 
        keepAlive.setNumber(NumberFormat.UInt8LE,1,keepAliveSeconds & 0xFF); 

     
        let clientID = control.deviceSerialNumber().toString();
        let clientIDLength = pins.createBuffer(2);
        clientIDLength.setNumber(NumberFormat.UInt8LE,0,clientID.length >> 8); 
        clientIDLength.setNumber(NumberFormat.UInt8LE,1,clientID.length & 0xFF); 
        
            
        let userNameLength = pins.createBuffer(2);
        userNameLength.setNumber(NumberFormat.UInt8LE,0,userName.length >> 8); 
        userNameLength.setNumber(NumberFormat.UInt8LE,1,userName.length & 0xFF); 

        let passwordLength = pins.createBuffer(2);
        passwordLength.setNumber(NumberFormat.UInt8LE,0,password.length >> 8); 
        passwordLength.setNumber(NumberFormat.UInt8LE,1,password.length & 0xFF); 

    

        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


        X = 0x02 + 0x02 + protocolName.length + 0x01 + 0x01 + 0x02 + 0x02 + clientID.length + 0x02 + userName.length + 0x02 + password.length 
        connectPacketSize = X

        for (i = 0; i < 4; i++) {
            if (X >= 128) {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1)
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

        }

        connectPacketSize = connectPacketSize + 1 + remainingLength.length //The total size of the packet to send


        this.clearSerialBuffer()

        this.sendString("AT+CIPMUX=1\r\n")

        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        this.clearSerialBuffer()
        this.sendString("AT+CIPSTART=0,\"TCP\",\"io.adafruit.com\",1883,30\r\n")


        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        this.clearSerialBuffer()
        this.sendString("AT+CIPSEND=0," + connectPacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
       
        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(protocolNameLength)
        this.sendString(protocolName)
        this.sendBuffer(protocolLevel)
        this.sendBuffer(protocolFlags)
        this.sendBuffer(keepAlive)
        this.sendBuffer(clientIDLength)
        this.sendString(clientID)
        this.sendBuffer(userNameLength)
        this.sendString(userName)
        this.sendBuffer(passwordLength)
        
        this.sendString(password)
        
        this.sendString("\r\n")



        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)



    }


    // -------------- 3. Cloud ----------------
    //% blockId=subscribeAdafruitMQTT
    //% block="$this|Adafruit MQTT subscribe to topic $topic"
    //% group="MQTT"
    //% subcategory="Adafruit.io"
    //% weight=70   
    //% blockGap=7
    //% this.defl="bBoard_WiFi" 
    subscribeAdafruitMQTT(topic: string): void {

        let subscribePacketSize = 0
        let controlPacket = pins.createBuffer(1);
        controlPacket.setNumber(NumberFormat.UInt8LE,0,0x82); //Subscribe Control Packet header

        let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
        let packetID = pins.createBuffer(2); // packet ID 
        packetID.setNumber(NumberFormat.UInt8LE,0,0);
        packetID.setNumber(NumberFormat.UInt8LE,1,1);

        let topicLength = pins.createBuffer(2);

        topicLength.setNumber(NumberFormat.UInt8LE,0,topic.length >> 8); 
        topicLength.setNumber(NumberFormat.UInt8LE,1,topic.length & 0xFF); 

        let QS = pins.createBuffer(1);
        QS.setNumber(NumberFormat.UInt8LE,0,0); //Set QOS to 0

        let i = 0
        let encodedByte = 0
        let X = 0
        let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


        X = 0x02 + 2 + topic.length + 1

        for (i = 0; i < 4; i++) {
            if (X >= 128) {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
                X -= 127
            }
            else {
                remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
                break;

            }

        }


        let remainingLength = pins.createBuffer(i + 1)
        for (let j = 0; j < i + 1; j++) {
            remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

        }

        subscribePacketSize = 1 + remainingLength.length + 2 + 2 + topic.length +1


  
        this.sendString("AT+CIPSEND=0," + subscribePacketSize.toString() + "\r\n")
        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

        this.sendBuffer(controlPacket)
        this.sendBuffer(remainingLength)
        this.sendBuffer(packetID)
        this.sendBuffer(topicLength)
        this.sendString(topic)
        this.sendBuffer(QS) //Quality of service

     


        this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)
        this.clearUARTRxBuffer();

        control.inBackground(function () {
            while(1){
                basic.pause(10000);
                
                this.pingAdafruitMQTT(50);

            }

            
        })
        
    }
    
    // -------------- 3. Cloud ----------------
    //% blockId=getMQTTMessage
    //% block="$this Adafruit MQTT get message"
    //% group="MQTT"
    //% subcategory="Adafruit.io"
    //% weight=70   
    //% blockGap=7
    //% this.defl="bBoard_WiFi" 
    getMQTTMessage(): string {
        return this.MQTTMessage
    }
  
     


   // -------------- 3. Cloud ----------------
    //% blockId=isMQTTMessage
    //% block="$this Adafruit MQTT is message available?"
    //% group="MQTT"
    //% subcategory="Adafruit.io"
    //% weight=70   
    //% blockGap=7
    //% this.defl="bBoard_WiFi"
    isMQTTMessage(): boolean{
        let startIndex = 0;
        let remainingLength = 0;
        let topicLength = 0;
       if(this.UARTRawData.length > 300){
        this.UARTRawData = ""
       }
      if(this.isUARTDataAvailable() || this.UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
      {
    
            this.UARTRawData = this.UARTRawData + this.getUARTData(); // Retrieve the new data and append it
   
            let IPDIndex = this.UARTRawData.indexOf("+IPD,0,") //Look for the ESP WiFi response +IPD which indicates data was received
            if(IPDIndex !== -1) //If +IPD, was found 
            {
            
                
                startIndex = this.UARTRawData.indexOf(":") //Look for beginning of MQTT message (which comes after the :)
               
                if(startIndex != -1) //If a : was found
                {
                    let IPDSizeStr = this.UARTRawData.substr(IPDIndex+7,startIndex-IPDIndex-7) //The length of the IPD message is between the , and the :
                   
                    
                    let IPDSize = parseInt(IPDSizeStr)
                    if(this.UARTRawData.length >= IPDSize + startIndex + 1) //Is the whole message here?
                    {

                        startIndex += 1; // Add 1 to the start index to get the first character after the ":"

                        if(this.UARTRawData.charCodeAt(startIndex) != 0x30) //If message type is not a publish packet
                        {

                            return false; //Not a publish packet

                        }
                        
                        remainingLength = this.UARTRawData.charCodeAt(startIndex + 1); //Extract the remaining length from the MQTT message (assuming RL < 127)
        
                        topicLength = this.UARTRawData.charCodeAt(startIndex + 3); //Extract the topic length from the MQTT message (assuming TL < 127)
                    
                        this.MQTTMessage  = this.UARTRawData.substr(startIndex + 4+topicLength,remainingLength-topicLength-2)
                    
                        this.UARTRawData = this.UARTRawData.substr(IPDSize + startIndex,this.UARTRawData.length-1) //Remove all data other than the last character (in case there is no more data)
                 
                        return true; //Message retrieved
                      
                    }
              
                    
                }
            }
     

        }
            return false;
            
    }



    pingAdafruitMQTT(pingInterval: number) 
    {
        if(this.pingActiveAdafruit == false)
        {
            this.lastPingAdafruit = input.runningTime();
            let controlPacket = pins.createBuffer(1);
            controlPacket.setNumber(NumberFormat.UInt8LE,0,0xC0); //Subscribe Control Packet header
            let remainingLength = pins.createBuffer(1) //size of remaining Length packet
            remainingLength.setNumber(NumberFormat.UInt8LE,0,0x00); //Remaining Length = 0 
    
            this.sendString("AT+CIPSEND=0,2\r\n")
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"
            this.sendBuffer(controlPacket);
            this.sendBuffer(remainingLength);
            this.response = this.WiFiResponse("OK", false, this.defaultWiFiTimeoutmS); //Wait for the response "OK"

            this.pingActiveAdafruit = true;
        }
        else //If a ping has been sent
        {
            if ((input.runningTime() - this.lastPingAdafruit) > pingInterval*1000) 
            {
                this.pingActiveAdafruit = false;
            }
        }
        
    
            
        
    }
}
}
