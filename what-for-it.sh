#!/usr/bin/env bash
# wait-for-it.sh

# Use this script to wait for a service to be available before running your command.
# Example usage:
# ./wait-for-it.sh <host>:<port> -- <your-command>

TIMEOUT=15
QUIET=0
HOST=
PORT=
CMD=

# Parse options
while getopts "t:q" opt; do
  case "$opt" in
    t) TIMEOUT="$OPTARG" ;;
    q) QUIET=1 ;;
    *) echo "Invalid option: $opt" ;;
  esac
done
shift $((OPTIND-1))

HOST=$1
PORT=$2
CMD="${@:3}"

# Function to check if the service is up
wait_for() {
  echo "Waiting for $HOST:$PORT to be available..."

  start_ts=$(date +%s)

  while ! nc -z $HOST $PORT; do
    # Check if timeout is reached
    end_ts=$(date +%s)
    elapsed_ts=$((end_ts - start_ts))
    if [ $elapsed_ts -gt $TIMEOUT ]; then
      echo "Timeout reached while waiting for $HOST:$PORT"
      exit 1
    fi
    sleep 1
  done

  echo "$HOST:$PORT is available"
}

# Run the wait_for function
wait_for

# If a command was specified, run it
if [ ! -z "$CMD" ]; then
  exec $CMD
fi
