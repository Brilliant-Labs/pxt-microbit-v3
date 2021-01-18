
/**
 * Custom blocks
 */
//% weight=100 color=#33BEBB icon=""
//% labelLineWidth=1002
//% advanced=true
namespace NO2{
    

    /**
     * Sets NO2 Click object.
     * @param boardID the boardID
     * @param clickID the clickID
     *  @param NO2 the NO2 Object
    */
      //% block=" $boardID $clickID with $sensitivity nA/ppm"
    //% blockSetVariable="NO2"
    //% sensitivity.defl="-40"
    //% weight=110
    export function createNO2Settings(boardID: BoardID, clickID:ClickID, sensitivity:number): NO2 {
        return new NO2(boardID, clickID,sensitivity);
    }

    export class NO2 extends bBoard_Control.I2CSettings{
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
    this.NO2_Initialize()

    }

    NO2_Initialize()
    {
        let ANObj = new bBoard_Control.PinSettings(this.boardIDGlobal, this.clickIDNumGlobal);
        ANObj.clearPin(clickIOPin.RST) // enable device
       
        //this.isInitialized[this.boardIDGlobalT] = 1;
        this.Write_NO2_Register(this.LOCK, 0x00); //In write mode 
        this.Read_NO2_Register(this.LOCK); //FET Short Disabled, 3 lead amperometric
        this.Write_NO2_Register(this.MODECN, 0x03); //FET Short Disabled, 3 lead amperometric

           //this.isInitialized[this.boardIDGlobalT] = 1;
           this.Read_NO2_Register(this.MODECN); //FET Short Disabled, 3 lead amperometric
      
        this.Write_NO2_Register(this.TIACN, 0x1F); //350K RGain, 100 ohm load
        this.Read_NO2_Register(this.TIACN); //FET Short Disabled, 3 lead amperometric
        
        this.Write_NO2_Register(this.REFCN, 0xC6);  //External Ref 10% -200mV 67%Vref
        this.Read_NO2_Register(this.REFCN); //FET Short Disabled, 3 lead amperometric
        


    }

        // Write byte 'byte' to register 'reg'
        Write_NO2_Register(reg:number,  byte:number) 
        {
            let i2cBuffer = pins.createBuffer(2)
        
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 0, reg)
            i2cBuffer.setNumber(NumberFormat.UInt8LE, 1, byte) 
           
        
            this.i2cWriteBuffer(this.ADDRESS,i2cBuffer);
        
           
        }


        //%blockId=NO2_ReadConcentration
        //%block="Get $this NO2 concentration reading"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=NO2
        //% this.shadow=variables_get
        //% this.defl="NO2"
        NO2_Read_Concentration():number{
            let val=0
            let sumval=0.0
            let Vref = 2.048*.67 //Voltage Reference 
            let ADCMax = 4096   //Max ADC value 
            let ADCRef = 3.3000 //ADC reference voltage
            let sensorRes = .000000040 //amps per ppm
            let Vout = 0.0 //Output voltage
            let Rgain = 350000.0 //350K ohms

            let ANObj = new bBoard_Control.PinSettings(this.boardIDGlobal, this.clickIDNumGlobal);
            //for (let i=1;i<=20;i++)
            //{
                while(!this.Read_NO2_Register(this.STATUS))
                {

                }
                 //FET Short Disabled, 3 lead amperometric
                //val=(ANObj.analogRead(clickADCPin.AN,this.boardIDGlobal, this.clickIDNumGlobal))
                let ADCVal = this.no2_readADC()
              //  sumval+=val;
            //}
            //sumval=sumval/20;

            Vout = (ADCRef*ADCVal)/ADCMax
         
                
            let numerator = Vref - Vout
      
            let denominator = Rgain
            let sensorCurrent = numerator/denominator
       
            let N02ppm = sensorCurrent/this.sensitivity


            //let NO2_voltage=sumval*this.Vadc_3; //Voltage for the force click board
            return N02ppm
            }

            // Read a byte from register 'reg'
    Read_NO2_Register( reg:number):number
    {
        let i2cBuffer = pins.createBuffer(2);
    
        super.i2cWriteNumber(this.ADDRESS,reg,NumberFormat.Int8LE,true)
       
        i2cBuffer = super.I2CreadNoMem(this.ADDRESS,1);
       
       
        return i2cBuffer.getUint8(0)
    }
    
     no2_readADC():number
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