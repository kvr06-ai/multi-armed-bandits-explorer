# Troubleshooting Guide

This document covers common issues and their solutions when running the Multi-Armed Bandit Explorer.

## Frontend Issues

### Problem: Node.js Version Compatibility

If you see errors when starting the application related to Node.js or npm, you might need to update your Node.js version.

**Solution**:
1. Ensure you're using Node.js 14 or higher
2. Update npm to the latest version:
   ```
   npm install -g npm@latest
   ```
3. Delete the `node_modules` folder and reinstall dependencies:
   ```
   rm -rf node_modules
   npm install
   ```

### Problem: TypeScript Compilation Errors

If you see TypeScript errors when starting the application:

**Solution**:
1. Make sure you have all dependencies installed:
   ```
   npm install
   ```
2. Try clearing the TypeScript cache:
   ```
   rm -rf node_modules/.cache
   ```
3. Check for TypeScript version compatibility issues:
   ```
   npm list typescript
   ```

### Problem: Rendering or Display Issues

If charts or components aren't displaying correctly:

**Solution**:
1. Try a different browser (Chrome or Firefox are recommended)
2. Clear your browser cache and reload
3. Check your browser console for specific error messages
4. Ensure your browser supports modern JavaScript features

## Performance Issues

### Problem: Slow Simulation Performance

If simulations are running slowly, especially with large numbers of steps or runs:

**Solution**:
1. Reduce the number of simulation steps or runs
2. Run simulations with fewer algorithms at a time
3. Use a more powerful device or a browser with better JavaScript performance
4. Close other resource-intensive applications or browser tabs

## Running the Application

For the most reliable experience, use the provided `run.sh` script:

```bash
chmod +x run.sh
./run.sh
```

This script will:
1. Check for Node.js installation
2. Install all required dependencies
3. Start the development server

If you encounter further issues, please open an issue on the GitHub repository. 