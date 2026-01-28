# Troubleshooting Guide

## Voice Chat Issues

### "Could not access microphone" Error

**Common Causes:**

1. **HTTPS Required**
   - Voice chat requires a secure HTTPS connection
   - Railway.app automatically provides HTTPS ✅
   - HTTP connections will fail (security restriction)

2. **Browser Permissions**
   - Click the lock icon in the address bar
   - Allow microphone access for the site
   - Refresh the page after granting permissions

3. **Microphone Not Found**
   - Check if your device has a microphone
   - Make sure it's not disabled in system settings
   - Try a different browser

4. **Microphone Already in Use**
   - Close other apps using the microphone (Zoom, Discord, etc.)
   - Close other browser tabs with microphone access
   - Restart your browser

### How to Enable Microphone Permissions

**Chrome/Edge:**
1. Click the lock icon (or camera icon) in the address bar
2. Find "Microphone" in the permissions list
3. Change to "Allow"
4. Refresh the page

**Firefox:**
1. Click the lock icon in the address bar
2. Click "Connection secure" → "More information"
3. Go to "Permissions" tab
4. Find "Use the Microphone" and check "Allow"
5. Refresh the page

**Safari:**
1. Safari → Settings → Websites → Microphone
2. Find your site and set to "Allow"
3. Refresh the page

### Voice Chat Not Working on Deployment

**Railway.app automatically provides HTTPS**, so voice chat should work fine.

If it still doesn't work:
1. Clear browser cache and cookies
2. Try in an incognito/private window
3. Check browser console for errors (F12 → Console tab)
4. Make sure you're using a modern browser (Chrome 90+, Firefox 88+, Safari 14+)

## Chat Messages Not Sending

### Check Connection Status
1. Open browser console (F12 → Console tab)
2. Look for "Socket connected successfully" message
3. If you see connection errors, check:
   - Server is running
   - No firewall blocking WebSocket connections
   - Correct URL is being used

### Common Fixes
1. **Refresh the page** - Simplest solution
2. **Clear localStorage** - Open console and run: `localStorage.clear()`
3. **Re-login** - Logout and login again
4. **Check authentication** - Make sure you're logged in

## Mobile Issues

### Sidebar Not Opening
- Make sure you're tapping the hamburger menu icon (top left)
- Try refreshing the page
- Check if screen width is below 768px

### Voice Chat on Mobile
- Mobile browsers have stricter microphone permissions
- You may need to tap "Allow" multiple times
- Some mobile browsers don't support WebRTC well
- **Recommended mobile browsers:**
  - Chrome Mobile (Android)
  - Safari (iOS 14.3+)
  - Samsung Internet

## Deployment Issues

### App Not Loading on Railway
1. Check build logs in Railway dashboard
2. Make sure all dependencies are in package.json
3. Verify PORT environment variable is set correctly
4. Check that render.yaml is in the repository

### WebSocket Connection Failed
- Railway automatically handles WebSocket connections
- Make sure you're using the Railway-provided URL
- Don't use custom domains without proper configuration

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Not Supported
- ❌ Internet Explorer
- ❌ Old browser versions
- ❌ Browsers without WebRTC support

## Getting Help

### Debug Information to Collect
1. Browser name and version
2. Operating system
3. Error messages from console (F12 → Console)
4. Network errors (F12 → Network tab)
5. Steps to reproduce the issue

### How to Open Browser Console
- **Windows/Linux**: Press F12 or Ctrl+Shift+I
- **Mac**: Press Cmd+Option+I
- Look for red error messages

## Quick Fixes Checklist

- [ ] Refresh the page
- [ ] Clear browser cache
- [ ] Allow microphone permissions
- [ ] Check HTTPS connection (should have lock icon)
- [ ] Try incognito/private mode
- [ ] Update browser to latest version
- [ ] Close other apps using microphone
- [ ] Check internet connection
- [ ] Try different browser
- [ ] Logout and login again

## Still Having Issues?

1. Check the browser console for specific error messages
2. Try the app on a different device
3. Make sure you're using the latest version from GitHub
4. Verify the server is running and accessible
