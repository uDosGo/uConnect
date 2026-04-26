
# Supported Machine Profiles

Sonic supports multiple deployment targets.

## Standard hosts

macOS  
Ubuntu  
Sonic-bootstrapped Linux  

These systems run the full uDOS runtime.

## Lean hosts

uDOS-alpine  

Used for:

- kiosks
- controllers
- older machines
- embedded devices

## Rescue environments

USB recovery media  
portable installer kits

## Product Rule

Machine profiles should map cleanly onto one of the active product lanes:

- live
- install
- recovery

The rescue-maintenance profile is the canonical recovery reference for the
current `v2.3` Round D lane.
