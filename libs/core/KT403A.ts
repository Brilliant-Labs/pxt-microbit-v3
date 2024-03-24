/**
    The MIT License (MIT)
    Author: Hongtai Liu (lht856@foxmail.com)
    Copyright (C) 2019  Seeed Technology Co.,Ltd.
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

/**
* Custom blocks
*/
//% weight=100 color=#FF2F92 icon="\uf001"
//% advanced=true
//% labelLineWidth=1007
namespace MP3_2 {
    let KT403A_NUM_CMD_BYTES = 8
    let KT403A_TIMEOUT = 1000
    let KT403A_MAX_VOLUME = 0x1E
    //start or stop a cmd

    let KT403A_CMD_START_CODE = 0x7E
    let KT403A_CMD_END_CODE = 0xEF
    let KT403A_VERSION_CODE = 0xFF
    let KT403A_FEEDBACK_CODE = 0x01 // ON: 0x01,OFF: 0x00
    //These are the commands that are sent over serial to the KT403A

    let KT403A_PLAY_NEXT_SONG = 0x01
    let KT403A_PLAY_PRRVIOUS_SONG = 0x02
    let KT403A_PLAY_SPECIFIC_TRACK = 0x03
    let KT403A_SET_VOLUME_UP = 0x04
    let KT403A_SET_VOLUME_DOWN = 0x05
    let KT403A_SET_VLOUME_VALUE = 0x06
    let KT403A_SET_EQUALIZER = 0x07
    let KT403A_REPEAT_CURRENT_TRACK = 0x08
    let KT403A_SET_DEVICE = 0x09
    let KT403A_ENTER_STANBY_MODE = 0xA
    let KT403A_RESET = 0x0C
    let KT403A_PLAY = 0x0D
    let KT403A_PAUSE = 0x0E
    let KT403A_PLAY_SONG_SPECIFY = 0x0F
    let KT403A_SET_ALL_LOOP = 0x11
    let KT403A_PLAY_SONG_MP3 = 0x12
    let KT403A_PLAY_SONG_ADVERT = 0x13
    let KT403A_SET_SONG_NAME = 0x14
    let KT403A_ADD_LOOP_TRACK = 0x15
    let KT403A_STOP = 0x16
    let KT403A_SET_LOOP_FOLDER = 0x17
    let KT403A_REPEAT_SINGLE = 0x19
    let KT403A_SET_SHUFFLE_FOLDER = 0x28

    //There are the parameter for some cmds

    //EQUALIZER
    export enum EQUALIZER {
        NORMAL = 0x00,
        POP = 0x01,
        ROCK = 0x02,
        JAZZ = 0x03,
        CLASSIC = 0x04,
        BASS = 0x05
    }
    export enum mp3FileNumbers {
        //% block="1"
        one = 1,
        //% block="2"
        two,
        //% block="3"
        three,
        //% block="4"
        four,
        //% block="5"
        five,
        //% block="6"
        six,
        //% block="7"
        seven,
        //% block="8"
        eight,
        //% block="9"
        nine,
        //% block="10"
        ten,
        //% block="11"
        eleven,
        //% block="12"
        twelve,
        //% block="13"
        thirteen,
        //% block="14"
        fourteen,
        //% block="15"
        fifteen,
        //% block="16"
        sixteen,
        //% block="17"
        seventeen,
        //% block="18"
        eighteen,
        //% block="19"
        nineteen,
        //% block="20"
        twenty,
        //% block="21"
        twentyone,
        //% block="22"
        twentytwo,
        //% block="23"
        twentythree,
        //% block="24"
        twentyfour,
        //% block="25"
        twentyfive,
        //% block="26"
        twentysix,
        //% block="27"
        twentyseven,
        //% block="28"
        twentyeight,
        //% block="29"
        twentynine,
        //% block="30"
        thirty,
        //% block="31"
        thirtyone,
        //% block="32"
        thirtytwo
    }
    //DEVICE

    let U_DISK = 0x01
    let SDCARD = 0x02


    //LOOP
    let STOP_LOOP = 0x00
    let START_LOOP = 0x01

    /**
        * Sets KT403A object.
        * @param boardID the boardID
        * @param clickID the ClickID
        */
    //% block=" $boardID $clickID"
    //% blockSetVariable="MP3"
    //% clickID.min=1
    //% weight=110
    export function createMP3Click(boardID: BoardID, clickID: ClickID): KT403A {
        return new KT403A(boardID, clickID);
    }


    export class KT403A {


        private _status: number;

        private commandBytes: number[] = [];
        private myClickID: ClickID;
        private myBoardID: BoardID;







        constructor(boardID: BoardID, clickID: ClickID) {

            this._status = 0
            this.myBoardID = boardID;
            this.myClickID = clickID;
            bBoard_Control.writePin(0, clickIOPin.RST, this.myBoardID, this.myClickID)
            bBoard_Control.UARTFrequency(9600, this.myBoardID, this.myClickID)
            this.volume(100);
            this.setDevice(SDCARD);
        }





        /****************************************************************
            Function Name: sendCommand
            Description: send command  to KT403A
            Parameters: commandLength:uint8_t, *data:uint8_t*, len:uint8_t
            Return: 0:success -1:fail
        ****************************************************************/

        sendCommand(commandLength: number, data: number[], len: number) {


            let time: number
            let recv: number[] = []; //receve
            let index = 0;
            let again_count = 0;




            let delayTime = 20

            while (1) {


                //Clear anything in the buffer
                bBoard_Control.clearUARTRxBuffer(this.myBoardID, this.myClickID)

                let buffArray: number[] = [];
                buffArray[0] = (KT403A_CMD_START_CODE);
                buffArray[1] = (KT403A_VERSION_CODE);
                buffArray[2] = (commandLength + 2);


                for (let x = 0; x < commandLength; x++) { //Length + command code + parameter
                    buffArray[3 + x] = (this.commandBytes[x]); //Send this byte
                }
                buffArray[3 + commandLength] = (KT403A_CMD_END_CODE);

                bBoard_Control.UARTSendBuffer(pins.createBufferFromArray(buffArray), this.myBoardID, this.myClickID)
                control.waitMicros(delayTime * 1000);


                if (this.commandBytes[1] == KT403A_SET_DEVICE) { // if the cmd is set device.
                    control.waitMicros(200000); //Wait 200mS
                }

                // feedback on
                if (KT403A_FEEDBACK_CODE == 1) {
                    // time = control.millis();
                    // index = 0;

                    // while (bBoard_Control.isUARTDataAvailable(this.myBoardID, this.myClickID) && ((control.millis() - time) < KT403A_TIMEOUT)) {
                    //     recv[index++] = parseInt(bBoard_Control.getUARTData(this.myBoardID, this.myClickID));

                    //     if (index == 10) {
                    //         index = 0;
                    //         control.waitMicros(40000);
                    //     }
                    // }
                    // if (recv[3] == 0x41) {

                    //     //Serial.println("pass");
                    //     return 0;
                    // } else {
                    //     if (again_count == 3) {
                    //         return -1;
                    //     }
                    //     again_count++;
                    //     delayTime += 10;

                    //     // Serial.println("again");

                    // }
                    return 0

                }
                else {
                    return 0
                }
            }


            return 0;
        }

        /****************************************************************
            Function Name: setDevice
            Description: Select the player device, U DISK or SD card.
            Parameters: 0x01:U DISK;  0x02:SD card
            Return:  0:success -1:fail
        ****************************************************************/
        setDevice(device: number) {
            this.commandBytes[0] = KT403A_SET_DEVICE;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = device;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: volume
            Description: Set the volume, the range is 0x00 to 0x1E.
            Parameters: volume: the range is 0x00 to 0x1E.
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_volume
        //%block="$this volume $volume"
        //%block.loc.fr="$this volume $volume"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% volume.min=0 volume.max=100
        //% this.defl="MP3"
        volume(volume: number) {
            volume = Math.round(((Math.abs(volume) % 101) / 100) * KT403A_MAX_VOLUME)


            this.commandBytes[0] = KT403A_SET_VLOUME_VALUE;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = volume;
            this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: volumeDown
            Description: Decrease the volume.
            Parameters: none
            Return:  0:success -1:fail
        ****************************************************************/
        volumeDown() {
            this.commandBytes[0] = KT403A_SET_VOLUME_DOWN;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: volumeUp
            Description: Increase the volume.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        volumeUp() {
            this.commandBytes[0] = KT403A_SET_VOLUME_UP;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            return this.sendCommand(4, [0], 0);
        }


        /****************************************************************
            Function Name: playSongSpecify
            Description: Specify the music index in the folder to play, the index is decided by the input sequence of the music.
            Parameters: folder: folder name, must be number;  index: the music index.
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_playSongSpecify
        //%block="$this play file $index in folder $folder "
        //%block.loc.fr="$this jouer fillière $index dans dossier $folder"
        //% blockGap=7
        //% advanced=true
        //% blockNamespace=MP3_2
        //% folder.min=1 index.min=1
        //% this.defl="MP3"
        playSongSpecify(folder: number, index: number) {
            this.commandBytes[0] = KT403A_PLAY_SONG_SPECIFY;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = folder;
            this.commandBytes[3] = index;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;
                //  return 0;
            } else {
                // return -1;
            }
        }

        /****************************************************************
             Function Name: playSongSpecify
             Description: Specify the music index in the folder to play, the index is decided by the input sequence of the music.
             Parameters: folder: folder name, must be number;  index: the music index.
             Return: 0:success -1:fail
         ****************************************************************/
        /**
        * Play mp3 file xxx.mp3 where xxx = the number of your mp3 file. MP3 file must 
        * be named 001.mp3 or 002.mp3 etc and placed in a folder called 01 on your
        * SD card. 
        * @param index the number of the MP3 file to play
        */
        //%blockId=KT403A_playSong
        //%block="$this play file $index"
        //%block.loc.fr="$this jouer fillière $index"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% this.defl="MP3"
        playSong(index: mp3FileNumbers) {
            this.commandBytes[0] = KT403A_PLAY_SONG_SPECIFY;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x01;
            this.commandBytes[3] = index;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;
                //  return 0;
            } else {
                // return -1;
            }
        }

        /****************************************************************
            Function Name: playSongIndex
            Description: Specify the music index to play, the index is decided by the input sequence of the music.
            Parameters: index: the music index.
            Return: 0:success -1:fail
        ****************************************************************/

        playSongIndex(index: number) {
            let hbyte, lbyte;
            hbyte = index / 256;
            lbyte = index % 256;
            this.commandBytes[0] = KT403A_PLAY_SPECIFIC_TRACK;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = hbyte;
            this.commandBytes[3] = lbyte;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;
                //return 0;
            } else {
                //return -1;
            }
        }


        /*************************************************************
            Function Name: playSongMP3
            Description: Plays the music specified in the MP3 folder.
                        First create a folder named MP3. Then rename the music file to 0001.mp3,0002.mp3, and so on. Save these music files in the MP3 folder.
                        The name must be Decimal.
            Parameters: index, the name of MP3 flie.
            Return:  0:success -1:fail
        **************************************************************/

        playSongMP3(index: number) {
            let hbyte, lbyte;
            hbyte = index / 256;
            lbyte = index % 256;

            this.commandBytes[0] = KT403A_PLAY_SONG_MP3;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = hbyte;
            this.commandBytes[3] = lbyte;




            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;

            } else {

            }
        }

        /*************************************************************
            Function Name: playSongADVERT
            Description: Plays the music specified in the Advert folder.
                        First create a folder named MP3. Then rename the music file to 0001.mp3,0002.mp3, and so on. Save these music files in the Advert folder.
                        The name must be Decimal.
            Parameters: index, the name of MP3 flie.
            Return:  0:success -1:fail
        **************************************************************/
        playSongADVERT(index: number) {
            let hbyte, lbyte;
            hbyte = index / 256;
            lbyte = index % 256;
            this.commandBytes[0] = KT403A_PLAY_SONG_ADVERT;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = hbyte;
            this.commandBytes[3] = lbyte;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;
                //  return 0;
            } else {
                //   return -1;
            }
        }

        /****************************************************************
            Function Name: stop
            Description: stop the current song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_stop
        //%block="$this stop"
        //%block.loc.fr="$this arrêter"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% this.shadow=variables_get
        //% this.defl="MP3"
        stop() {
            this.commandBytes[0] = KT403A_STOP;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 0;
                //   return 0;
            } else {
                //return -1;
            }
        }

        /****************************************************************
            Function Name: pause
            Description: pause the current song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_pause
        //%block="$this pause"
        //%block.loc.fr="$this pause"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% this.shadow=variables_get
        //% this.defl="MP3"
        pause() {
            this.commandBytes[0] = KT403A_PAUSE;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 0;
                // return 0;
            } else {
                //   return -1;
            }
        }

        /****************************************************************
            Function Name: play
            Description: play the current song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_play
        //%block="$this play"
        //%block.loc.fr="$this jouer"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% this.shadow=variables_get
        //% this.defl="MP3"
        play() {
            this.commandBytes[0] = KT403A_PLAY;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            if (this.sendCommand(4, [0], 0) == 0) {
                this._status = 1;
                //  return 0;
            } else {
                //  return -1;
            }
        }

        /****************************************************************
            Function Name: pause_or_play
            Description: play or pause the current song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        //%blockId=KT403A_playPause
        //%block="$this play/pause"
        //%block.loc.fr="$this jouer/pause"
        //% blockGap=7
        //% advanced=false
        //% blockNamespace=MP3_2
        //% this.shadow=variables_get
        //% this.defl="MP3"
        pause_or_play() {
            if (this._status == 1) {
                this.pause();
            } else {
                this.play();
            }
        }

        /****************************************************************
            Function Name: next
            Description: play the next song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        next() {
            this.commandBytes[0] = KT403A_PLAY_NEXT_SONG;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: previous
            Description: play the previous song.
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        previous() {
            this.commandBytes[0] = KT403A_PLAY_PRRVIOUS_SONG;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = 0x00;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: loop
            Description: Loop all music
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        loop(state: number) {
            this.commandBytes[0] = KT403A_SET_ALL_LOOP;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = state;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: loopFolder
            Description: Loop all music in the specified folder
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        loopFolder(floder: number) {
            this.commandBytes[0] = KT403A_SET_LOOP_FOLDER;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = floder;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: setEqualizer
            Description: set the palyer equalizer
            Parameters: NORMAL = 0x00, POP = 0x01, ROCK = 0x02,
                       JAZZ = 0x03, CLASSIC = 0x04, BASS = 0x05
            Return: 0:success -1:fail
        ****************************************************************/
        setEqualizer(Equalizer: EQUALIZER) {
            this.commandBytes[0] = KT403A_SET_EQUALIZER;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = Equalizer;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: repeat
            Description: repeat the current music
            Parameters: 0:repeat 1:no repeat
            Return: 0:success -1:fail
        ****************************************************************/
        repeat(state: number) {
            this.commandBytes[0] = KT403A_REPEAT_SINGLE;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = state;
            return this.sendCommand(4, [0], 0);
        }

        /****************************************************************
            Function Name: suffleFolder
            Description: suffle all music in the specified folder
            Parameters: none
            Return: 0:success -1:fail
        ****************************************************************/
        suffleFolder(floder: number) {
            this.commandBytes[0] = KT403A_SET_SHUFFLE_FOLDER;
            this.commandBytes[1] = KT403A_FEEDBACK_CODE;
            this.commandBytes[2] = 0x00;
            this.commandBytes[3] = floder;
            return this.sendCommand(4, [0], 0);
        }

    }
}