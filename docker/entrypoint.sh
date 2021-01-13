#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local')
    echo "Building the project..."
    yarn build
    echo "Starting Web..."
    yarn start
    ;;

  'start-web' )
    echo "Starting Web..."
    yarn start
    ;;

  'start-worker' )
    echo "Starting Worker..."
    yarn worker
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
