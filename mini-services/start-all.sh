#!/bin/bash
# Start all mini-services for DomPlace
# This script runs chat-service (port 3003) and tracking-service (port 3004)

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[DomPlace] Iniciando mini-serviços..."

# Start chat-service
cd "$DIR/chat-service"
export TURSO_DATABASE_URL="libsql://domplace-agencianextrom.aws-us-east-1.turso.io"
export TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY0ODcwMTIsImlkIjoiMDE5ZDllZTAtMTAwMS03ZDU2LThhOGUtZmM5ZmJiNmQ1Yzg2IiwicmlkIjoiMDVhNTg3YzctZGI1Mi00ZDVmLTg0YzEtODJhM2UzOTEwM2Q3In0.zsmUKAenGLfZLzqiN9wc-3xnlqjs27vRkwUtWK_QpAc6ApbBHQ9YQE8PTnClpVFt0rY35lPiAzbgOKP8Y8deAg"
bun index.ts &
CHAT_PID=$!
echo "[DomPlace] Chat service started (PID: $CHAT_PID, Port: 3003)"

# Start tracking-service
cd "$DIR/tracking-service"
unset TURSO_DATABASE_URL TURSO_AUTH_TOKEN
bun index.ts &
TRACK_PID=$!
echo "[DomPlace] Tracking service started (PID: $TRACK_PID, Port: 3004)"

# Wait for any process to exit
wait -n $CHAT_PID $TRACK_PID 2>/dev/null
EXIT_CODE=$?

echo "[DomPlace] Um serviço encerrou (exit code: $EXIT_CODE). Encerrando todos..."
kill $CHAT_PID $TRACK_PID 2>/dev/null
wait 2>/dev/null
echo "[DomPlace] Todos os serviços encerrados."
exit $EXIT_CODE
