#!/bin/bash

echo "🎮 iParty - Finding your computer's IP address..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$IP" ]; then
    echo "❌ Could not find IP address automatically."
    echo "Please run: ifconfig | grep 'inet '"
else
    echo "✅ Your IP Address: $IP"
    echo ""
    echo "📱 Players should visit:"
    echo "   http://$IP:5173"
    echo ""
    echo "🖥️  Host should visit:"
    echo "   http://localhost:5173"
fi
