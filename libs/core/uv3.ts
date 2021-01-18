


  /**
 * Custom blocks
 */
//% weight=908 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace UV_3{

    /**
     * Sets UV3 Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     *  @param UV3 the UV3 Object
     */
    //% block=" $boardID $clickID"
    //% blockSetVariable="UV_3"
    //% weight=110
    export function createUV3(boardID: BoardID, clickID:ClickID): UV3 {
        return new UV3(boardID, clickID);
   }


    export class UV3 extends bBoard_Control.I2CSettings{
    private readonly VEML6070_ADDR_ARA =(0x18 >> 1)
    private readonly  VEML6070_ADDR_CMD =(0x70 >> 1)
    private readonly  VEML6070_ADDR_DATA_LSB =(0x71 >> 1)
    private readonly  VEML6070_ADDR_DATA_MSB =(0x73 >> 1)
    // VEML6070 command register bits
    private readonly  VEML6070_CMD_SD =0x01
    private readonly  VEML6070_CMD_IT_0_5T = 0x00
    private readonly  VEML6070_CMD_IT_1T = 0x04
    private readonly  VEML6070_CMD_IT_2T= 0x08
    private readonly  VEML6070_CMD_IT_4T =0x0C
    private readonly  VEML6070_CMD_DEFAULT= 0x02
    private controlReg : number;
    
      
    
    private isInitialized : Array<number>;
    private deviceAddress : Array<number>;

    private boardIDGlobalT:number
    private clickIDNumGlobal:number 
    
    constructor(boardID: BoardID, clickID:ClickID){
    super(boardID, clickID);
    this.controlReg=0;
    this.isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.deviceAddress = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.boardIDGlobalT=boardID*3+clickID
    this.clickIDNumGlobal=clickID
    }
    
    
    initialize()
    {
    
        this.isInitialized[this.boardIDGlobalT]  = 1
       
        this.controlReg = this.VEML6070_CMD_DEFAULT; //Int disabled, 1/2T (~ 60ms) and shutdown disabled. 

        this.writeVEML6070(this.controlReg)
    }


    
    
       
            //%blockId=VEML6070_write
            //%block="$this Write $value to VEML6070 control register"
            //% blockGap=7
            //% advanced=true
            //% blockNamespace=UV_3
            //% this.shadow=variables_get
            //% this.defl="UV_3"
            writeVEML6070(value:number)
            {
                this.i2cWriteNumber(this.VEML6070_ADDR_CMD,value,NumberFormat.UInt8LE,false)   
             
            }
           

            //%blockId=VEML6070_UVSteps
            //%block="$this UV Intensity"
            //% blockGap=7
            //% advanced=false
            //% blockNamespace=UV_3
            //% this.shadow=variables_get
            //% this.defl="UV_3"
            UVSteps()
            {
                
           
                if(this.isInitialized[this.boardIDGlobalT] == 0)
                {
                    this.initialize();
                }
                let MSB = this.readVEML6070(this.VEML6070_ADDR_DATA_MSB);
                let LSB = this.readVEML6070(this.VEML6070_ADDR_DATA_LSB);

                return ((MSB << 8) | LSB) 
             
             
            }

            //%blockId=VEML6070_enable
            //%block="$this Turn off device"
            //% blockGap=7
            //% advanced=true
            //% blockNamespace=UV_3
            //% this.shadow=variables_get
            //% this.defl="UV_3"
            enableShutdown()
            {
            
                
                this.controlReg = this.controlReg & 0xFE; 
                this.writeVEML6070(this.controlReg);
             
             
            }
    

            //%blockId=VEML6070_disable
            //%block="$this Turn on device"
            //% blockGap=7
            //% advanced=true
            //% blockNamespace=UV_3
            //% this.shadow=variables_get
            //% this.defl="UV_3"
            disableShutdown()
            {
            
                
                this.controlReg = this.controlReg | 0x01; 
                this.writeVEML6070(this.controlReg);
             
             
            }
        
    
     
        
                //%blockId=VEML6070_read
                //%block="$this Read from slave address$slaveAddress"
                //% blockGap=7
                //% advanced=true
                //% blockNamespace=UV_3
                //% this.shadow=variables_get
                //% this.defl="UV_3"
                readVEML6070 (slaveAddress:number):number
                {
                   

                   
                   let i2cBuffer = this.I2CreadNoMem(slaveAddress ,1);

                   let data:number; //A number variable to hold our value to return
                 
                    data= i2cBuffer.getUint8(0); //Extract the data from the buffer and store it in our variable
                
                    return  data
            
                        
                
                }
                
        
        setVEML6070Addr(deviceAddr:number)
        {
            this.deviceAddress[this.boardIDGlobalT] = deviceAddr;
        }
        getVEML6070Addr():number
        {
            return this.deviceAddress[this.boardIDGlobalT];
        }
    
    }
}
    
    