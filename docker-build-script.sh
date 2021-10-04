#!/bin/bash
set -e
set -x
#read variables from a previous run of this script (to allow other tasks to run between script calls, and variables to be retained in between)
VARIABLES_FILE=build.script.variables
test -e $VARIABLES_FILE && source $VARIABLES_FILE || echo -n

cleanup() {
    
    
    
    
    
    #write variables that have been set (and should be stored) to a file. Will use all variables that start with "BUILD_"
    returnValue=$?
    echo -n > $VARIABLES_FILE                              #clean old variables file
    for i in $(compgen -v | grep BUILD_); do echo $i=${!i} >> $VARIABLES_FILE; done
    exit $returnValue

}
trap cleanup ERR INT TERM EXIT

cd /srcdir
git rev-parse --abbrev-ref HEAD | grep -v master || {
  echo "Will not run, because you are on branch 'master' and I do not want to run there!"
  mkdir -p target/surefire-reports
  echo '<testsuite name="com.espirit.caas.common.message.TraceIdTest" time="0.167" tests="1" errors="0" skipped="0" failures="0">
  <testcase name="generateTraceId" classname="com.espirit.caas.common.message.TraceIdTest" time="0.167"/>
  </testsuite>' > target/surefire-reports/not-existing.xml
  exit 0
}
    
docker login artifactory.e-spirit.de:6555 --username system_pg_temp --password 'ZU%bHcxqhi1p\.C&'
docker login artifactory.e-spirit.de:6556 --username system_pg_temp --password 'ZU%bHcxqhi1p\.C&'
docker login docker-snapshot-local.artifactory.e-spirit.de --username system_pg_temp --password 'ZU%bHcxqhi1p\.C&'
docker login docker-release-local.artifactory.e-spirit.de --username system_pg_temp --password 'ZU%bHcxqhi1p\.C&'

BUILD_PROJECT_VERSION=$(sed -n -e 's/^version=\(.\+\)$/\1/p' gradle.properties | tr -d '\r\n')
./gradlew --info --stacktrace -DisCI publish
