#!/bin/bash
cd /home/kavia/workspace/code-generation/skillmaster-learning-platform-223450-222246/frontend_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

