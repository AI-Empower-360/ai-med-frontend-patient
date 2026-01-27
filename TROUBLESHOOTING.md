# Troubleshooting Guide - AI Med Patient Portal

Comprehensive troubleshooting guide for common issues and their solutions.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Installation Issues](#installation-issues)
3. [Build & Development Issues](#build--development-issues)
4. [Runtime Issues](#runtime-issues)
5. [API Connection Issues](#api-connection-issues)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Browser-Specific Issues](#browser-specific-issues)
9. [Deployment Issues](#deployment-issues)
10. [Getting Help](#getting-help)

## Quick Diagnostics

### Health Check Commands

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# Check if dependencies are installed
ls node_modules

# Check environment variables
npm run validate-env

# Check TypeScript compilation
npm run type-check

# Check for linting errors
npm run lint

# Run tests
npm test
```

### Common Quick Fixes

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Reset environment:**
   ```bash
   rm .env.local
   npm run setup
   ```

## Installation Issues

### Issue: `npm install` fails

**Symptoms:**
- Error messages during installation
- Missing dependencies
- Permission errors

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Use different package manager:**
   ```bash
   # Try yarn
   yarn install
   
   # Or pnpm
   pnpm install
   ```

4. **Check disk space:**
   ```bash
   # Windows
   dir
   
   # Linux/Mac
   df -h
   ```

5. **Run as administrator (Windows):**
   - Right-click terminal
   - Select "Run as administrator"

### Issue: TypeScript errors during installation

**Symptoms:**
- TypeScript compilation errors
- Missing type definitions

**Solutions:**

1. **Install TypeScript globally:**
   ```bash
   npm install -g typescript
   ```

2. **Reinstall @types packages:**
   ```bash
   npm install --save-dev @types/node @types/react @types/react-dom
   ```

### Issue: Permission denied errors

**Symptoms:**
- `EACCES` errors
- Cannot write to directories

**Solutions:**

1. **Fix npm permissions (Linux/Mac):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

2. **Use nvm (Node Version Manager):**
   ```bash
   # Install nvm, then:
   nvm install 18
   nvm use 18
   ```

## Build & Development Issues

### Issue: Build fails with TypeScript errors

**Symptoms:**
- Type errors during `npm run build`
- TypeScript compilation fails

**Solutions:**

1. **Check TypeScript version:**
   ```bash
   npx tsc --version
   ```

2. **Run type check separately:**
   ```bash
   npm run type-check
   # Fix errors shown
   ```

3. **Update TypeScript:**
   ```bash
   npm install --save-dev typescript@latest
   ```

4. **Check tsconfig.json:**
   - Ensure `strict: true` is set (or adjust as needed)
   - Verify `include` paths are correct

### Issue: `npm run dev` doesn't start

**Symptoms:**
- Server doesn't start
- Port already in use
- Module not found errors

**Solutions:**

1. **Check if port 3000 is in use:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

2. **Kill process on port 3000:**
   ```bash
   # Windows
   taskkill /PID <process_id> /F
   
   # Linux/Mac
   kill -9 <process_id>
   ```

3. **Use different port:**
   ```bash
   PORT=3001 npm run dev
   ```

4. **Check for missing modules:**
   ```bash
   npm install
   ```

### Issue: Hot reload not working

**Symptoms:**
- Changes not reflected in browser
- Manual refresh required

**Solutions:**

1. **Check file watchers:**
   ```bash
   # Increase file watchers (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Clear browser cache

## Runtime Issues

### Issue: Blank page or white screen

**Symptoms:**
- Page loads but shows nothing
- Console errors

**Solutions:**

1. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **Check environment variables:**
   ```bash
   npm run validate-env
   ```

3. **Check for JavaScript errors:**
   - Look for syntax errors
   - Check for missing imports
   - Verify all dependencies are installed

4. **Check error boundary:**
   - Error boundary should catch React errors
   - Check if error message is displayed

### Issue: Styles not loading

**Symptoms:**
- No styling applied
- Tailwind classes not working

**Solutions:**

1. **Check Tailwind configuration:**
   ```bash
   # Verify tailwind.config.js exists
   ls tailwind.config.js
   ```

2. **Check PostCSS configuration:**
   ```bash
   # Verify postcss.config.js exists
   ls postcss.config.js
   ```

3. **Rebuild CSS:**
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check globals.css import:**
   - Verify `app/globals.css` exists
   - Check it's imported in `app/layout.tsx`

### Issue: PDF export not working

**Symptoms:**
- PDF button doesn't work
- PDF file not generated
- Browser download blocked

**Solutions:**

1. **Check browser console:**
   - Look for JavaScript errors
   - Check if jsPDF is loaded

2. **Check browser popup blocker:**
   - Allow popups for the site
   - Check browser settings

3. **Verify jsPDF installation:**
   ```bash
   npm list jspdf
   ```

4. **Test PDF generation:**
   ```bash
   # In browser console
   import('jspdf').then(jsPDF => {
     const doc = new jsPDF.default();
     doc.text('Test', 10, 10);
     doc.save('test.pdf');
   });
   ```

## API Connection Issues

### Issue: Cannot connect to backend API

**Symptoms:**
- Network errors
- CORS errors
- Timeout errors

**Solutions:**

1. **Verify API URL:**
   ```bash
   # Check environment variable
   echo $NEXT_PUBLIC_API_BASE_URL
   
   # Or in .env.local
   cat .env.local
   ```

2. **Test API connectivity:**
   ```bash
   # Test if backend is running
   curl http://localhost:3001/health
   
   # Or use browser
   # Navigate to http://localhost:3001/health
   ```

3. **Check CORS settings:**
   - Backend must allow frontend origin
   - Check CORS headers in Network tab

4. **Check firewall/proxy:**
   - Verify ports are open
   - Check proxy settings
   - Test from different network

### Issue: 401 Unauthorized errors

**Symptoms:**
- Authentication fails
- Token errors
- Redirected to login

**Solutions:**

1. **Check token:**
   - Verify token is being sent
   - Check token expiration
   - Verify token format

2. **Check authentication flow:**
   - Verify login endpoint works
   - Check token storage (should be in memory)
   - Verify token is included in requests

3. **Check backend:**
   - Verify JWT secret matches
   - Check token validation logic
   - Verify patient exists

### Issue: API returns 500 errors

**Symptoms:**
- Server errors
- Internal server error messages

**Solutions:**

1. **Check backend logs:**
   - Review server error logs
   - Check for database connection issues
   - Verify backend dependencies

2. **Check request format:**
   - Verify request body format
   - Check required fields
   - Validate data types

3. **Test with Postman:**
   - Replicate request in Postman
   - Check if error persists
   - Compare request/response

## Authentication Issues

### Issue: Login fails

**Symptoms:**
- Cannot log in
- Error messages on login
- Redirected back to login

**Solutions:**

1. **Check credentials:**
   - Verify email format
   - Check access code format
   - Test with known good credentials

2. **Check backend:**
   - Verify login endpoint is accessible
   - Check backend logs
   - Verify patient exists in database

3. **Check demo mode:**
   ```env
   # If demo mode is enabled, login should work with any credentials
   NEXT_PUBLIC_DEMO_MODE=true
   ```

4. **Check network:**
   - Verify API connection
   - Check for CORS errors
   - Test with browser DevTools

### Issue: Session expires immediately

**Symptoms:**
- Logged out right after login
- Token not persisting
- Redirected to login

**Solutions:**

1. **Check token storage:**
   - Tokens are stored in memory (by design)
   - Page refresh will require re-login
   - This is HIPAA compliant behavior

2. **Check token expiration:**
   - Verify token expiration time
   - Check backend token settings
   - Verify token validation

3. **Check error boundary:**
   - Errors might trigger logout
   - Check for unhandled errors
   - Review error logs

## Performance Issues

### Issue: Slow page loads

**Symptoms:**
- Long load times
- Slow API responses
- Laggy interactions

**Solutions:**

1. **Check network:**
   - Test API response times
   - Check network throttling
   - Verify CDN (if used)

2. **Check bundle size:**
   ```bash
   npm run build
   # Check .next/analyze for bundle analysis
   ```

3. **Enable production mode:**
   ```bash
   NODE_ENV=production npm run build
   npm run start
   ```

4. **Check images:**
   - Optimize images
   - Use Next.js Image component
   - Enable image optimization

### Issue: High memory usage

**Symptoms:**
- Browser becomes slow
- High RAM usage
- Crashes

**Solutions:**

1. **Check for memory leaks:**
   - Review useEffect cleanup
   - Check for event listeners
   - Verify component unmounting

2. **Reduce bundle size:**
   - Code splitting
   - Lazy loading
   - Remove unused dependencies

3. **Check browser:**
   - Close other tabs
   - Clear browser cache
   - Update browser

## Browser-Specific Issues

### Issue: Doesn't work in Internet Explorer

**Solution:** Internet Explorer is not supported. Use modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Issue: Safari-specific issues

**Symptoms:**
- Styles not loading
- Date inputs not working
- Print issues

**Solutions:**

1. **Check CSS prefixes:**
   - Tailwind should handle this
   - Verify autoprefixer is configured

2. **Check date inputs:**
   - Safari has different date input behavior
   - Test date range filters

3. **Check print styles:**
   - Verify print CSS
   - Test print functionality

### Issue: Mobile browser issues

**Symptoms:**
- Layout broken on mobile
- Touch events not working
- Viewport issues

**Solutions:**

1. **Check viewport meta tag:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Test responsive design:**
   - Use browser DevTools device emulation
   - Test on actual devices
   - Check breakpoints

3. **Check touch events:**
   - Verify button sizes (min 44x44px)
   - Test touch interactions
   - Check for hover states on mobile

## Deployment Issues

### Issue: Build fails in production

**Solutions:**

1. **Check environment variables:**
   - Verify all required variables are set
   - Check variable names (case-sensitive)
   - Ensure `NEXT_PUBLIC_` prefix for client vars

2. **Check Node.js version:**
   - Production must use Node.js 18+
   - Verify in deployment platform

3. **Check build logs:**
   - Review full build output
   - Look for specific errors
   - Check memory limits

### Issue: Environment variables not loading

**Solutions:**

1. **Verify variable names:**
   - Must start with `NEXT_PUBLIC_` for client-side
   - Case-sensitive
   - No spaces or special characters

2. **Check deployment platform:**
   - Verify variables are set correctly
   - Check environment (dev/staging/prod)
   - Restart application after changes

3. **Validate environment:**
   ```bash
   npm run validate-env
   ```

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check [API_INTEGRATION.md](./API_INTEGRATION.md)
3. ✅ Check [DEPLOYMENT.md](./DEPLOYMENT.md)
4. ✅ Check browser console for errors
5. ✅ Check network tab for failed requests
6. ✅ Review application logs

### Information to Provide

When reporting issues, include:

1. **Environment:**
   - Node.js version
   - npm version
   - Operating system
   - Browser and version

2. **Error Details:**
   - Full error message
   - Stack trace
   - Console logs
   - Network errors

3. **Steps to Reproduce:**
   - What you were doing
   - Expected behavior
   - Actual behavior

4. **Configuration:**
   - Environment variables (sanitized)
   - Relevant code snippets
   - Deployment platform

### Resources

- **Documentation:**
  - [README.md](./README.md)
  - [SETUP_GUIDE.md](./SETUP_GUIDE.md)
  - [TESTING.md](./TESTING.md)

- **Community:**
  - GitHub Issues
  - Next.js Discord
  - Stack Overflow

---

**Last Updated:** January 2026
