#!/bin/bash

echo "🚀 Preparing IBDPal Server for Railway deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the IBDPal-Server directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if all required files exist
echo "🔍 Checking required files..."
required_files=("index.js" "package.json" "railway.json" "database/db.js" "routes/auth.js" "routes/users.js" "routes/journal.js" "routes/diagnosis.js" "middleware/auth.js")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found"
        exit 1
    fi
done

echo "✅ All required files found"

# Create a deployment package
echo "📦 Creating deployment package..."
tar -czf ibdpal-server-deploy.tar.gz \
    index.js \
    package.json \
    railway.json \
    README.md \
    .gitignore \
    database/ \
    routes/ \
    middleware/

echo "✅ Deployment package created: ibdpal-server-deploy.tar.gz"
echo ""
echo "🎯 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Create a new project"
echo "3. Choose 'Deploy from local directory'"
echo "4. Upload the ibdpal-server-deploy.tar.gz file"
echo "5. Set environment variables:"
echo "   - DATABASE_URL: your-neon-postgresql-url"
echo "   - JWT_SECRET: your-super-secret-jwt-key"
echo "   - NODE_ENV: production"
echo "   - CORS_ORIGINS: https://your-ios-app-domain.com"
echo ""
echo "🚀 Your server will be deployed and you'll get a public URL!" 