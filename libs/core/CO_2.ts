
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% labelLineWidth=1002
//% advanced=true
namespace CO_2{
    

    /**
     * Sets CO Click object.
     * @param boardID the boardID
     * @param clickID the clickID
     *  @param CO the CO Object
    */
    //% block=" $boardID $clickID with $sensitivity nA/ppm"
    //% blockSetVariable="CO"
    //% sensitivity.defl="4.75"
    //% weight=110
    export function createCOSettings(boardID: BoardID, clickID:ClickID, sensitivity:number): CO {
        return new CO(boardID, clickID,sensitivity);
   }

    export class CO extends bBoard_Control.I2CSettings{
     readonly STATUS : number
     readonly LOCK : number
     readonly TIACN : number
     readonly REFCN : number
     readonly MODECN : number

    
     readonly ADDRESS  : number;
    isInitialized : Array<number>;
    private Vadc_3 : number;
    private boardIDGlobalT:number
    private boardIDGlobal:number
    private clickIDNumGlobal:number 
    private sensitivity:number
    
    constructor(boardID: BoardID, clickID:ClickID,sensitivity:number){
    super(boardID, clickID)
    this.STATUS= 0x00
    this.LOCK = 0x01
    this.TIACN= 0x10
    this.REFCN= 0x11
    this.MODECN = 0x12
    this.Vadc_3=3.3/4096;
    this.ADDRESS = 0b1001000;
    this.sensitivity = Math.abs(sensitivity/1000000000)
        //this.isInitialized  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.boardIDGlobalT=boardID*3+clickID;
    this.boardIDGlobal=boardID
    this.clickIDNumGlobal=clickID;
    this.CO_Initialize()

    }

    CO_Initialize()
    {
        let ANObj = new bBoard_Control.PinSettings(this.boardIDGlobal, this.clickIDNumGlobal);
        ANObj.clearPin(clickIOPin.RST) // enable device
       
        //this.isInitialized[this.boardIDGlobalT] = 1;
        this.Write_CO_Register(this.LOCK, 0x00); //In write mode 
 
        this.Write_CO_Register(this.MODECN, 0x03); //FET Short Disabled, 3 lead amperometric


      
        this.Write_CO_Register(this.TIACN, 0x1F); //350K RGain, 100 ohm load

        
        this.Write_CO_Register(this.REFCN, 0xC0);  //External Ref 10% -0mV Offset 67%Vref



    }

        // Write byte 'byte' to register 'reg'
        Write_CO_Register(reg:number,  byte:number) 
        {
            let i2cBuffer = pins.createBuffer(2)
        
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, reg)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, byte) 
           
        
            this.i2cWriteBuffer(this.ADDRESS,i2cBuffer);
        
           
        }


        //%blockId=CO_ReadConcentration
        //%block="Get $this CO concentration reading"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=CO_2
        //% this.shadow=variables_get
        //% this.defl="CO"
        CO_Read_Concentration():number{
  
            let Vref = 2.048*.67 //Voltage Reference 
            let ADCMax = 4096   //Max ADC value 
            let ADCRef = 3.3000 //ADC reference voltage
          
            let Vout = 0.0 //Output voltage
            let Rgain = 350000.0 //350K ohms

            let ANObj = new bBoard_Control.PinSettings(this.boardIDGlobal, this.clickIDNumGlobal);
           
                while(!this.Read_CO_Register(this.STATUS))
                {

                }
                
            
                let adcVal = this.CO_readADC()
           

            Vout = (ADCRef*adcVal)/ADCMax
         
            let numerator = Vref - Vout
 
            let denominator = Rgain
            let sensorCurrent = numerator/denominator

            let COppm = sensorCurrent/this.sensitivity


            //let CO_voltage=sumval*this.Vadc_3; //Voltage for the force click board
            return COppm
            }

            // Read a byte from register 'reg'
    Read_CO_Register( reg:number):number
    {
        let i2cBuffer = pins.createBuffer(2);
    
        super.i2cWriteNumber(this.ADDRESS,reg,NumberFormat.Int8LE,true)
       
        i2cBuffer = super.I2CreadNoMem(this.ADDRESS,1);
       
       
        return i2cBuffer.getUint8(0)
    }
    
     CO_readADC():number
{

    let i2cBuffer = pins.createBuffer(2);
    
    i2cBuffer = super.I2CreadNoMem(0x4D,2);
   let MSB = i2cBuffer.getUint8(0);
   let LSB = i2cBuffer.getUint8(1);
   let returnVal = MSB<<8 | LSB
    return returnVal


}
    
    
    
    }

}