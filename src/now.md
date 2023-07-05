---
layout: base
title: Now
---

<h2 class="m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    <div class="ml-1">Artists</div>
</h2>
<div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
    {% for artist in artists %}
    <a href="{{ artist.url }}" title="{{ artist.name | escape }}">
        <div class="relative block">
        <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-600 hover:border-purple-500 bg-cover-gradient dark:border-purple-400 dark:hover:border-purple-500"></div>
        <div class="absolute left-1 bottom-2 drop-shadow-md">
            <div class="px-1 text-xs font-bold text-white">{{ artist.name }}</div>
            <div class="px-1 text-xs text-white">
            {{ artist.playcount }} plays
            </div>
        </div>
        </div>
    </a>
    {% endfor %}
</div>

<h2 class="m-0 text-xl flex flex-row items-center font-black leading-tight tracking-normal dark:text-gray-200 md:text-2xl mt-8 mb-4">
    <div class="ml-1">Albums</div>
</h2>
<div class="grid grid-cols-2 gap-2 md:grid-cols-4 not-prose">
    {% for album in albums %}
    <a href="{{ album.url }}" title="{{ album.name | escape }}">
        <div class="relative block">
        <div class="absolute left-0 top-0 h-full w-full rounded-lg border border-purple-600 hover:border-purple-500 bg-cover-gradient dark:border-purple-400 dark:hover:border-purple-500"></div>
        <div class="absolute left-1 bottom-2 drop-shadow-md">
            <div class="px-1 text-xs font-bold text-white">{{ album.name }}</div>
            <div class="px-1 text-xs text-white">
            {{ album.artist.name }}
            </div>
        </div>
        </div>
    </a>
    {% endfor %}
</div>
