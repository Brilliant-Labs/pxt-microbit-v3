
/**
 * Custom blocks
 */
//% weight=904 color=#33BEBB icon="↦"
//% advanced=true
//% labelLineWidth=1002
namespace Proximity_2{
    enum Proximity2_Interrupts {ALS_INT, PROX_INT, NO_INT};
    

    /**
     * Sets Proximity2 Click object.
     * @param boardID the boardID
     *  @param Proximity2 the Proximity2 Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Proximity_2"
    //% weight=110
    export function createProximity2Settings(boardID: BoardID, clickID:ClickID): Proximity2 {
        return new Proximity2(boardID, clickID);
   }

    export class Proximity2 extends bBoard_Control.I2CSettings{
     readonly INTERRUPT_STATUS : number
     readonly MAIN_CONFIGURATION : number
     readonly RECEIVE_CONFIGURATION : number
     readonly TRANSMIT_CONFIGURATION : number
     readonly ADC_HIGH_ALS : number
     readonly ADC_LOW_ALS : number
     readonly ADC_BYTE_PROX : number
     readonly ALS_UPPER_THRESHOLD_HIGH : number
     readonly ALS_UPPER_THRESHOLD_LOW : number
     readonly ALS_LOWER_THRESHOLD_HIGH : number
     readonly ALS_LOWER_THRESHOLD_LOW : number
     readonly THRESHOLD_PERSIST_TIMER : number
     readonly PROX_THRESHOLD_INDICATOR : number
     readonly PROX_THRESHOLD : number
     readonly DIGITAL_GAIN_TRIM_GREEN : number
     readonly DIGITAL_GAIN_TRIM_INFRARED : number
    
     readonly ADDRESS  : number;
    //isInitialized : number[];
    
    private boardIDGlobalT:number
    private clickIDNumGlobal:number 
    
    constructor(boardID: BoardID, clickID:ClickID){
    super(boardID, clickID)
    this.INTERRUPT_STATUS= 0x00
    this.MAIN_CONFIGURATION = 0x01
    this.RECEIVE_CONFIGURATION=   0x02
    this.TRANSMIT_CONFIGURATION=  0x03
    this.ADC_HIGH_ALS =   0x04
    this.ADC_LOW_ALS= 0x05
    this.ADC_BYTE_PROX=   0x16
    this.ALS_UPPER_THRESHOLD_HIGH =0x06
    this.ALS_UPPER_THRESHOLD_LOW = 0x07
    this.ALS_LOWER_THRESHOLD_HIGH =   0x08
    this.ALS_LOWER_THRESHOLD_LOW =0x09
    this.THRESHOLD_PERSIST_TIMER= 0x0A
    this.PROX_THRESHOLD_INDICATOR =   0x0B
    this.PROX_THRESHOLD = 0x0C
    this.DIGITAL_GAIN_TRIM_GREEN =0x0F
    this.DIGITAL_GAIN_TRIM_INFRARED = 0x10
    
    this.ADDRESS = 0b1001010;
    //this.isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.boardIDGlobalT=boardID*3+clickID;
    this.clickIDNumGlobal=clickID;
    this.Proximity2_Initialize()

    }

        //%blockId=Proximity2_ReadProximity
        //%block="$this proximity"
        //% blockGap=7
        //% weight=90   color=#9E4894 icon=""
        //% advanced=false
        //% blockNamespace=Proximity_2
        //% this.shadow=variables_get
        //% this.defl="Proximity_2"
        Proximity2_Read_Proximity():number
        {
            // if(this.isInitialized[this.boardIDGlobalT] == 0)
            // {
            //     this.Proximity2_Initialize()
                
            // }
            let val = this.Read_Proximity2_Register(this.ADC_BYTE_PROX);
            return val;
        }
        
        
        
        //%blockId=Proximity2_ReadALS
        //%block="$this illuminance(lux)"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=Proximity_2
        //% this.shadow=variables_get
        //% this.defl="Proximity_2"
        Proximity2_Read_Als():number
        {
            // if(this.isInitialized[this.boardIDGlobalT] == 0)
            // {
            //     this.Proximity2_Initialize()
                
            // }
            let val = (this.Read_Proximity2_Register(this.ADC_HIGH_ALS) << 8) | this.Read_Proximity2_Register(this.ADC_LOW_ALS);
            return val*0x03125; //Assumption that ALSPGA == 0. 0.03125 Lux per LSB
        }
    
    
    // Read a byte from register 'reg'
    Read_Proximity2_Register( reg:number):number
    {
        let i2cBuffer = pins.createBuffer(2);
    
        super.i2cWriteNumber(this.ADDRESS,reg,NumberFormat.Int8LE,true)
       
        i2cBuffer = super.I2CreadNoMem(this.ADDRESS,1);
       
       
        return i2cBuffer.getUint8(0)
    }
    
    // Write byte 'byte' to register 'reg'
    Write_Proximity2_Register(reg:number,  byte:number) 
    {
        let i2cBuffer = pins.createBuffer(2)
    
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, reg)
        i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, byte) 
       
    
        this.i2cWriteBuffer(this.ADDRESS,i2cBuffer);
    
       
    }
    
    Proximity2_Read_Interrupt():number
    {
        let val = this.Read_Proximity2_Register(this.INTERRUPT_STATUS);
        if (val & 0b1) 
        {
            return Proximity2_Interrupts.ALS_INT;
        } 
        else if (val & 0b10) 
        {
            return Proximity2_Interrupts.PROX_INT;
        } 
        else 
        {
            return Proximity2_Interrupts.NO_INT;
        }
    }
    
    Proximity2_Set_Threshold(thresh:number)
    {
        this.Write_Proximity2_Register(this.PROX_THRESHOLD, thresh);
    }
    
    // Setup the chip for proximity sensing
    Proximity2_Initialize()
    {
        //this.isInitialized[this.boardIDGlobalT] = 1;
        this.Write_Proximity2_Register(this.MAIN_CONFIGURATION, 0b110000);
        this.Write_Proximity2_Register(this.PROX_THRESHOLD_INDICATOR, 0b01000000);
        this.Write_Proximity2_Register(this.PROX_THRESHOLD_INDICATOR, 0b01000000);
        this.Write_Proximity2_Register(this.TRANSMIT_CONFIGURATION, 0b00001111);
    }
    
    Proximity2_Set_Als_Upper_Threshold(thresh:number)
    {
        this.Write_Proximity2_Register( this.ALS_UPPER_THRESHOLD_HIGH, thresh >> 8);;
        this.Write_Proximity2_Register( this.ALS_UPPER_THRESHOLD_LOW, thresh & 0xFF);
    }
    
    Proximity2_Set_Als_Lower_Threshold(thresh:number)
    {
        this.Write_Proximity2_Register( this.ALS_LOWER_THRESHOLD_HIGH, thresh >> 8);
        this.Write_Proximity2_Register( this.ALS_LOWER_THRESHOLD_LOW, thresh & 0xFF);
    }


    
    }
    
    
    
    
    
    }