

// Motion controller buttons
// Legacy input mappings used by some functions.

// When the trigger is pressed. Same for Oculus Touch.
declare const IN_USE_HAND0: UInt64;
// When the trigger is pressed. Same for Oculus Touch.
declare const IN_USE_HAND1: UInt64;
// When the pad is pressed on the left side.
declare const IN_PAD_LEFT_HAND0: UInt64;
// When the pad is pressed on the right side.
declare const IN_PAD_RIGHT_HAND0: UInt64;
// When the pad is pressed on the top.
declare const IN_PAD_UP_HAND0: UInt64;
// When the pad is pressed on the bottom.
declare const IN_PAD_DOWN_HAND0: UInt64;
// When the pad is pressed on the left side.
declare const IN_PAD_LEFT_HAND1: UInt64;
// When the pad is pressed on the right side.
declare const IN_PAD_RIGHT_HAND1: UInt64;
// When the pad is pressed on the top.
declare const IN_PAD_UP_HAND1: UInt64;
// When the pad is pressed on the bottom.
declare const IN_PAD_DOWN_HAND1: UInt64;
// Menu button above the touchpad.
declare const IN_MENU_HAND0: UInt64;
// Menu button above the touchpad.
declare const IN_MENU_HAND1: UInt64;
// Pressing the grip. Lightly pushing the grip for Oculus Touch.
declare const IN_GRIP_HAND0: UInt64;
// Pressing the grip. Lightly pushing the grip for Oculus Touch.
declare const IN_GRIP_HAND1: UInt64;
declare const IN_GRIPANALOG_HAND0: UInt64;
declare const IN_GRIPANALOG_HAND1: UInt64;
// When the pad is pressed anywhere. Heavily pushing the grip for Oculus Touch.
declare const IN_PAD_HAND0: UInt64;
// When the pad is pressed anywhere. Heavily pushing the grip for Oculus Touch.
declare const IN_PAD_HAND1: UInt64;
// When the pad is touched anywhere. Pushing the thumbstick on Oculus Touch.
declare const IN_PAD_TOUCH_HAND0: UInt64;
// When the pad is touched anywhere. Pushing the thumbstick on Oculus Touch.
declare const IN_PAD_TOUCH_HAND1: UInt64;

declare interface CHandInputData {
    // Button mask for buttons being held down.
    buttonsDown: UInt64;
    // Button mask for buttons that have just been pressed.
    buttonsPressed: UInt64;
    // Button mask for buttons that have just been released.
    buttonsReleased: UInt64;

    // Horizontal joystick position. -1.0 to 1.0
    joystickX: number;
    // Vertical joystick position. -1.0 to 1.0
    joystickY: number;
    // Horizontal trackpad touch position. -1.0 to 1.0
    trackpadX: number;
    // Vertical trackpad touch position. -1.0 to 1.0
    trackpadY: number;

    // Analog trigger value. 0.0 to 1.0
    triggerValue: number;
}
