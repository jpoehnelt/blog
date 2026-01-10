---
title: Microservice Logging with Openresty and BigQuery
description: Log microservice usage and bytes sent directly to Google BigQuery using OpenResty and Lua for accurate billing and analytics.
pubDate: "2017-04-21"
tags:
  - code
  - bigquery
  - google
  - descartes labs
  - logging
  - openresty
  - nginx
---

<script>
  import Snippet from "$lib/components/content/Snippet.svelte";
  import Image from '$lib/components/content/Image.svelte';
</script>

Here at Descartes Labs, we have been using the microservice architecture in building out our platform. If you are unfamiliar with microservices, they are a collection of independent services often communicating over HTTP or GRPC. Check out Martin Fowler’s 2014 [article](https://martinfowler.com/articles/microservices.html) for more information.

<Image src="openresty-logging/microservices.png" alt="Microservices at Descartes Labs" />

## Logging bytes sent

The key requirement of our logging, specifically usage logging, is to capture the number of bytes sent to the user since we are providing API access to our entire corpus of satellite imagery. This most closely matches our costs, such as egress, and can give us an indication of the underlying value provided to the customer.

The problem in NGINX and with chunked responses from upstream services is that getting the `$bytes_sent` from NGINX can only occur in the logging phase. Alternatively, the `body_filter_by_lua*` could be used to track the bytes from each chunk, but that is definitely a second option due to the added complexity.

The first thing to try, which DOES NOT WORK, is the following:

<Snippet src="./snippets/microservice-usage-logginging-with-openresty-and-google-bigquery/example.txt" />

There are two issues with the above. The critical issue is that the Lua cosocket for nonblocking IO is not available in the logging phase. The second is we want to do this in batch.

## Using a detached thread

The solution we have implemented involves using a detached thread on each NGINX worker and a shared thread safe buffer.

<Image src="openresty-logging/architecture-diagram.png" alt="OpenResty architecture" />

The NGINX Lua blocks look like the following.

<Snippet src="./snippets/microservice-usage-logginging-with-openresty-and-google-bigquery/example.conf" />

## Checking the buffer

The ngx.timer.at mechanism makes it trivial to watch this buffer. The only trick is that each worker will be watching the buffer, so some randomness should be added.

<Snippet src="./snippets/microservice-usage-logginging-with-openresty-and-google-bigquery/example-1.conf" />

## Using BigQuery

As a primarily Google Cloud Platform customer, we have a custom Lua client for many of the Google Cloud APIs, such as Cloud Storage, BigQuery, and Stackdriver. For this particular use case, we are trying out BigQuery. Our query looks something like this:

<Snippet src="./snippets/microservice-usage-logginging-with-openresty-and-google-bigquery/example.sql" />

Which outputs this table:

<Image src="openresty-logging/bigquery-table-output.png" alt="Google BigQuery Results Using Vegeta for Load Testing" />

Having reached this point, it is trivial to add a few fields to group by, such as customer or service, and provide billing with varying windows and granularity.
