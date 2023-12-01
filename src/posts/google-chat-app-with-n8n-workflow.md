---
layout: post
title: Building a Google Chat App with n8n
excerpt: I created a n8n workflow to build a Google Chat App that translates messages using the Cloud Translation API.
tags:
    - post
    - code
    - google
    - google chat
    - chat app
    - n8n
    - workflow
    - google translate
date: '2023-12-01T00:00:00.000Z'
hideToc: true
---

This afternoon I updated my homelab server from Bullseye to Bookworm and the lates version of Proxmox. This went off without much excitement and I decided to install [n8n](https://n8n.io/) on the server. I've always enjoyed mashing these tools together to do something useful and I decided to build a Google Chat App in the visual workflow editor.

## The Workflow

The workflow is pretty simple, but also incomplete.

1. The workflow starts with a Webhook Node that listens for an event from Google Chat.
2. Switch on message type.
3. Parse the slash command for the target language and the message to translate.
4. Use the Cloud Translation API to translate the message to the target language.
5. Send the translated message back to the user via the Webhook Response Node.

{% image src="src/images/n8n-google-chat-app-workflow.png", alt="n8n workflow for a Google Chat App", class_="" %}

You can download the workflow source from: https://gist.github.com/jpoehnelt/b8327c11c77a3228e9f2ef1727d48a8f

Here are the settings for the Chat node.

{% image src="src/images/n8n-chat-app-node.png", alt="n8n Google Chat App node settings", class_="" %}

The finally node in the slash command path responds with JSON matching the following, which is basically a concatenation of the [Cloud Translation API response](https://cloud.google.com/translate/docs/reference/rest/v3/TranslateTextResponse#Translation):

```js
{% raw %}{ "text":  "Translates to: '{{ $json.translatedText }}' from {{ $json.detectedSourceLanguage }}."}{% endraw %}
```

## Demo

The app is obviously not very refined, but it works! :tada:

{% image src="src/images/n8n-google-chat-demo.gif", alt="n8n demo for a Google Chat App", class_="" %}

## Chat App config

There isn't much exciting about the Chat App config.

{% image src="src/images/n8n-chat-app-config-basics.png", alt="Chat App config basics" %}

The Google Chat App interactivity is configured with a slash command that sends a POST request to the webhook URL. The URL is the n8n webhook URL. The slash command is `/translate` and the parameters are `language` and `text`, the only code I had to write!

{% image src="src/images/n8n-chat-app-config-interactivity.png", alt="Chat App config interactivity" %}

## TODOs

There are a few things I didn't do:

- Use cards, dialogs, etc
- Properly respond to the slash command so it is not visible in the chat
- Validate the token
- Handle errors

## Resources

- [n8n.io](https://n8n.io/)
- [Google Chat n8n Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlechat/)
- [Google Chat API](https://developers.google.com/chat)
- [Cloud Translation API](https://cloud.google.com/translate)
