#!/bin/bash

name=$1
wget https://raw.githubusercontent.com/microsoft/vscode-icons/master/icons/light/$name.svg
mv $name.svg resources/light
wget https://raw.githubusercontent.com/microsoft/vscode-icons/master/icons/dark/$name.svg
mv $name.svg resources/dark
