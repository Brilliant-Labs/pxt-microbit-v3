# Do Ping Tutorial for Blocks

## Let´s start

Let's do a quick __*Ping*__ to the Access Point, the M5Core2 Module. It has a default IP address of __192.168.4.1__, which is great for getting started!

In your particular case, let's make sure everyone knows who you are, what your role is, and your MAC and IP address. Show them your Cyberville ID card from the previous activities.

![IDCard](https://github.com/Brilliant-Labs/code.bl/blob/code_alpha/packaged/docs/static/mb/projects/bboard-tutorials-cyberville/Networking/4_Do_Ping/IDcard.png?raw=true "IDCard")


## Step 1

### Connect to Cyberville wifi Network
Place a ``||Cybersecurity:connect to wifi||`` block to stablish conection with the __Access Point__ M5Core2.

```blocks
Cybersec.WifiConnect("Cyberville #1", "")
});
```

![CntCyberville](https://github.com/Brilliant-Labs/code.bl/blob/code_alpha/packaged/docs/static/mb/projects/bboard-tutorials-cyberville/Networking/4_Do_Ping/CntCyberville.gif?raw=true "Connection to Cyberville")

## Step 2
Place a ``||input:on button pressed||`` block to run code when button **A** is pressed.

```blocks
input.onButtonPressed(Button.A, () => { 
});
```

## Step 3

Add ``||Cybersecurity:Do PING to IP||`` block to display if IP address __192.168.4.1__ is currently connected in the Cyberville network.

```blocks
input.onButtonPressed(Button.A, () => { 
    Cybersec.PingbBfrend("192.168.4.1");
});
```
![Do_Ping](https://github.com/Brilliant-Labs/code.bl/blob/code_alpha/packaged/docs/static/mb/projects/bboard-tutorials-cyberville/Networking/4_Do_Ping/DoPing.gif?raw=true "Do Ping to 192.168.4.1")

## Step 4

If you have a __b.Board__, just connect it to USB and click "|Download|" to transfer your code. Then, press button **A** on your microbit-b.Board. You'll hear a _hello play song_, which is really cool, when the command __ping__ is executed, you'll also see a smiley face if the IP 192.168.4.1 is connected in the Cyberville network. If you see an X on your Microbit screen with a sad play song, don't worry it means that your friend is not in the network!
Check your code and have fun!

## Step 6

Nice! Now go and check if your friends are connected in the Cyberville network!

