---
title: My Debian development environment setup
description: Setting up a development environment on Debian with Docker and VSCode remote.
pubDate: "2024-03-18"
tags: "code,debian,development,vscode,docker,node,nvm,pnpm,proxmox,vm"
---

<script>
  import Note from '$lib/components/content/Note.svelte';
</script>

I recently need to set up a development environment on Debian for a project. As someone who works in DevRel, I'm often trying to replicate tools and environments that developers use. Additionally, I'm not allowed to use Docker on my work machine!

Lucky for me, I have a home lab server running Proxmox and I can spin up a VM for this purpose. I decided to use Debian 11 (Bullseye) for this project. Here's how I set up my development environment after installing Debian.

## Set up SSH keys

I want to use SSH keys and VSCode's Remote - SSH extension to connect to the VM.

```sh
ssh-copy-id jpoehnelt@192.168.0.121 # replace
```

I then added an entry to my `~/.ssh/config` file to make it easier to connect to the VM.

```txt
Host dev
  HostName 192.168.0.121
  User jpoehnelt
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_ed25519
```

I then tested in the terminal and VSCode to make sure I could connect to the VM.

```sh
ssh dev
```

Now I can connect to the VM with a single command! You may want to consider turning off password based ssh.

## Install the basics

I installed the basics that I need for development. This includes `git`, `curl`, `wget`, and `build-essential`.

```sh
sudo apt update
sudo apt upgrade -y

sudo apt install -y make curl build-essential openssl libssl-dev unzip
```

And configured `git` with my name and email.

```sh
git config --global user.name "Justin Poehnelt"
git config --global user.email "hi@jpoehnelt.dev"
git config --list # to show the config
```

I also used the GitHub CLI to authenticate with GitHub, see instructions at [cli.github.com](https://cli.github.com/).

```sh
gh auth login
```

Now I'm ready to start writing code!

## Install Docker

I'm not allowed to use Docker on my work machine, but I can use it on my homelab server. I installed Docker using the [official instructions for Debian](https://docs.docker.com/engine/install/debian/) from the Docker website.

For convenience, I added my user to the `docker` group so I don't have to use `sudo` for every command. This has security implications, so be sure to understand them before doing this.

```sh
sudo usermod -aG docker $USER
```

<Note>

If you're running Linux in a virtual machine, it may be necessary to restart the virtual machine for changes to take effect.

</Note>

I then tested Docker to make sure it was working.

```sh
docker run hello-world
```

## Install Node.js

I install Node.js using [NVM](https://github.com/nvm-sh/nvm) so I can easily switch between versions.

<Note>

Always verify anything you pipe into your shell. This is the command from the NVM website.

</Note>

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

I then installed the latest LTS version of Node.js.

```sh
nvm install --lts
nvm use --lts
```

I prefer using [pnpm](https://pnpm.io/) as my package manager, so I installed that as well.

```sh
npm install -g pnpm
```

I typically don't alias `pnpm` to `npm` because I often need to work with `npm` for some set of open source projects.

## Install VSCode

I don't install on the VM, but I use the [remote tooling](https://code.visualstudio.com/docs/remote/ssh) on my local machine. This allows me to connect to the VM and use VSCode as if it were running locally. Latency isn't an issue as it is on my local network.

## Conclusion

This is a basic setup for a development environment on Debian. Saving this for myself more than anyone else! I hope it helps you too.
