//-------------------------Click Board Blocks Begin -----------------------------------
//% weight=501
//% color=#9E4894 
//% icon=""
//% advanced=true
//% labelLineWidth=1001

namespace bBoard_Sound {
const DEFAULT_MIC_LOUD_THRESHOLD = 50
    /**
     * Sets mic object.
     * @param boardID the click
     * @param clickID the bus
     */
    //% block="$boardID $clickID"
    //% blockSetVariable="bBoard_Sound"
    //% weight=110
    //% advanced=true
    export function createSpeaker0(boardID: BoardID, clickID:ClickID): bBoardSpeaker {
      return new bBoardSpeaker(boardID, clickID);
  }

  /**
  * Sets mic object.
  */
  //% block="bBoard $enabled"
  //% blockSetVariable="bBoard_Sound"
  //% clickID.defl=ClickID.Zero
  //% weight=97
  export function createSpeaker(enabled:speakerEnable): bBoardSpeaker {
    let handle = new bBoardSpeaker(BoardID.zero, ClickID.Zero);
    handle.speakerEnable(enabled)
    return handle
  }

  enum functionID {
    // FunctionIds
    enableSpeaker = 1,
    setBPM = 2,
    sendSong = 3,
    playSong = 4,
    stopSong = 5,
    playTone = 6
  }
  export enum speakerEnable {
    enabled = 1,
    disabled = 0
  }

  export class bBoardSpeaker extends bBoard_Control.peripheralSettings {
    private boardIDGlobal: number
    private clickIDGlobal: number

    constructor(boardID: BoardID, clickID: ClickID) {
      super(boardID, clickID)
      this.boardIDGlobal = boardID;
      this.clickIDGlobal = clickID;
    }

    //% blockId=Speaker_Enable
    //% block="$this $enable"
    //% advanced=false
    //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
    speakerEnable(enable: bBoard_Sound.speakerEnable) {
      this.sendData(0, moduleIDs.MUSIC_module_id, functionID.enableSpeaker, [enable])
    }

    //% blockId=Start_Song
    //% block="$this start song"
    //% advanced=true
    //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
    startSong() {
      this.sendData(0, moduleIDs.MUSIC_module_id, functionID.playSong, [])
    }

    //% blockId=Music_Set_Tempo
    //% block="$this set BPM to %BPM"
    //% advanced=false
    //% BPM.defl="30"
    //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
    setBPM(BPM: number) {
      this.sendData(0, moduleIDs.MUSIC_module_id, functionID.setBPM, [BPM & 0x00FF, ((BPM & 0xFF00) >> 8)])
    }

    //% blockId=Load_Song
    //% block="$this load frequencies $song to play"
    //% advanced=true
    //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
    loadSong(song: number[]) {
      song.push(0); //Ensure there is a 0 at the end of the song to stop it
      let buff = pins.createBuffer(song.length * 2)
      for (let i = 0; i < buff.length; i++) {
        buff.setNumber(NumberFormat.UInt8LE, 2 * i, song[i] & 0x00FF)
        buff.setNumber(NumberFormat.UInt8LE, 2 * i + 1, (song[i] & 0xFF00) >> 8)
      }
      this.sendBuffer(0, moduleIDs.MUSIC_module_id, functionID.sendSong, buff)

      
    }

        //% blockId=Play_Song
    //% block="$this play frequencies $song"
    //% advanced=false
    //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
    playSong(song: number[]) {
      song.push(0); //Ensure there is a 0 at the end of the song to stop it
      let buff = pins.createBuffer(song.length * 2)
      for (let i = 0; i < buff.length; i++) {
        buff.setNumber(NumberFormat.UInt8LE, 2 * i, song[i] & 0x00FF)
        buff.setNumber(NumberFormat.UInt8LE, 2 * i + 1, (song[i] & 0xFF00) >> 8)
      }
      this.sendBuffer(0, moduleIDs.MUSIC_module_id, functionID.sendSong, buff)

      this.startSong();
    }


      //% blockId=bBoard_analog_pitch block="analog pitch %frequency|for (ms) %ms"
    //% help=pins/analog-pitch weight=4 async advanced=true blockGap=8
        //% blockNamespace=bBoard_Sound
    //% this.shadow=variables_get
    //% this.defl="bBoard_Sound"
    //% parts="bBoardMusic"
     analogPitch( frequency:number,  ms:number) {


      this.sendData(0, moduleIDs.MUSIC_module_id, functionID.playTone, [frequency, ms])
    }
  }
}
