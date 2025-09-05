# Phone Number Formatting Test

You can test the following phone number formats in the application:

## Valid US Phone Number Formats

✅ **Raw 10 digits**: `1234567890`
✅ **Formatted**: `(123) 456-7890`
✅ **Dashed**: `123-456-7890`
✅ **Spaces**: `123 456 7890`
✅ **With country code**: `11234567890`
✅ **International format**: `+11234567890`

## How the System Processes Them

All of the above formats will be:
1. **Cleaned** to remove non-digits: `1234567890`
2. **Formatted** for storage as: `+11234567890`
3. **Validated** to ensure 10-15 digits total

## Test Phone Numbers for Development

Since Twilio isn't configured by default, verification codes will be logged to the console. You can use these test numbers:

- `1234567890` → will become `+11234567890`
- `5551234567` → will become `+15551234567`
- `9876543210` → will become `+19876543210`

## Debugging Steps

1. **Open browser console** (F12) to see verification codes
2. **Check server terminal** for formatted phone numbers and debug logs
3. **Look for logs** showing:
   - Registration request with original phone number
   - Formatted phone number for storage
   - SMS sent status
   - Verification code (in development mode)

## Expected Flow

1. Enter phone number in any format above
2. Click "Send verification code"
3. Check console for the 6-digit code
4. Enter the code in the verification screen
5. Complete authentication

The error "Phone number not registered or not verified" should no longer occur with the updated formatting logic.
