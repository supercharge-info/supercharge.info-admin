#!/bin/bash
#==============================================================================================
# Deploy
#==============================================================================================

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# variables
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
ENV=$1
if [[ "$1" = "test" ]]; then
    REMOTE_HOST="super01.supercharge.info"
    SSH_USER="tomcat_test"
    DIR_DEPLOY="/var/www/test/supercharge.info#admin"
elif [[ "$1" = "prod" ]]; then
    REMOTE_HOST="super01.supercharge.info"
    SSH_USER="tomcat"
    DIR_DEPLOY="/var/www/prod/supercharge.info#admin"
else
    echo "unknown environment: ${ENV}";
    echo "usage: deploy.sh [test|prod]";
    exit;
fi

BUILD_DIR='build'
DIR_STAGE=${DIR_DEPLOY}_`date +'%Y_%m_%d_%H_%M_%S'`

echo "##########################################################";
echo "REMOTE_HOST = ${REMOTE_HOST}"
echo "SSH_USER    = ${SSH_USER}"
echo "DIR_DEPLOY  = ${DIR_DEPLOY}"
echo "DIR_STAGE   = ${DIR_STAGE}"
echo "##########################################################";

# The string check here is for extra safely.
if [[ "${DIR_DEPLOY}" = "" ]]
then
    exit;
fi

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# confirmation
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -

echo "Is that correct [yes/no]?"
read confirmation

if [[ "${confirmation}" != "yes" ]]; then
    echo "exiting";
    exit;
fi


# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# functions
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function remoteCommand {
  echo "EXEC REMOTE COMMAND: $1";
  ssh ${SSH_USER}@${REMOTE_HOST} "$1"
}

# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# deploy
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -

remoteCommand "mkdir ${DIR_STAGE}"

scp -r ${BUILD_DIR}/* ${SSH_USER}@${REMOTE_HOST}:${DIR_STAGE}/

remoteCommand "rm -r ${DIR_DEPLOY}_OLD"
remoteCommand "mv ${DIR_DEPLOY} ${DIR_DEPLOY}_OLD"

remoteCommand "mv ${DIR_STAGE} ${DIR_DEPLOY}"

remoteCommand "chown -R ${SSH_USER}:www-data ${DIR_DEPLOY}"
remoteCommand "chmod -R ug+rx ${DIR_DEPLOY}"

