#!/bin/bash

echo "🚀 Building AIBrowseX for Windows..."
echo ""

# Check if electron-builder is installed
if ! npm list electron-builder > /dev/null 2>&1; then
    echo "📦 Installing electron-builder..."
    npm install --save-dev electron-builder
fi

# Create icon placeholder if it doesn't exist
if [ ! -f "assets/icon.png" ]; then
    echo "🎨 Creating application icon..."
    # Create a simple 256x256 PNG placeholder
    # You should replace this with your actual icon
    echo "⚠️  Warning: Using placeholder icon. Replace assets/icon.png with your actual icon."
fi

# Build for Windows
echo ""
echo "🔨 Building Windows executable..."
npm run build:win

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Your Windows executable is in: dist/"
echo ""
echo "Files created:"
ls -lh dist/ 2>/dev/null || echo "No dist folder found. Check for build errors above."
