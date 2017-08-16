#! /usr/bin/env bash
#
# author: ZhangDaWei
# email: favorofife@yeah.net
#
# regularly backup keepwork database and sync with remote server

# local backup data folder
# it's a named docker data volume
LOCAL_BACKUP_FOLDER=/var/lib/docker/volumes/prod-database/_data/rls
# folder that sync with remote server, we pack and zip data and save them here
LOCAL_SYNC_FOLDER=/data/backup/keepwork

##################################
# remote data backup server
# server user
SERVER_USER=root
# remote server address that that copy backup data
REMOTE_BACKUP_SERVER=47.52.20.34
# sync folder in remote server
REMOTE_BACKUP_FOLDER=/data/backup

# pack LOCAL_BACKUP_FOLDER into a file named keepwork-<time format>[-key].tar.gz
# save that zip file into LOCAL_SYNC_FOLDER and sync with remote server
# main name
MAIN_NAME=keepwork
# backup time
BACKUP_TIME=$(date +"%Y-%m-%d")
# is a key version? strategy: every sunday version is a key version
KEYDAY=7 # 7 means sunday
if [[ $(date +"%u") == "$KEYDAY" ]]; then
  FILENAME_FORMAT="%s-%s-key.tar.gz"
else
  FILENAME_FORMAT="%s-%s.tar.gz"
fi
# backup file name
BACKUP_FILENAME=$(printf "$FILENAME_FORMAT" "$MAIN_NAME" "$BACKUP_TIME")

# helper function
loginfo() { echo "[$(date)][$0][INFO] $@"; }
logerr() { echo "[$(date)][$0][ERROR] $@" 1>&2; }

# -r, don't use date as argument because
# recovery is an important thing
usage() {
{
cat << EOF
usage: $0 -b | -r backup_file | -h
  -b, run backup
  -r backup_file, recovery from file named backup_file in sync directory
  -h, show usage
EOF
} >&2
exit 1
}

# need parameter
if [[ "$#" == "0" ]]; then usage; fi

is_backup=""
is_recovery=""
recovery_file=""
while getopts ":br:h" flag; do
  case "${flag}" in
    b)
      is_backup=true
      ;;
    r)
      is_recovery=true
      recovery_file=$OPTARG
      ;;
    h) usage;;
    \?) usage;;
    *) usage;;
  esac
done

# -b and -r are conflict
if [[ $is_backup == true ]] && [[ $is_recovery == true ]]; then usage; fi



if [[ ! -d "$LOCAL_BACKUP_FOLDER" ]]; then
  logerr "folder $LOCAL_BACKUP_FOLDER need to be backup doesn't exist!"
  exit 2
fi
if [[ ! -d "$LOCAL_SYNC_FOLDER" ]]; then
  logerr "The folder that sync backup data with remote server doesn't exist!"
  logerr "mkdir $LOCAL_SYNC_FOLDER for you"
  mkdir -p "$LOCAL_SYNC_FOLDER"
fi

if [[ $is_recovery == true ]]; then
  # extract files from tar.gz file to where it is from
  # new files extracted from tar.gz file will overwrite the existed
  # file with same name in backup folder

  # check if backup file exists sync folder
  if [[ ! -f "$LOCAL_SYNC_FOLDER/$recovery_file" ]]; then
    logerr "file $recovery_file not exists in sync folder $LOCAL_SYNC_FOLDER"
    exit 2
  fi

  loginfo "start recovery with file $recovery_file"
  tar -xpvzf "$LOCAL_SYNC_FOLDER/$recovery_file" -C "$LOCAL_BACKUP_FOLDER"
  loginfo "recovery done"

  loginfo "recovery success"

  exit 0
fi

if [[ $is_backup == true ]]; then
  # if there is BACKUP_FILENAME file exists in LOCAL_SYNC_FOLDER, new file will overwrite it
  # ATTENTION, using cd and tar . here to avoid save directory path into zip file
  # relatively, when you extract, you need tar -C DST to point the parent folder
  # of all files in tar.gz
  loginfo "start backup version $BACKUP_FILENAME"
  ( cd $LOCAL_BACKUP_FOLDER; tar -cpvzf "$LOCAL_SYNC_FOLDER/$BACKUP_FILENAME" .)
  loginfo "backup done"

  # sync with remote server
  # ATTENTION
  # use
  #    ssh-copy-id -i ~/.ssh/id_rsa.pub $SERVER_USER@$REMOTE_BACKUP_SERVER
  # to avoid input password again and again
  loginfo "start sync with remote server $REMOTE_BACKUP_SERVER"

  rsync -avz -e ssh "$LOCAL_SYNC_FOLDER" "$SERVER_USER@$REMOTE_BACKUP_SERVER:$REMOTE_BACKUP_FOLDER"
  sync_status=$?

  if [[ $sync_status == 0 ]]; then
    loginfo "sync done"
  else
    logerr "rsync error"
  fi

  exit $sync_status
fi

unset is_backup
unset is_recovery
unset recovery_file

