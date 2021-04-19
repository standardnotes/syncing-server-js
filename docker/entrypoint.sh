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

  'daily-backup' )
    echo "Starting Daily Backup..."
    yarn daily-backup
    ;;

  'daily-backup-no-email' )
    echo "Starting Daily Backup Without Emails..."
    yarn daily-backup-no-email
    ;;

   * )
    echo "Unknown command"
    ;;
esac

exec "$@"
