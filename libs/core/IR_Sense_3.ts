/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon="\u223F"
//% advanced=true
namespace IR_Sense_3{

    declare const ST1 = 0x04
    declare const ST2 = 0x09
    declare const ST3 = 0x0A
    declare const ST4 = 0x1F
    declare const IRL = 0x05
    declare const IRH = 0x06
    declare const AK9754_DEVICE_ADDRESS = 0x60
    
    let isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    let deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    
    export function initialize(deviceAddr:number,clickBoardNum:clickBoardID)
    {
        //setTMP116Addr(deviceAddr,clickBoardNum)
        isInitialized[clickBoardNum]  = 1
        setAK9754Addr(deviceAddr,clickBoardNum)
        writeAK9754([0x20,0xff, 0xfc,0xa9, 0xf8, 0x80, 0xfa, 0xf0, 0x81, 0x0c, 0x80,0xf2, 0xff],clickBoardNum) //Initialize the Config register
    
    }
   

       
     //%blockId=AK9754_write
        //%block="Write array %values to AK9754 register%register on click%clickBoardNum ?"
        //% blockGap=7
        //% advanced=true
        function writeAK9754(values:number[],clickBoardNum:clickBoardID)
        {
        
        
            let i2cBuffer = pins.createBuffer(values.length)

        for (let i=0;i<values.length;i++)
        {
            i2cBuffer.setNumber(NumberFormat.UInt8LE, i, values[i])
           
        }
    
        
            bBoard.i2cWriteBuffer(getAK9754Addr(clickBoardNum),i2cBuffer,clickBoardNum);
         
        }
       

        
         //%blockId=IR_Sense_3_isHumandDetected
            //%block="Has a human been detected on click%clickBoardNum ?"
            //% blockGap=7
            //% advanced=false
            export   function isHumanDetected( clickBoardNum:clickBoardID):boolean
            {
                if(isInitialized[clickBoardNum] == 0)
                {
                    initialize(AK9754_DEVICE_ADDRESS,clickBoardNum)
                    
                }
                if(bBoard.digitalReadPin(clickIOPin.INT,clickBoardNum)==0) //If the interrupt pin has gone low (indicating human detected)
                {
                    readAK9754(IRL,clickBoardNum); //Datasheet indicates that reading from IRL will clear the interrupt. *Need to confirm if other reads are necessary
                    readAK9754(IRH,clickBoardNum);
                    readAK9754(ST1,clickBoardNum);
                    readAK9754(ST2,clickBoardNum);
                    readAK9754(ST3,clickBoardNum);
                    readAK9754(ST4,clickBoardNum);

                    return true;

                }
                
                
    
        
                return  false
        
                    
            
            }

        
         //%blockId=AK9754_read
            //%block="Read from register%register on click%clickBoardNum ?"
            //% blockGap=7
            //% advanced=true
      export   function readAK9754( register:number, clickBoardNum:clickBoardID):number
        {
            
    
            bBoard.i2cWriteNumber(getAK9754Addr(clickBoardNum),register,NumberFormat.UInt8LE,clickBoardNum,true)

    
            return  bBoard.I2CreadNoMem(getAK9754Addr(clickBoardNum),1,clickBoardNum).getUint8(0)
    
                
        
        }
        
        
        function setAK9754Addr(deviceAddr:number,clickBoardNum:clickBoardID)
        {
            deviceAddress[clickBoardNum] = deviceAddr;
        }
        function getAK9754Addr(clickBoardNum:clickBoardID):number
        {
            return deviceAddress[clickBoardNum];
        }


}



