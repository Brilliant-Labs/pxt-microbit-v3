# micro:bit target for PXT

[![Build Status](https://travis-ci.org/microsoft/pxt-microbit.svg?branch=master)](https://travis-ci.org/microsoft/pxt-microbit) ![pxt-testghpkgs](https://github.com/microsoft/pxt-microbit/workflows/pxt-testghpkgs/badge.svg)

pxt-microbit is a [Microsoft Programming Experience Toolkit (PXT)](https://github.com/Microsoft/pxt) target that allows you to program a [BBC micro:bit](https://microbit.org/). 

* pxt-microbit **beta**, ``v3.0.*`` requires 
  * [pxt-microbit#stable3.0](https://github.com/Microsoft/pxt-microbit/tree/stable3.0)
  * [pxt#stable6.0](https://github.com/Microsoft/pxt/tree/stable6.0).
  * [pxt-common-packages#stable6.0](https://github.com/Microsoft/pxt-common-packages/tree/stable7.0).
* pxt-microbit ``v2.0.*``, branch ``stable2.0``, requires [pxt v5.15.\*](https://github.com/microsoft/pxt/tree/stable5.15). It is the servicing branch for live editor.
* pxt-microbit ``v1.*`` requires pxt v4.4, which is currently in the [stable4.4 branch of pxt](https://github.com/Microsoft/pxt/tree/stable4.4).
* pxt-microbit ``v0.*`` is in the [v0 branch of this repository](https://github.com/microsoft/pxt-microbit/tree/v0)

* [Try it live](https://makecode.microbit.org/)

## Issue tracking

Please add an issue if you discover an (unreported) bug.

## Developing new extensions

Authoring and testing of new extensions can be done directly from the web editor. See [our documentation](https://makecode.com/blog/github-packages) on how to get started. If you want to run the editor locally, keep reading.

## Local server setup
### Developer Setup

** Please Note: You will need to install [GIT](https://git-scm.com/downloads), Node.js (see below), NPM (Node Package Manager - should install with Node.js), and [Python](https://www.python.org/downloads). 

The local server lets you to run the editor and serve the documentation from your own computer. It is meant for a single developer used and not designed to serve the editor to a large amount of users.

Install [Node.js](https://nodejs.org/) 8.9.4 or higher.

This is the typical setup used by the MakeCode team to work on the microbit.

1. Install [Node.js](https://nodejs.org/) 8.9.4 or higher.
    node v14.15.4 is prefered
    npm v7.5.6 is prefered

2. Install [Docker](https://www.docker.com/get-started) if you plan to build ``.cpp`` files.
3. Clone the pxt repository.
   Use the https address of repo to clone https://github.com/<repo_directory>/<repo_name>
   (change `mv` by `rename` for Windows shells).
```
git clone https://github.com/Brilliant-Labs/pxt-v3
mv pxt-v3 pxt
cd pxt
```
4. Install the dependencies of pxt and build it
```
git switch --track origin/code_BL_stable7.0
npm install
npm run build
cd ..
```
5. Clone the pxt-common-packages repository
```
git clone https://github.com/Brilliant-Labs/pxt-common-packages-v3
mv pxt-common-packages-v3 pxt-common-packages
cd pxt-common-packages
git switch --track origin/code_BL_stable9.0 
npm install
cd ..
```
6. Clone this repository.
```
git clone https://github.com/Brilliant-Labs/bboard-tutorials-v3
mv bboard-tutorials-v3 bboard-tutorials

git clone https://github.com/Brilliant-Labs/bboard-tutorials-cybersecurity-v3
mv bboard-tutorials-cybersecurity-v3 bboard-tutorials-cybersecurity

git clone https://github.com/Brilliant-Labs/NFC_Tag_2
git clone https://github.com/Brilliant-Labs/ <click repo>

git clone https://github.com/Brilliant-Labs/pxt-microbit-v3
mv pxt-microbit-v3 pxt-microbit

cd pxt-microbit

```
7. Install the PXT command line (add `sudo` for Mac/Linux shells).
```
git switch --track origin/code_BL_stable4.0 
npm install -g pxt
```
8. Install the pxt-microbit dependencies.
```
npm install
```
9. Link pxt-microbit back to base pxt repo (add `sudo` for Mac/Linux shells). 

change `rm -rf` by `rmdir /Q /S` for Mac/Linux shells).
```
rm -rf node_modules/pxt-core/
rm -rf node_modules/pxt-common-packages/
pxt link ../pxt
pxt link ../pxt-common-packages

cd docs/static/mb/projects/
ln -s ../../../../../bboard-tutorials/
ln -s ../../../../../bboard-tutorials-cybersecurity/
cd ../../../../


cd libs/core
mkdir click
cd click
ln -s ../../../../NFC_Tag_2
cd ../../../


```
Note the above command assumes the folder structure of   
```
       makecode
          |
  -----------------------------------------------------
  |       |                        |                  |
 pxt      pxt-common-packages  pxt-microbit  bboard-tutorials. 
 ```

### Running

To install local http server (add `sudo` for Mac/Linux shells):
```
npm install -g http-server
```

Any time you create a new staticpkg start the htt server using:
```
pxt staticpkg
http-server -c-1 built/packaged
```

Alternative could run using
```
pxt serve
```
If the local server opens in the wrong browser, make sure to copy the URL containing the local token. 
Otherwise, the editor will not be able to load the projects.

If you need to modify the `.cpp` files (and have installed yotta), enable yotta compilation using the `--localbuild` flag:
```
pxt serve --local
```

If you want to speed up the build, you can use the ``rebundle`` option, which skips building and simply refreshes the target information
```
pxt serve --rebundle
```

### Cleaning

Sometimes, your built folder might be in a bad state, clean it and try again.
```
pxt clean
```



### How to program a new block

* First read the generic documentation about blocks
* https://makecode.com/defining-blocks
* Using a button.ts example you could show specific implementations for bBoard IDE


* Header includes:
* comment to identify the block
* weight (change vertical location when another block is in the same group)
* color
* icon
* advanced property (must be true to locate the block in Advance tab or below)
* labellinewidth=( 1001 to 1009 identify groups bellow Advanced)


```
//------------------------- Click Board ButtonG -----------------------------------
//% weight=700 color=#F4B820 icon=""
//% advanced=true
//% labelLineWidth=1003
```


* Namespace identify the block to be used from other functions.
* enum (show https://makecode.com/defining-blocks for help)

```
namespace ButtonG {
    export enum Light {
        On = 1,
        Off = 0
    }
    export enum buttonPress {
        Pressed = 1,
        Released = 0
    }
```

* Next create parameters and options for function xreateButtonG
* shadow (show https://makecode.com/defining-blocks for help)

```
    /**
     * Sets ButtonG object.
     * @param boardID the boardID
     * @param clickID the ClickID
     * @param ButtonG the ButtonG Object
     */
    //% block="$boardID $clickID"
    //% advanced=false
    //% $boardID.shadow="BoardID.zero"
    //% blockSetVariable="ButtonG"
    //% weight=110
```


* Declare the class initializator

```
    export function createButtonG(boardID: BoardID, clickID: ClickID): ButtonG {
        return new ButtonG(boardID, clickID);
    }
```

* Declare the class, starting with private parameters and the class constructor.

```
    export class ButtonG {
        private myBoardID: BoardID
        private myClickID: ClickID
 
        constructor(boardID: BoardID, clickID: ClickID) {
            this.myBoardID = boardID;
            this.myClickID = clickID;
        }
```
 
* Next star creating class functions.
* Note that advanced locate the function in … group.
* Note the use of .loc.fr to translate the labels.

* Note the use of bBoard_Control, this is another class with the Blix (protocol to control the bBoard) To know more, Refers to Blixel documentation

```
        //% blockId=ButtonG_SetLight
        //% block="$this Turn button light $onOff"
        //% block.loc.fr="$this Définir la lumière du bouton $onOff"
        //% advanced=false
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        setLight(onOff: Light) {
            bBoard_Control.writePin(onOff, clickIOPin.PWM, this.myBoardID, this.myClickID)
        }
```
 
* Now could implement more functions according to your needs, this functions could be public or private
 
```
        //% blockId=ButtonG_SetLight_PWM
        //% block="$this Set button light to $brightness brightness"
        //% block.loc.fr="$this Définir la lumière du bouton à $brightness de luminosité"
        //% advanced=false
        //% brightness.min=0 brightness.max=100
        //% brightness.defl=50
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        setLightPWM(brightness: number) {
            //FIXME: remove writePin   
            bBoard_Control.writePin(Light.Off, clickIOPin.PWM, this.myBoardID, this.myClickID)
            bBoard_Control.setDuty(clickPWMPin.PWM, brightness, this.myBoardID, this.myClickID)
        }
 
        //% blockId=ButtonG_getSwitch
        //% block="$this Read button state"
        //% block.loc.fr="$this Lire l'état du bouton"
        //% advanced=true
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        getSwitch(): number {
            return bBoard_Control.digitalReadPin(clickIOPin.INT, this.myBoardID, this.myClickID);
        }
 
        //% blockId=onButtonG 
        //% block="$this on button $state" 
        //% block.loc.fr="$this sur le bouton $state"
        //% advanced=false
        //% blockAllowMultiple=0
        //% afterOnStart=true                               //This block will only execute after the onStart block is finished
        //% blockNamespace=ButtonG
        //% this.shadow=variables_get
        //% this.defl="ButtonG"
        onButtonState(state: buttonPress, a: () => void): void {
            bBoard_Control.eventInit((state == buttonPress.Pressed) ? bBoardEventsMask.CN_HIGH : bBoardEventsMask.CN_LOW, this.myBoardID, this.myClickID); //Tell the BLiX to set the Change notification interrupts (High or Low)
            bBoard_Control.pinEventSet(this.myBoardID, this.myClickID, clickIOPin.INT, (state == buttonPress.Pressed) ? bBoardEventsMask.CN_HIGH : bBoardEventsMask.CN_LOW) //Tell the BLiX which pin you want to monitor for high or low
            control.onEvent(bBoard_Control.getbBoardEventBusSource(this.myBoardID, this.myClickID, (state == buttonPress.Pressed) ? bBoardEvents.CN_HIGH : bBoardEvents.CN_LOW), clickIOPin.INT, a); //Tell the DAL scheduler what function to call when the bBoard interrupt source is generated from this specific value
        }
    }
}
```


### Building with CODAL locally

The following commands force a local build using CODAL.

```
pxt buildtarget --local
```

To disable docker, run

```
export PXT_NODOCKER=1
```

If you are also modifiying CODAL, consider running ``pxt clean`` to ensure the proper branch is picked up.

### Modifying DAL/CODAL locally

* follow instructions above until `pxt serve`
* open editor on localhost and create a project
* do `export PXT_FORCE_LOCAL=1 PXT_RUNTIME_DEV=1 PXT_ASMDEBUG=1`; you can add `PXT_NODOCKER=1`; `pxt help` has help on these
* find project folder under `pxt-microbit/projects`, typically `pxt-microbit/projects/Untitled-42`
* if you're going to modify `.cpp` files in PXT, replace `"core": "*"` in `pxt.json` with `"core": "file:../../libs/core"`;
  similarly `"radio": "file:../../libs/radio"` and `"microphone": "file:../../libs/microphone"`
* you can edit `main.ts` to change the PXT side of the program; you can also edit it from the localhost editor;
  note that `Download` in the localhost editor will produce different binary than command line, as it builds in the cloud
  and uses tagged version of CODAL
* in that folder run `pxt build` - this will clone codal somewhere under `built/` (depends on build engine and docker)
* there can be an issue with exporting the variables i.e. PXT_FORCE, so including them in the build command can help solve issues `sudo PXT_NODOCKER=1 PXT_ASMDEBUG=1 PXT_RUNTIME_DEV=1 PXT_DEBUG=1 PXT_FORCE_LOCAL=1 PXT_COMPILE_SWITCHES=csv---mbcodal pxt build`
* if the target is not building, delete files in `hexcache` found in `pxt-microbit/built/hexcache` to force local build
* the built hex can be found in `pxt-microbit/projects/<your project name>/built` named `binary.hex`
* similarly, you can run `pxt deploy` (or just `pxt` which is the same) - it will build and copy to `MICROBIT` drive
* assuming the build folder is under `built/codal`, go to `built/codal/libraries` and run `code *`
* in git tab, checkout appropriate branches (they are all in detached head state to the way we tag releases)
* modify files, run `pxt`, see effects
* you can also run `pxt gdb` to debug; this requires `openocd`
* other commands using `openocd` are `pxt dmesg` which dumps `DMESG(...)` buffer and `pxt heap` which can be used to visualize PXT heap 
  (and CODAL's one to some extent)

### Updating dal.d.ts

```
cd libs/blocksprj
rm -rf built
PXT_FORCE_LOCAL=1 PXT_COMPILE_SWITCHES=csv---mbcodal pxt build
PXT_FORCE_LOCAL=1 PXT_COMPILE_SWITCHES=csv---mbcodal pxt builddaldts
mv dal.d.ts ../core
```

### Updates

Make sure to pull changes from all repos regularly. More instructions are at https://github.com/Microsoft/pxt#running-a-target-from-localhost

## Update playlists in markdown

To add a new playlist, add an entry in ``/playlists.json``, and regenerate the markdown (see paragraph below). You'll now have a new markdown gallery file listing the videos which you can reference in ``/targetconfig.json``.

Get a Google API key and store it in the ``GOOGLE_API_KEY`` environment variables (turn on data from the app).

```
pxt downloadplaylists
```

## Repos 

The pxt-microbit target depends on several other repos. The main ones are:
- https://github.com/Microsoft/pxt, the PXT framework
- https://github.com/Microsoft/pxt-common-packages, common APIs accross various MakeCode editors
- https://github.com/lancaster-university/microbit, basic wrapper around the DAL
- https://github.com/lancaster-university/microbit-dal

## History

See the [MakeCode blog](https://makecode.com/blog).

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

MICROSOFT, the Microsoft Logo, and MAKECODE are registered trademarks of Microsoft Corporation. They can only be used for the purposes described in and in accordance with Microsoft’s Trademark and Brand guidelines published at https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general.aspx. If the use is not covered in Microsoft’s published guidelines or you are not sure, please consult your legal counsel or MakeCode team (makecode@microsoft.com).
