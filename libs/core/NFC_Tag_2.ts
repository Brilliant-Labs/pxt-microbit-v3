
/**
 * Custom blocks
 */
//% weight=100 color=#FF2F92 icon=""
//% advanced=true
namespace NFC_Tag_2{

    //Address Definitions
declare const DEFAULT_I2C_ADDRESS =  0x55  


declare const COVERING_PAGE_REG = 0x0
declare const  USER_START_REG =0x1

declare const NFC_BLOCK_SIZE = 16
declare const UID_SIZE = 7


declare const USER_END_REG  = 0x38 // just the first 8 bytes for the 1K
declare const CONFIG_REG	=   0x3A


declare const  SRAM_START_REG= 0xF8
declare const  SRAM_END_REG  = 0xFB // just the first 8 bytes


   
   
   
    let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  

  

     
        export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
        {

           
           
            isInitialized[clickBoardNum]  = 1
            setNT3H2111Addr(deviceAddr,clickBoardNum)
            
            let arrayTest = NFC_Tag_2.readNT3H2111(16, 0, clickBoardID.one) //Need to read the first page of the tag memory
            arrayTest[0] = DEFAULT_I2C_ADDRESS<<1 //Set the very first byte (the i2c address). The chip always returns 0x04 (manufacturer ID) and not the I2C address (0x55)
            arrayTest[12] = 225 //The last 4 bytes are part of the container and need to be set
            arrayTest[13] = 16
            arrayTest[14] = 109
            arrayTest[15] = 0

            NFC_Tag_2.writeNT3H2111(arrayTest, 0, clickBoardID.one)//Now write this back to the first block of memory
        
        }

function readCoveringPage(clickBoardNum:clickBoardID):number[] { //Get the entire covering page from the NT3H2111
    return readNT3H2111(NFC_BLOCK_SIZE,COVERING_PAGE_REG,clickBoardNum);
}
export enum URICode{

       //% block="Full URL" 
            zero = 0,
     //% block="http://www."
     one = 1,
     //% block="https://www."
     two = 2,
     //% block="http://"
     three = 3,
     //% block="https://"
     four = 4
}

  //%blockId=NT3H2111_setURI
        //%block="Write URL %URL to NFC device on click%clickBoardNum"
        //% blockGap=7
        //% advanced=false
export function setURI(URL:string,clickBoardNum:clickBoardID)
{
    if(isInitialized[clickBoardNum] == 0)
    {
        initialize(DEFAULT_I2C_ADDRESS,clickBoardNum)
        
    }

    //Information found from https://www.remy.org.uk/elec.php?elec=1510617600#smoke
    //https://learn.adafruit.com/adafruit-pn532-rfid-nfc/ndef
 let bytesWritten = 0; //Track the amount of bytes written to the chip

//NDEF Section
let NDEFHeader = 0xD1; //FirstRecord&LastRecord&ShortPayload&TypeNameFormate=1
let typeFieldSize = 0x01; //Type field size is 1 byte
let NDEFpayloadLength = 0; //This will contain the length of the NDEF payload
let NDEFtypeField = 0x55; //Indicates URI record type
let NDEFPayload:number[] = []; //This is where the NDEF payload will be stored



//TLV Section
let TLVType = 0x03; //Indicates TLV block contains an NDEF Message
let TLVLength = 0; //This will contain the length of the TLV Block
let TLVValue:number[] = []; //The array that will hold the TLV block (where the NDEF message will live)

NDEFPayload[0] = 0 ; //URIidentifierCode; //No prepending. User needs to provide entire URL

for(let i=0;i<URL.length;i++) //Load the string into the payload one character at a time 
{
    NDEFPayload[i+1] = URL.charCodeAt(i)
}
NDEFpayloadLength = NDEFPayload.length; //We can now calculate the length of the NDEF payload



//Let's build the TLV block
TLVValue[0] = TLVType; //The first byte is the Type of the "TLV" Block. In this case it is 0x03 because it is an NDEF message
TLVValue[1] = 0; //This will be the TLV Block length. We need to calculate it first
TLVValue[2] = NDEFHeader; //The first byte of the TLV Message is the NDEF Header
TLVValue[3] = typeFieldSize; //The second byte of the TLV Message is the NDEF Field type size which is 1 byte
TLVValue[4] = NDEFpayloadLength; //The third byte of the TLV Message is the NDEF payload length
TLVValue[5] = NDEFtypeField; //In the NDEF Header (Bits 0-2 = 0x01) we inidcated we would use a "well-known record". In this case, it will be 0x55 = URI Record

for(let i=0;i<NDEFpayloadLength;i++) //Append the NDEF payload one byte at a time
{
    TLVValue[i+6] = NDEFPayload[i];
}

TLVLength = TLVValue.length - 2; //We can now calculate the TLV Block Length (minus the Type and Length field)
TLVValue[1] = TLVLength; //Now write this length to the TLV length field

    let loopCounter = 0; 

    while(bytesWritten < TLVValue.length)
    {

            NFC_Tag_2.writeBlock(TLVValue.slice(NFC_BLOCK_SIZE*loopCounter,Math.min(TLVValue.length-1,NFC_BLOCK_SIZE*loopCounter+15)+1), loopCounter+1, clickBoardID.one) 
            bytesWritten = bytesWritten + 16; 
            loopCounter++;
      

    }

    


}
//Now we need to append the NDEF payload to our TLVBlock message.

   // arrayTest = [0x3, 21, 0xd1, 0x1, 17, 0x55, 0x02, 0x62, 0x72, 0x69, 0x6c, 0x6c, 0x69, 0x61, 0x6e, 0x74]
   // NFC_Tag_2.writeNT3H2111(arrayTest, 1, clickBoardID.one)
    //arrayTest = [0x6c, 0x61, 0x62, 0x73, 0x2e, 0x63, 0x61, 0xfe, 0, 0, 0, 0, 0, 0, 0, 0]
   // NFC_Tag_2.writeNT3H2111(arrayTest, 2, clickBoardID.one)


function readUID(clickBoardNum:clickBoardID):number[] { //Extracts the first 7 bytes of the 
    return readNT3H2111(UID_SIZE, COVERING_PAGE_REG, clickBoardNum);
}

 
 //%blockId=NT3H2111_writeBlock
        //%block="Write array %values to block %blockAddr on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=true
        export function writeBlock(values:number[],blockAddr:number,clickBoardNum:clickBoardID)
        {
        
            let byte = 0; //Byte to be written
            let i2cBuffer = pins.createBuffer(16+1)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, blockAddr) //Set the I2C Block address

        for (let i=0;i<16;i++)
        {
            
                if(i < values.length)
                {
                    byte = values[i];
                }
                else
                {
                    byte = 0; //Zero pad the block
                }

            i2cBuffer.setNumber(NumberFormat.UInt8LE, i+1, byte)
           
        }
    
        
            bBoard.i2cWriteBuffer(getNT3H2111Addr(clickBoardNum),i2cBuffer,clickBoardNum);
         
        }

     //%blockId=NT3H2111_write
        //%block="Write array %values to NT3H2111 register%register on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=true
        export function writeNT3H2111(values:number[],register:number,clickBoardNum:clickBoardID)
        {
        
        
            let i2cBuffer = pins.createBuffer(values.length+1)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register) 

        for (let i=0;i<values.length;i++)
        {
            i2cBuffer.setNumber(NumberFormat.UInt8LE, i+1, values[i])
           
        }
    
        
            bBoard.i2cWriteBuffer(getNT3H2111Addr(clickBoardNum),i2cBuffer,clickBoardNum);
         
        }
       

        
     
            export function findI2C(  clickBoardNum:clickBoardID)
            {
               
                for(let i=0;i<128;i++)
                {
                    bBoard.i2cWriteNumber(i,0,NumberFormat.UInt8LE,clickBoardNum,false)
                }
                
             
                    
            
            }

        
         //%blockId=NT3H2111_read
            //%block="Read %numBytes bytes from register%register on click%clickBoardNum"
            //% blockGap=7
            //% advanced=true
      export function readNT3H2111( numBytes:number, register:number,  clickBoardNum:clickBoardID):number[]
        {
           
            
            bBoard.i2cWriteNumber(getNT3H2111Addr(clickBoardNum),register,NumberFormat.UInt8LE,clickBoardNum,true)
           let i2cBuffer = bBoard.I2CreadNoMem(getNT3H2111Addr(clickBoardNum) ,numBytes,clickBoardNum);

            let dataArray:number[] = []; //Create an array to hold our read values
            for(let i=0; i<numBytes;i++)
            {
                dataArray[i] = i2cBuffer.getUint8(i); //Extract byte i from the buffer and store it in position i of our array
            }
           
            
            return  dataArray
    
                
        
        }
        
        
        function setNT3H2111Addr(deviceAddr:number,clickBoardNum:clickBoardID)
        {
            deviceAddress[clickBoardNum] = deviceAddr;
        }
        function getNT3H2111Addr(clickBoardNum:clickBoardID):number
        {
            return deviceAddress[clickBoardNum];
        }

    }

