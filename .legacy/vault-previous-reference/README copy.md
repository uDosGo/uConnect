# Course Project

Project: produce and explain a safe Sonic deployment plan.

Suggested flow:

1. read `config/sonic-layout.json`
2. run `sonic plan --usb-device /dev/sdb --dry-run --out memory/sonic/sonic-manifest.json`
3. inspect the generated manifest
4. explain partition roles, boot targets, and payload references
5. explain which parts are planning output and which parts become destructive only during apply
6. identify where Sonic hands off to `uDOS` or `uHOME-server`
