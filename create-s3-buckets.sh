#!/bin/sh

set -e

# Executable that waits for a port at an address to be open.
# For further details go to: https://github.com/ufoscout/docker-compose-wait
/wait

awslocal s3 mb s3://unstable-elife-style-content-adapter-incoming
awslocal s3 mb s3://unstable-elife-style-content-adapter-expanded
