



/**
 * Custom blocks
 */
//% weight=906 color=#33BEBB icon=""
//% advanced=true
//% labelLineWidth=1002
namespace Thermo_6{

   export enum TempUnits {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    /**
     * Sets Thermo Click object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param Thermo the Thermo Object
    */
    //% block=" $boardID $clickID"
    //% blockSetVariable="Thermo_6"
    //% weight=110
    export function createThermo(boardID: BoardID, clickID:ClickID): Thermo {
        let handle = new Thermo(boardID, clickID);
        this.initialize(this.deviceAddress)
        return handle
   }

    export class Thermo extends bBoard_Control.I2CSettings{
    //Address Definitions
    private readonly DEFAULT_I2C_ADDRESS =  0x48  
    private readonly TEMP_REG       = 0x00
    private readonly CONFIG_REG     = 0x01
    private readonly THYST_REG       = 0x02
    private readonly TOS_REG     = 0x03


    private isInitialized : Array<number>;
    private deviceAddress : Array<number>;

    private boardIDGlobalT:number
    private clickIDNumGlobal:number
    
    constructor(boardID: BoardID, clickID:ClickID){
    super(boardID, clickID);
    this.boardIDGlobalT=boardID*3+clickID
    this.clickIDNumGlobal=clickID;
    this.initialize(this.DEFAULT_I2C_ADDRESS)
    }
   
    //%blockId=Thermo6_getTempC
    //%block="$this Temperature in $units"
    //% blockGap=7
    //% advanced=false
    //% blockNamespace=Thermo_6
    //% this.shadow=variables_get
    //% this.defl="Thermo_6"
       getTemp(units:Thermo_6.TempUnits):number
       {
        let tempC = this.readMAX31875( this.TEMP_REG)/256;
        let tempF = tempC * 9.0/5.0 + 32.0;

           return units==TempUnits.C? tempC:tempF
       
       
       }
   

   
    //%blockId=Thermo6_initialize
    //%block="$this Initalize with i2c address $deviceAddr"
    //% blockGap=7
    //% advanced=true
    //% blockNamespace=Thermo_6
    //% this.shadow=variables_get
    //% this.defl="Thermo_6"
   initialize(deviceAddr:number)
   {
      

    this.setMAX31875Addr(deviceAddr)
    this.writeMAX31875(0x0066,this.CONFIG_REG) //Set PEC to off, 12 bit resolution and 8 samples/second
   
   
   }


    //%blockId=MAX31875_write
    //%block="$this Write $value to register$register"
    //% blockGap=7
    //% advanced=true
    //% blockNamespace=Thermo_6
    //% this.shadow=variables_get
    //% this.defl="Thermo_6"
   writeMAX31875(value:number,register:number)
   {
   
   
       let i2cBuffer = pins.createBuffer(3)
   
       i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, register)
       i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, value>>8 ) 
       i2cBuffer.setNumber(NumberFormat.UInt8LE, 2, value & 0xFF)

   
       this.i2cWriteBuffer(this.getMAX31875Addr(),i2cBuffer);
    
   }
   
    //%blockId=MAX31875_read
    //%block="$this Read from register$register"
    //% blockGap=7
    //% advanced=true
    //% blockNamespace=Thermo_6
    //% this.shadow=variables_get
    //% this.defl="Thermo_6"
    readMAX31875( register:number):number
   {
       let i2cBuffer = pins.createBuffer(2);

       this.i2cWriteNumber(this.getMAX31875Addr(),register,NumberFormat.UInt8LE,true)

       i2cBuffer = this.I2CreadNoMem(this.getMAX31875Addr(),2);

 
       let sReturn = Math.roundWithPrecision(i2cBuffer.getNumber(NumberFormat.Int16BE,0),1)
       return  sReturn

           
   
   }
   
   
   setMAX31875Addr(deviceAddr:number)
   {
    this.deviceAddress[this.boardIDGlobalT] = deviceAddr;
   }
   getMAX31875Addr():number
   {
       return this.deviceAddress[this.boardIDGlobalT];
   }


}
}