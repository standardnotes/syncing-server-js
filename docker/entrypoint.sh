#!/bin/sh
set -e

COMMAND=$1 && shift 1

case "$COMMAND" in
  'start-local')
    echo "Starting Web in Local Mode..."
    yarn start:local
    ;;

  'start-worker-local')
    echo "Starting Worker in Local Mode..."
    yarn worker:local
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
