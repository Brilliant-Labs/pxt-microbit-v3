# Do Ping Tutorial for Phyton
## Let´s start

Let's do a quick Ping to the Access Point, the M5Core2 Module. It has a default IP address of 192.168.4.1, which is great for getting started!

Tell everyone who you are, your role, as well your MAC and IP address, show them your Cyberville ID Card. PY

![ID](https://github.com/Brilliant-Labs/code.bl/blob/code_alpha/packaged/docs/static/mb/projects/bboard-tutorials-cyberville/Networking/4_Do_Ping/IDcard.png?raw=true "ID")

## Step 1

Put in an ``||input:on button pressed||`` event to run code when button **A** is pressed.

```python
def on_button_pressed_a():
    pass
input.on_button_pressed(Button.A, on_button_pressed_a)
```

## Step 2

Use ``||basic:show icon||`` to display a **Happy** face on the screen.

Press the **A** button in the simulator to see the smiley.

```python
def on_button_pressed_a():
    basic.show_icon(IconNames.HAPPY)
input.on_button_pressed(Button.A, on_button_pressed_a)
```

## Step 3

Use another ``||input:on button pressed||`` with a ``||basic:show icon||`` inside to display a **Sad** face when button **B** is pressed.

```python
def on_button_pressed_a2():
    basic.show_icon(IconNames.SAD)
input.on_button_pressed(Button.B, on_button_pressed_a2)
```

## Step 4

Add a secret mode that happens when **A** and **B** are pressed together. For this case, use ``||basic:show icon||`` multiple times to create an animation.

```python
def on_button_pressed_a3():
    basic.show_icon(IconNames.SILLY)
    basic.show_icon(IconNames.SURPRISED)
input.on_button_pressed(Button.AB, on_button_pressed_a3)
```

## Step 5

Click ``|Download|`` to transfer your code to your @boardname@ (if you have one). Try buttons **A**, **B** and then **A** and **B** together.

## Step 6

If you have a @boardname@ connected, click ``|Download|`` and transfer your code to the @boardname@!
