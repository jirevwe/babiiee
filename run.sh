#! /bin/bash

build(){
    docker build -t babiiee .
}

run() {
    docker run -it babiiee
}

build
run