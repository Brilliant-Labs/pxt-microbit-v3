




//-------------------------Click Board Blocks Begin -----------------------------------
//% weight=200
//% color=#9E4894 
//% icon=""
//% advanced=true
//% labelLineWidth=1001
//% deprecated=true

namespace bBoard_Sound {
  let currentBPM = 0; 

  enum functionID {
      // FunctionIds
      enableSpeaker = 1,
      setBPM = 2,
      sendSong = 3,
      playSong = 4,
      stopSong = 5,
      playTone = 6,
      setVolume = 7
  }

  music.setPlayTone(function (frequency: number, duration: number) {
    let toneBuffer = pins.createBuffer(4);
    toneBuffer.setNumber(NumberFormat.UInt16LE, 0, frequency)
    toneBuffer.setNumber(NumberFormat.UInt16LE, 2, duration)
   

bBoard_Control.BLiX(BoardID.zero,BUILT_IN_PERIPHERAL,0,moduleIDs.MUSIC_module_id,functionID.setVolume,[music.volume()],null,0);
    bBoard_Control.BLiX(BoardID.zero,BUILT_IN_PERIPHERAL,0,moduleIDs.MUSIC_module_id,functionID.playTone,null,toneBuffer,0);
    basic.pause(duration)
})
  // //% blockId=Speaker_Enable
  // //% block="Speaker $enable"
  // //% advanced=false
  // export function speakerEnable(enable: bBoard_Sound.speakerState) {
  //     let data = [enable]
  //     bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.enableSpeaker, data, null, 0)
  // }

 
  function startSong() {
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.playSong, [], null, 0)
  }
  
  //% blockId=bBoardSound_Set_Tempo
  //% block="set frequencies tempo to (bpm)%BPM"
  //% block.loc.fr="régler le tempo des fréquences sur (bpm)%BPM"
  //% BPM.defl="60"
  //% advanced=false
  export function setFrequenciesBPM(BPM: number) {
    currentBPM = BPM;
      let data = [BPM & 0x00FF, ((BPM & 0xFF00) >> 8)]
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.setBPM, data, null, 0)
  }

  // //% blockId=Load_Song
  // //% block="load frequencies $song to play"
  // //% advanced=true
  // export function loadSong(song: number[]) {
  //     song.push(0); //Ensure there is a 0 at the end of the song to stop it
  //     let buff = pins.createBuffer(song.length * 2)
  //     for (let i = 0; i < buff.length; i++) {
  //         buff.setNumber(NumberFormat.UInt8LE, 2 * i, song[i] & 0x00FF)
  //         buff.setNumber(NumberFormat.UInt8LE, 2 * i + 1, (song[i] & 0xFF00) >> 8)
  //     }
  //     bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.sendSong, null, buff, 0)       
  // }

  //% blockId=Play_Frequencies
  //% block="play frequencies $frequencies Hz"
  //% block.loc.fr="jouer les fréquences $frequencies Hz"
  //% frequencies.defl=100,200,300
  //% advanced=false
  export function playFrequency(frequencies: number[]) {
    if(currentBPM == 0 )
    {
      setFrequenciesBPM(60);
      currentBPM = 60;
    }

    frequencies.push(0); //Ensure there is a 0 at the end of the song to stop it
      let buff = pins.createBuffer(frequencies.length * 2)
      for (let i = 0; i < buff.length; i++) {
          buff.setNumber(NumberFormat.UInt8LE, 2 * i, frequencies[i] & 0x00FF)
          buff.setNumber(NumberFormat.UInt8LE, 2 * i + 1, (frequencies[i] & 0xFF00) >> 8)
      }
      bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.sendSong, null, buff, 0)       
      startSong();
      basic.pause((frequencies.length-1)* ((60/currentBPM )* 1000 ))
  }

  // //% blockId=bBoard_analog_pitch 
  // //% block="analog pitch %frequency|for (ms) %ms"
  // //% help=pins/analog-pitch 
  // //% weight=4 
  // //% async 
  // //% advanced=true 
  // //% blockGap=8
  // export function analogPitch( frequency:number,  ms:number) {
  //     let data = [frequency, ms]
  //     bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, clickIOPin.AN, moduleIDs.MUSIC_module_id, functionID.playTone, data, null, 0)
  // }
}
  
namespace music
{


export enum speakerTypes {

// FunctionIds

allSpeakers = 1,

bBoardSpeaker = 2,

microbitSpeaker = 3

 


}

enum functionID {

// FunctionIds

enableSpeaker = 1,

setBPM = 2,

sendSong = 3,

playSong = 4,

stopSong = 5,

playTone = 6,

setVolume = 7

}

 

//%blockId=bBoardSpeakerSelect

//%block="Set music speaker to $speakerSelect"

//%block.loc.fr="Réglez le haut-parleur sur $speakerSelect"

//% blockGap=7

//% advanced=false

//% blockNamespace=music

//% speakerSelect.defl=speakerTypes.allSpeakers

export function bBoardSpeakerSelect(speakerSelect:speakerTypes)

{

if (speakerSelect == speakerTypes.bBoardSpeaker)

{

music.setPlayTone(function (frequency: number, duration: number) {

let toneBuffer = pins.createBuffer(4);

toneBuffer.setNumber(NumberFormat.UInt16LE, 0, frequency)

toneBuffer.setNumber(NumberFormat.UInt16LE, 2, duration)



bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, 0, moduleIDs.MUSIC_module_id, functionID.setVolume, [music.volume()], null, 0);

bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, 0, moduleIDs.MUSIC_module_id, functionID.playTone, null, toneBuffer, 0);

 

basic.pause(duration)

})

}

else if (speakerSelect == speakerTypes.microbitSpeaker)

{

music.setPlayTone(function (frequency: number, duration: number) {


pins.analogPitch(frequency, duration);


})

}

else //all speakers

{

music.setPlayTone(function (frequency: number, duration: number) {

let toneBuffer = pins.createBuffer(4);

toneBuffer.setNumber(NumberFormat.UInt16LE, 0, frequency)

toneBuffer.setNumber(NumberFormat.UInt16LE, 2, duration)



bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, 0, moduleIDs.MUSIC_module_id, functionID.setVolume, [music.volume()], null, 0);

bBoard_Control.BLiX(BoardID.zero, BUILT_IN_PERIPHERAL, 0, moduleIDs.MUSIC_module_id, functionID.playTone, null, toneBuffer, 0);

pins.analogPitch(frequency, duration);

// basic.pause(duration)

})

}

}

 

bBoardSpeakerSelect(speakerTypes.allSpeakers); //Set default to both speakers.

}


