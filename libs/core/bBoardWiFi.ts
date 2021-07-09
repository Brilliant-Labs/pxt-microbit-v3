
                
    let defaultWiFiTimeoutmS = 30000 ; 
    let response : number;
    let receivedData : string
    let MQTTMessageRetrieveState : number ;
    
    let MQTTMessage : string;

    let boardIDGlobal = 0;
    let clickIDGlobal = 0;
    let MQTTString:string


        
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
          
    
    
            if(bBoard_Control.isUARTDataAvailable(0,0))
            {
               
                receivedStr = receivedStr + bBoard_Control.getUARTData(0,0); //Read the serial port for any received responses
              
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
                                        
                                        receivedData = receivedStr
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
                                receivedData = receivedStr.slice(expectedResponseIndex+1); //Remove everything except the message
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
//% groups=" 'Initialize and Connect' weight=200 , 'IFTTT','MQTT Adafruit', 'Brilliant Labs Cloud' "

 
  
        
        
        
        
         

            
            export function clearSerialBuffer() {
                //   serial.clearRxBuffer()
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



        
        let UARTRawData  :  string

        let BLpingActive = false;
        let prevTime :number;

        let pingActive = false;
        let lastPing = 0;
        let pingActiveAdafruit : boolean;
        let lastPingAdafruit : number; 



    // -------------- 3. Cloud ----------------
    //% blockId=publishBLMQTT
    //% block="BL MQTT publish$data to feed$feedName and project key $topic"
    //% subcategory="Brilliant Labs Cloud"
    //% group="MQTT"
    //% weight=70   
    //% blockGap=7
    export function publishBLMQTT(feedName: string, data: number,topic: string): void {
    
        let currentBufferIndex = 0;


        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 

        let cmd = "ADD_FEED_DATA";
        let mqttBody = "{\n    \"key\": \""+topic+ "\",\n    \"cmd\": \""+cmd+"\",\n    \"value\": "+data.toString()+",\n    \"name\": \""+feedName+"\"\n}";
        //remaining length =  topic Length = 2 bytes +  topic = topic.length bytes + mqttBody.length bytes
        let remainingLength = 2 + topic.length + mqttBody.length;
        //publishPacketSize = control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let publishPacketSize = 1 + 1 + remainingLength
        let MQTTpublishPacket= pins.createBuffer(publishPacketSize)



        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x30); //Publish Packet header
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length >> 8); //Topic (project key) Length MSB 
        MQTTpublishPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length & 0xFF); //Topic (project key) Length LSB
        MQTTpublishPacket.write(currentBufferIndex,control.createBufferFromUTF8(topic+mqttBody))


         BLMQTTPacketSend(MQTTpublishPacket);


        basic.pause(200)




    }

    // -------------- 3. Cloud ----------------
    //% blockId=connectBLMQTT
    //% block="|BL MQTT connect"
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=200   
    //% blockGap=7
    //% defl="bBoard_WiFi" 
    export function connectBLMQTT(): void {
        let currentBufferIndex = 0;
       
        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 
        let clientID = control.deviceSerialNumber().toString()
        let clientIDLength = control.deviceSerialNumber().toString().length
        let remainingLength = clientIDLength + 12
        let packetSize = remainingLength + 1 + 1; //Remaining length + 1 byte for control packet + 1 byte for remaining length byte (Note: assuming remaining length < 127 bytes)
        let MQTTconnectPacket= pins.createBuffer(packetSize)



        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x10); //Publish Control Packet header
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Protocol Name "MQTT" Length MSB = 0 
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 4); //Protocol Name "MQTT" Length LSB = 4 characters
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x4D); //M
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x51); //Q
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x54); //T
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x04); //Protocol Level
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x02); //Protocol Flags
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Keep Alive MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 60); //Keep Alive LSB = 60 seconds
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //ClientID Length MSB = 0
        MQTTconnectPacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, clientIDLength); //ClientID Length LSB 
        MQTTconnectPacket.write(currentBufferIndex,control.createBufferFromUTF8(clientID))
        bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"cloud.brilliantlabs.ca\",1883,30\r\n",boardIDGlobal,clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
     
 
        BLMQTTPacketSend(MQTTconnectPacket)
        



    }

    function BLMQTTPacketSend(packet:Buffer)
    {
        clearSerialBuffer()





        bBoard_Control.UARTSendString("AT+CIPSEND=0," + packet.length.toString() + "\r\n",boardIDGlobal,clickIDGlobal)
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

        bBoard_Control.UARTSendBuffer(packet,boardIDGlobal,clickIDGlobal)


        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        basic.pause(200)


    }


    // -------------- 3. Cloud ----------------
    //% blockId=subscribeBLMQTT
    //% block="| BL MQTT subscribe to project key $topic"
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% weight=199   
    //% blockGap=7
    //% defl="bBoard_WiFi"  
    export function subscribeBLMQTT(topic: string): void {

        if (topic.indexOf("-rsp") == 0)
        {
            topic = topic + "-rsp"; //append -rsp to the API key as this is the proper subscription topic name
        }
        

        let currentBufferIndex = 0;


        //              2           +       4             +         1            +          1           +         2        +        2              +    control.deviceSerialNumber().toString().length
        //protocolNameLength.length + protocolName.length + protocolLevel.length + protocolFlags.length + keepAlive.length + clientIDLength.length + clientID.length 

        //remaining length =  PackedID = 2 bytes + topic Length = 2 bytes +  topic = topic.length bytes + QOS = 1 byte
        let remainingLength = 2 + 2 + topic.length + 1; 
        //publishPacketSize = subscribe control Packet = 1 byte + remainingLengthSize = 1 byte + remaining Length from above
        let subscribePacketSize = 1 + 1 + remainingLength
        let MQTTsubscribePacket= pins.createBuffer(subscribePacketSize)
 

        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0x82); //Subscribe Control Packet header
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, remainingLength); //Remaining Length
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 0); //Packed ID MSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, 1); //Packet ID LSB
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length >> 8); //Topic (project key) Length MSB 
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, currentBufferIndex++, topic.length & 0xFF); //Topic (project key) Length LSB
        MQTTsubscribePacket.write(currentBufferIndex,control.createBufferFromUTF8(topic))
        MQTTsubscribePacket.setNumber(NumberFormat.UInt8LE, MQTTsubscribePacket.length-1, 0); //QOS


        BLMQTTPacketSend(MQTTsubscribePacket)

        control.inBackground(function () {
            while(1){
                basic.pause(10000);
                pingBLMQTT(50);

            }

            
        })


    }
    

   
   
    export function  getBLMQTTMessage(feedName: string): number {
        let returnValue = 0
  
        if(isBLMQTTMessage(feedName))
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

 

    
    //% blockId=onBLMQTT block=" on BL Cloud MQTT message received $receivedData from feed $feedName" blockAllowMultiple=1
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
    //% receivedData.shadow=variables_get
    //% group="MQTT"
    //% subcategory="Brilliant Labs Cloud"
    //% draggableParameters=variable
    export function onBLMQTT(feedName:string, a: (receivedData:number) => void): void { //Pass user blocks as a callback export function "a". 
    bBoard_Control.eventInit(bBoardEvents.UARTRx,0,0) //set on BLiX

    control.onEvent(bBoard_Control.BLiX_INT_EVENT,bBoard_Control.getEventValue(BoardID.zero,BUILT_IN_PERIPHERAL,bBoardEvents.UARTRx),() => BLMQTTEvent(feedName,a)) //Set interrupt mb
        
    
    }

    function BLMQTTEvent(feedName:string,a:(data:number)=>void)
    {
  
        let feedData = getBLMQTTMessage(feedName)
        if(feedData)
        {
       
            a(feedData)
        }
        
    }
    

   

 
   


    export function  isBLMQTTMessage(feedName: string): boolean {
        let startIndex = 0;
        let endIndex = 0;
        let remainingLength = 0;
        let topicLength = 0;
        let key:string;

        if (UARTRawData.length > 500) {
            UARTRawData = ""
        }
       
        if (bBoard_Control.isUARTDataAvailable(boardIDGlobal,clickIDGlobal) || UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
        {
            UARTRawData = UARTRawData + bBoard_Control.getUARTData(boardIDGlobal,clickIDGlobal); // Retrieve the new data and append it

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
                        let jsonStart = UARTRawData.indexOf("{")-1
                        let jsonEnd = UARTRawData.indexOf("}")+1
                
                              
                        MQTTMessage = UARTRawData.slice(jsonStart, jsonEnd)

                    
                        MQTTMessageObject.key = ParseJSONValue("\"key\":") //Extract the value 
                        MQTTMessageObject.cmd = ParseJSONValue("\"cmd\":") //Extract the value 
                        MQTTMessageObject.feedName =ParseJSONValue("\"feed\":") //Extract the value 
                        MQTTMessageObject.value = ParseJSONValue("\"value\":") //Extract the value 

                        if(MQTTMessageObject.cmd  == "ADD_FEED_DATA") //We are only concerned with the case where an existing variable had a new value added to it (for now)
                        {
                            mqttMessageList.push(MQTTMessageObject); //Add the latest message to our list
                            
                        }
                        

                        UARTRawData = UARTRawData.substr(IPDSize + startIndex) //Remove all data other than the last character (in case there is no more data)

                        

                    }


                }
            }
            else
            {
                UARTRawData = ""
            }


        }
       
        let results = mqttMessageList.filter(tempResults => tempResults.feedName === feedName)
        if(results.length >= 1) //If a value was found
        {
            return true; 
        }
        return false;

    }

    function ParseJSONValue(key:string):string
    {
        let startIndex = MQTTMessage.indexOf(key)+key.length; //Retrieve the start of the JSON key and then add the length of it to bring it to the end of the key
         startIndex = MQTTMessage.indexOf("\"")+1 //Get the start of the value 
        let endIndex = MQTTMessage.indexOf("\"",startIndex)-1; //Retrieve the end of the value by looking for the ' " ' and then subtracting 1 to get the last character of the key
        return MQTTMessage.substr(startIndex, endIndex-startIndex+1 ) //Extract the value 
    }



    // -------------- 3. Cloud ----------------

    export function pingBLMQTT(pingInterval: number) {
    
        if (BLpingActive == false) {
            lastPing = input.runningTime();
            let MQTTPingPacket = pins.createBuffer(2);
            MQTTPingPacket.setNumber(NumberFormat.UInt8LE, 0, 0xC0); //Subscribe Control Packet header
            MQTTPingPacket.setNumber(NumberFormat.UInt8LE, 0, 0x00); //Remaining Length = 0 

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
     *  @param WiFi_BLE the WiFi_BLE Object
     */
    //% block="connect to ssid $ssid| with password $pwd"
    //% weight=110
    //% group="Initialize and Connect"
    export function  WifiConnect(ssid: string, pwd: string): void {

       bBoard_Control.writePin(0,clickIOPin.CS,boardIDGlobal,clickIDGlobal)
       bBoard_Control.writePin(1,clickIOPin.CS,boardIDGlobal,clickIDGlobal)
        basic.pause(1000)
        bBoard_Control.clearUARTRxBuffer(boardIDGlobal,clickIDGlobal);
 


        bBoard_Control.UARTSendString("AT+CWMODE=1\r\n",boardIDGlobal,clickIDGlobal); //Put the clickinto station (client) mode
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n",boardIDGlobal,clickIDGlobal);  //Enable multiple connections
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CWJAP=\"" + ssid + "\",\"" + pwd + "\"\r\n",boardIDGlobal,clickIDGlobal);  //Connect to WiFi Network
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        if(response == 0)
        {
            basic.showString("WiFi Error")
        }
        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n",boardIDGlobal,clickIDGlobal);  //Get information about the connection status
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

        clearSerialBuffer(); //Clear any characters from the RX Buffer that came after the previous Response
        bBoard_Control.UARTSendString("AT+CIFSR\r\n",boardIDGlobal,clickIDGlobal);  //Get local IP Address
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    }

    export function isConnected():number{
        bBoard_Control.UARTSendString("AT+CIPSTATUS\r\n",boardIDGlobal,clickIDGlobal); 
        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS);
    
    let statusStartIndex = receivedData.indexOf("STATUS:")
   
    let connected = parseInt(receivedData.substr(statusStartIndex+7,1)); //Convert the characters we received representing the length of the IPD response to an integer
  
    if (connected == 3)
    {
      
       
        return 1;
    }
 
    
    return 0;
 }
}

/* 

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

    //% blockId=BL_set_ifttt
    //% block=" IFTTT send key $key event_name $event data $value1 "
    //% subcategory="IFTTT"
    //% weight=90
    //% defl="bBoard_WiFi"
    //     export function sendIFTTT(
    //         key: string,
    //         eventname: string,
    //         value1: number
    //     ): void {
    //         let getData =
    //             "GET /trigger/" +
    //             eventname +
    //             "/with/key/" +
    //             key +
    //             "?value1=" +
    //             value1.toString() +
    //             " HTTP/1.1\r\nHost: maker.ifttt.com\r\n\r\n";

    //             bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n",boardIDGlobal,clickIDGlobal);  //Multiple connections enabled
    //             response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //             bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"maker.ifttt.com\",80\r\n",boardIDGlobal,clickIDGlobal);  //Make a TCP connection to the host
    //             response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //             bBoard_Control.UARTSendString(
    //             "AT+CIPSEND=0," + getData.length.toString() + "\r\n"
    //             ,boardIDGlobal,clickIDGlobal); //Get ready to send a packet and specifiy the size
    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //         bBoard_Control.UARTSendString(getData,boardIDGlobal,clickIDGlobal); //Send the contents of the packet
    //         response = WiFiResponse("OK", true, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //         bBoard_Control.UARTSendString("AT+CIPCLOSE=0\r\n",boardIDGlobal,clickIDGlobal);  //Close your TCP connection
    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //     }

    //     // -------------- 3. Cloud ----------------
    //     //% blockId=publishAdafruitMQTT
    //     //% block=" Adafruit MQTT publish data %data to topic %topic  "
    //     //% group="MQTT"
    //     //% subcategory="Adafruit.io"
    //     //% weight=70   
    //     //% blockGap=7
    //     //% defl="bBoard_WiFi"  
    //     export function publishAdafruitMQTT(topic: string, data: number): void {
    //         let publishPacketSize = 0
    //         let controlPacket = pins.createBuffer(1);
    //         controlPacket.setNumber(NumberFormat.UInt8LE,0,0x30); //Publish Control Packet header

    //         let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
    //         let topicLength = pins.createBuffer(2);
    //         topicLength.setNumber(NumberFormat.UInt8LE,0,topic.length >> 8); 
    //         topicLength.setNumber(NumberFormat.UInt8LE,1,topic.length & 0xFF); 

    //         let i = 0
    //         let encodedByte = 0
    //         let X = 0
    //         let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


    //         X = 0x02 + topic.length + data.toString().length 

    //         for (i = 0; i < 4; i++) {
    //             if (X >= 128) {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
    //                 X -= 127
    //             }
    //             else {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
    //                 break;

    //             }

    //         }


    //         let remainingLength = pins.createBuffer(i + 1)
    //         for (let j = 0; j < i + 1; j++) {
    //             remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

    //         }

    //         publishPacketSize = 1 + remainingLength.length + 2 + topic.length + data.toString().length


    
    //         bBoard_Control.UARTSendString("AT+CIPSEND=0," + publishPacketSize.toString() + "\r\n",boardIDGlobal,clickIDGlobal)
    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //         bBoard_Control.UARTSendBuffer(controlPacket,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(remainingLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(topicLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(topic,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(data.toString(),boardIDGlobal,clickIDGlobal)
    //        // UARTs.bBoard_Control.UARTSendString("\r\n",boardID)


    //        response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //         basic.pause(200)


    //       //  UARTs.bBoard_Control.UARTSendString("AT+CIPCLOSE=0\r\n",boardID)
    //       //  SetResponseObj.response = SetResponseObj.WiFiResponse("OK", false, SetResponseObj.defaultWiFiTimeoutmS,boardID); //Wait for the response "OK"



    //     }


    //     // -------------- 3. Cloud ----------------
    //     //% blockId=connectMQTT
    //     //% block="|Adafruit MQTT connect with username$userName and AIO Key$password "
    //     //% group="MQTT"
    //     //% subcategory="Adafruit.io"
    //     //% weight=70   
    //     //% blockGap=7
    //     //% defl="bBoard_WiFi" 
    //     export function  connectMQTT(userName: string, password: string): void {

    //         let connectPacketSize = 0
    //         let controlPacket = pins.createBuffer(1);
    //         controlPacket.setNumber(NumberFormat.UInt8LE,0,0x10); //Publish Control Packet header

    //         let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
    //         let protocolName = "MQTT"

    //         let protocolNameLength = pins.createBuffer(2);
    //         protocolNameLength.setNumber(NumberFormat.UInt8LE,0,protocolName.length >> 8); 
    //         protocolNameLength.setNumber(NumberFormat.UInt8LE,1,protocolName.length & 0xFF); 


    //         let protocolLevel = pins.createBuffer(1);
    //         protocolLevel.setNumber(NumberFormat.UInt8LE,0,0x04); 
        
    //         let protocolFlags = pins.createBuffer(1);
    //         protocolFlags.setNumber(NumberFormat.UInt8LE,0,0xC2); 
        
        
    //         let keepAliveSeconds = 60

    //         let keepAlive = pins.createBuffer(2);
    //         keepAlive.setNumber(NumberFormat.UInt8LE,0,keepAliveSeconds >> 8); 
    //         keepAlive.setNumber(NumberFormat.UInt8LE,1,keepAliveSeconds & 0xFF); 

        
    //         let clientID = control.deviceSerialNumber().toString();
    //         let clientIDLength = pins.createBuffer(2);
    //         clientIDLength.setNumber(NumberFormat.UInt8LE,0,clientID.length >> 8); 
    //         clientIDLength.setNumber(NumberFormat.UInt8LE,1,clientID.length & 0xFF); 
            
                
    //         let userNameLength = pins.createBuffer(2);
    //         userNameLength.setNumber(NumberFormat.UInt8LE,0,userName.length >> 8); 
    //         userNameLength.setNumber(NumberFormat.UInt8LE,1,userName.length & 0xFF); 

    //         let passwordLength = pins.createBuffer(2);
    //         passwordLength.setNumber(NumberFormat.UInt8LE,0,password.length >> 8); 
    //         passwordLength.setNumber(NumberFormat.UInt8LE,1,password.length & 0xFF); 

        

    //         let i = 0
    //         let encodedByte = 0
    //         let X = 0
    //         let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


    //         X = 0x02 + 0x02 + protocolName.length + 0x01 + 0x01 + 0x02 + 0x02 + clientID.length + 0x02 + userName.length + 0x02 + password.length 
    //         connectPacketSize = X

    //         for (i = 0; i < 4; i++) {
    //             if (X >= 128) {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
    //                 X -= 127
    //             }
    //             else {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
    //                 break;

    //             }

    //         }


    //         let remainingLength = pins.createBuffer(i + 1)
    //         for (let j = 0; j < i + 1; j++) {
    //             remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

    //         }

    //         connectPacketSize = connectPacketSize + 1 + remainingLength.length //The total size of the packet to send


    //         clearSerialBuffer()

    //         bBoard_Control.UARTSendString("AT+CIPMUX=1\r\n",boardIDGlobal,clickIDGlobal)

    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //         clearSerialBuffer()
    //         bBoard_Control.UARTSendString("AT+CIPSTART=0,\"TCP\",\"io.adafruit.com\",1883,30\r\n",boardIDGlobal,clickIDGlobal)


    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //         clearSerialBuffer()
    //         bBoard_Control.UARTSendString("AT+CIPSEND=0," + connectPacketSize.toString() + "\r\n",boardIDGlobal,clickIDGlobal)
    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
        
    //         bBoard_Control.UARTSendBuffer(controlPacket,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(remainingLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(protocolNameLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(protocolName,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(protocolLevel,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(protocolFlags,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(keepAlive,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(clientIDLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(clientID,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(userNameLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(userName,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(passwordLength,boardIDGlobal,clickIDGlobal)
            
    //         bBoard_Control.UARTSendString(password,boardIDGlobal,clickIDGlobal)
            
    //         bBoard_Control.UARTSendString("\r\n",boardIDGlobal,clickIDGlobal)



    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //         basic.pause(200)



    //     }


    //     // -------------- 3. Cloud ----------------
    //     //% blockId=subscribeAdafruitMQTT
    //     //% block="|Adafruit MQTT subscribe to topic $topic"
    //     //% group="MQTT"
    //     //% subcategory="Adafruit.io"
    //     //% weight=70   
    //     //% blockGap=7
    //     //% defl="bBoard_WiFi" 
    //     export function   subscribeAdafruitMQTT(topic: string): void {

    //         let subscribePacketSize = 0
    //         let controlPacket = pins.createBuffer(1);
    //         controlPacket.setNumber(NumberFormat.UInt8LE,0,0x82); //Subscribe Control Packet header

    //         let remainingLengthTemp = pins.createBuffer(4) //Max size of remaining Length packet
    //         let packetID = pins.createBuffer(2); // packet ID 
    //         packetID.setNumber(NumberFormat.UInt8LE,0,0);
    //         packetID.setNumber(NumberFormat.UInt8LE,1,1);

    //         let topicLength = pins.createBuffer(2);

    //         topicLength.setNumber(NumberFormat.UInt8LE,0,topic.length >> 8); 
    //         topicLength.setNumber(NumberFormat.UInt8LE,1,topic.length & 0xFF); 

    //         let QS = pins.createBuffer(1);
    //         QS.setNumber(NumberFormat.UInt8LE,0,0); //Set QOS to 0

    //         let i = 0
    //         let encodedByte = 0
    //         let X = 0
    //         let remainingLengthBytes = 1 //At least 1 byte of RL is necessary for packet


    //         X = 0x02 + 2 + topic.length + 1

    //         for (i = 0; i < 4; i++) {
    //             if (X >= 128) {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,0xFF)
    //                 X -= 127
    //             }
    //             else {
    //                 remainingLengthTemp.setNumber(NumberFormat.UInt8LE,i,X)
    //                 break;

    //             }

    //         }


    //         let remainingLength = pins.createBuffer(i + 1)
    //         for (let j = 0; j < i + 1; j++) {
    //             remainingLength.setNumber(NumberFormat.UInt8LE,j,remainingLengthTemp.getNumber(NumberFormat.UInt8LE,j))

    //         }

    //         subscribePacketSize = 1 + remainingLength.length + 2 + 2 + topic.length +1


    
    //         bBoard_Control.UARTSendString("AT+CIPSEND=0," + subscribePacketSize.toString() + "\r\n",boardIDGlobal,clickIDGlobal)
    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //         bBoard_Control.UARTSendBuffer(controlPacket,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(remainingLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(packetID,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(topicLength,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendString(topic,boardIDGlobal,clickIDGlobal)
    //         bBoard_Control.UARTSendBuffer(QS,boardIDGlobal,clickIDGlobal) //Quality of service

        


    //         response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //         basic.pause(200)
    //         bBoard_Control.clearUARTRxBuffer(boardIDGlobal,clickIDGlobal);

    //         control.inBackground( function () {
    //             while(1){
    //                 basic.pause(10000);
                    
    //                 pingAdafruitMQTT(50);

    //             }

                
    //         })
            
    //     }
        
    //     // -------------- 3. Cloud ----------------
    //     //% blockId=getMQTTMessage
    //     //% block=" Adafruit MQTT get message"
    //     //% group="MQTT"
    //     //% subcategory="Adafruit.io"
    //     //% weight=70   
    //     //% blockGap=7
    //     //% defl="bBoard_WiFi" 
    //     export function   getMQTTMessage(): string {
    //         return MQTTMessage
    //     }
    
        


    //    // -------------- 3. Cloud ----------------
    //     //% blockId=isMQTTMessage
    //     //% block=" Adafruit MQTT is message available?"
    //     //% group="MQTT"
    //     //% subcategory="Adafruit.io"
    //     //% weight=70   
    //     //% blockGap=7
    //     //% defl="bBoard_WiFi"
    //     export function   isMQTTMessage(): boolean{
    //         let startIndex = 0;
    //         let remainingLength = 0;
    //         let topicLength = 0;
    //        if(UARTRawData.length > 300){
    //         UARTRawData = ""
    //        }
    //       if(bBoard_Control.isUARTDataAvailable(boardIDGlobal,clickIDGlobal) || UARTRawData.length > 0) //Is new data available OR is there still unprocessed data?
    //       {
        
    //             UARTRawData = UARTRawData + bBoard_Control.getUARTData(boardIDGlobal,clickIDGlobal); // Retrieve the new data and append it
    
    //             let IPDIndex = UARTRawData.indexOf("+IPD,0,") //Look for the ESP WiFi response +IPD which indicates data was received
    //             if(IPDIndex !== -1) //If +IPD, was found 
    //             {
                
                    
    //                 startIndex = UARTRawData.indexOf(":") //Look for beginning of MQTT message (which comes after the :)
                
    //                 if(startIndex != -1) //If a : was found
    //                 {
    //                     let IPDSizeStr = UARTRawData.substr(IPDIndex+7,startIndex-IPDIndex-7) //The length of the IPD message is between the , and the :
                    
                        
    //                     let IPDSize = parseInt(IPDSizeStr)
    //                     if(UARTRawData.length >= IPDSize + startIndex + 1) //Is the whole message here?
    //                     {

    //                         startIndex += 1; // Add 1 to the start index to get the first character after the ":"

    //                         if(UARTRawData.charCodeAt(startIndex) != 0x30) //If message type is not a publish packet
    //                         {

    //                             return false; //Not a publish packet

    //                         }
                            
    //                         remainingLength = UARTRawData.charCodeAt(startIndex + 1); //Extract the remaining length from the MQTT message (assuming RL < 127)
            
    //                         topicLength = UARTRawData.charCodeAt(startIndex + 3); //Extract the topic length from the MQTT message (assuming TL < 127)
                        
    //                         MQTTMessage  = UARTRawData.substr(startIndex + 4+topicLength,remainingLength-topicLength-2)
                        
    //                         UARTRawData = UARTRawData.substr(IPDSize + startIndex,UARTRawData.length-1) //Remove all data other than the last character (in case there is no more data)
                    
    //                         return true; //Message retrieved
                        
    //                     }
                
                        
    //                 }
    //             }
        

    //         }
    //             return false;
                
    //     }



    //     export function  pingAdafruitMQTT(pingInterval: number) 
    //     {
    //         if(pingActiveAdafruit == false)
    //         {
    //             lastPingAdafruit = input.runningTime();
    //             let controlPacket = pins.createBuffer(1);
    //             controlPacket.setNumber(NumberFormat.UInt8LE,0,0xC0); //Subscribe Control Packet header
    //             let remainingLength = pins.createBuffer(1) //size of remaining Length packet
    //             remainingLength.setNumber(NumberFormat.UInt8LE,0,0x00); //Remaining Length = 0 
        
    //             bBoard_Control.UARTSendString("AT+CIPSEND=0,2\r\n",boardIDGlobal,clickIDGlobal)
    //             response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"
    //             bBoard_Control.UARTSendBuffer(controlPacket,boardIDGlobal,clickIDGlobal);
    //             bBoard_Control.UARTSendBuffer(remainingLength,boardIDGlobal,clickIDGlobal);
    //             response = WiFiResponse("OK", false, defaultWiFiTimeoutmS); //Wait for the response "OK"

    //             pingActiveAdafruit = true;
    //         }
    //         else //If a ping has been sent
    //         {
    //             if ((input.runningTime() - lastPingAdafruit) > pingInterval*1000) 
    //             {
    //                 pingActiveAdafruit = false;
    //             }
    //         }
            
        
                
            
    //}



*/
   