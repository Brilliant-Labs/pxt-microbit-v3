/**
 * Custom blocks
 */
//% weight=902 color=#33BEBB icon="\u223F"
//% advanced=true
//% labelLineWidth=1002
namespace IR_Sense_3{
    

    //% block=" $boardID $clickID"
    //% blockSetVariable="IR_Sense_3"
    //% weight=110
    export function createIR_Sense(boardID: BoardID, clickID:ClickID): IR_Sense {
        return new IR_Sense(boardID, clickID);
    }

    export class IR_Sense extends bBoard_Control.I2CSettings{

    private readonly ST1 = 0x04
    private readonly ST2 = 0x09
    private readonly ST3 = 0x0A
    private readonly ST4 = 0x1F
    private readonly IRL = 0x05
    private readonly IRH = 0x06
    private readonly AK9754_DEVICE_ADDRESS = 0x60
    
    

  
    deviceAddress : Array<number>;
    private PINs : bBoard_Control.PinSettings;
    private boardIDGlobal:number
    private clickIDNumGlobal:number
    private clickAddress:number

    constructor(boardID: BoardID, clickID:ClickID){
        super(boardID, clickID);

        this.PINs=new bBoard_Control.PinSettings(boardID, clickID);
        this.boardIDGlobal=boardID;
        this.clickIDNumGlobal=clickID;
        this.clickAddress = boardID*3 + clickID
    }
    
    initialize(deviceAddr:number)
    {
        //setTMP116Addr(deviceAddr,boardID)
 
        this.setAK9754Addr(deviceAddr)
        this.writeAK9754([0x20,0xff, 0xfc,0xa9, 0xf8, 0x80, 0xfa, 0xf0, 0x81, 0x0c, 0x80,0xf2, 0xff]) //Initialize the Config register
    
    }
   

       
        //%blockId=AK9754_write
        //%block="$this Write array $values to AK9754 register$register ?"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=IR_Sense_3
        //% this.shadow=variables_get
        //% this.defl="IR_Sense_3"
        writeAK9754(values:number[])
        {
        
        
            let i2cBuffer = pins.createBuffer(values.length)

            for (let i=0;i<values.length;i++)
            {
                i2cBuffer.setNumber(NumberFormat.UInt8LE, i, values[i])
           
            }
    
        
            super.i2cWriteBuffer(this.getAK9754Addr(),i2cBuffer);
         
        }
       
    
       //% blockId=onHumanDetected block="$this on human detected" blockAllowMultiple=0
    //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% this.defl="IR_Sense_3"
      
                //% advanced=false
                onHumanDetected( a: () => void): void {  
                    bBoard_Control.eventInit(); //Initialize the event processor if not already initialized
                   
                    let eventHandler = new bBoard_Control.EventHandler(this.boardIDGlobal,this.clickIDNumGlobal,bBoardEvents.CN_LOW,[this.clickAddress,clickIOPin.INT,bBoardEvents.CN_LOW],<any>bBoard_Control.pinEventCheck(this.clickAddress,clickIOPin.INT,bBoardEvents.CN_LOW),<any>a,null);
                    bBoard_Control.pinEventSet(this.clickAddress,clickIOPin.INT,bBoardEvents.CN_LOW)
                    bBoard_Control.addEvent(eventHandler)
               
                
                }
        
            //%blockId=IR_Sense_3_isHumandDetected
            //%block="$this human detected?"
            //% blockGap=7
            //% advanced=true
            //% blockNamespace=IR_Sense_3
            //% this.shadow=variables_get
            //% this.defl="IR_Sense_3"
            isHumanDetected():boolean
            {
 
                if(this.PINs.digitalReadPin(clickIOPin.INT)==0) //If the interrupt pin has gone low (indicating human detected)
                {
                    this.readAK9754(this.IRL); //Datasheet indicates that reading from IRL will clear the interrupt. *Need to confirm if other reads are necessary
                    this.readAK9754(this.IRH);
                    this.readAK9754(this.ST1);
                    this.readAK9754(this.ST2);
                    this.readAK9754(this.ST3);
                    this.readAK9754(this.ST4);

                    return true;

                }
                
                
    
        
                return  false
        
                    
            
            }

        
            //%blockId=AK9754_read
            //%block="$this Read from register$register ?"
            //% blockGap=7
            //% advanced=true
            //% blockNamespace=IR_Sense_3
            //% this.shadow=variables_get
            //% this.defl="IR_Sense_3"
        readAK9754( register:number):number
        {
            
    
            this.i2cWriteNumber(this.getAK9754Addr(),register,NumberFormat.UInt8LE,true)

    
            return  this.I2CreadNoMem(this.getAK9754Addr(),1).getUint8(0)
    
                
        
        }
        
        
        setAK9754Addr(deviceAddr:number)
        {
            this.deviceAddress[this.boardIDGlobal] = deviceAddr;
        }
        getAK9754Addr():number
        {
            return this.deviceAddress[this.boardIDGlobal];
        }

    }



}



