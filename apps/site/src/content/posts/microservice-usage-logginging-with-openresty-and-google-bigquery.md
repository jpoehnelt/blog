---
title: Microservice Usage Logging with Openresty and Google BigQuery
description: Using Lua to log requests to BigQuery.
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
  import img_openresty_logging_microservices_png from "$lib/images/openresty-logging/microservices.png?enhanced";
  import img_openresty_logging_architecture_diagram_png from "$lib/images/openresty-logging/architecture-diagram.png?enhanced";
  import img_openresty_logging_bigquery_table_output_png from "$lib/images/openresty-logging/bigquery-table-output.png?enhanced";
  import Image from '$lib/components/content/Image.svelte';
</script>

Here at Descartes Labs, we have been using the microservice architecture in building out our platform. If you are unfamiliar with microservices, they are a collection of independent services often communicating over HTTP or GRPC. Check out Martin Fowler’s 2014 [article](https://martinfowler.com/articles/microservices.html) for more information.

<Image src={img_openresty_logging_microservices_png} alt="Microservices at Descartes Labs" />

## Logging bytes sent

The key requirement of our logging, specifically usage logging, is to capture the number of bytes sent to the user since we are providing API access to our entire corpus of satellite imagery. This most closely matches our costs, such as egress, and can give us an indication of the underlying value provided to the customer.

The problem in NGINX and with chunked responses from upstream services is that getting the `$bytes_sent` from NGINX can only occur in the logging phase. Alternatively, the `body_filter_by_lua*` could be used to track the bytes from each chunk, but that is definitely a second option due to the added complexity.

The first thing to try, which DOES NOT WORK, is the following:

```
log_by_lua_block {
    local payload = {
        bytes = tonumber(ngx.var.bytes_sent),
        status = tonumber(ngx.var.status),
        timestamp = ngx.now()
        ... -- more values
    }
    -- post payload to favorite backend for timeseries analysis
}
```

There are two issues with the above. The critical issue is that the Lua cosocket for nonblocking IO is not available in the logging phase. The second is we want to do this in batch.

## Using a detached thread

The solution we have implemented involves using a detached thread on each NGINX worker and a shared thread safe buffer.

<Image src={img_openresty_logging_architecture_diagram_png} alt="OpenResty architecture" />

The NGINX Lua blocks look like the following.

```nginx
lua_shared_dict usage_logging 10m;

init_worker_by_lua_block {
    local Logging = require "descarteslabs.logging"
    l = Logging.new()
    l:watch(ngx.shared.usage_logging)
}

location = /test {
    proxy_pass service;
    log_by_lua_block {
        local payload = {
            bytes = tonumber(ngx.var.bytes_sent),
            status = tonumber(ngx.var.status),
            timestamp = ngx.now()
            ... -- more values
        }
        local Logging = require "descarteslabs.logging"
        l = Logging.save(ngx.shared.usage_logging, payload)
    }
}
```

## Checking the buffer

The ngx.timer.at mechanism makes it trivial to watch this buffer. The only trick is that each worker will be watching the buffer, so some randomness should be added.

```nginx
local check_function
check_function = function(premature)
    if not premature then
        while true do
            local requests = self:get(size)
            pcall(_M.save, self, rows)

            if #rows < size then
                break
            end
        end

        local ok, err = ngx.timer.at(delay(), check_function)
        if not ok then
            log(ERR, "failed to create timer: ", err)
            return
        end
    end
end
```

## Using BigQuery

As a primarily Google Cloud Platform customer, we have a custom Lua client for many of the Google Cloud APIs, such as Cloud Storage, BigQuery, and Stackdriver. For this particular use case, we are trying out BigQuery. Our query looks something like this:

```sql
SELECT
  COUNT(*) as calls,
  SUM(bytes) as bytes,
  DATETIME_TRUNC(DATETIME(timestamp), `second` ) as w
FROM `project.dataset.table`
WHERE
  status=200
GROUP BY
  w
ORDER BY
  w desc
LIMIT 100
```

Which outputs this table:

<Image src={img_openresty_logging_bigquery_table_output_png} alt="Google BigQuery Results Using Vegeta for Load Testing" />

Having reached this point, it is trivial to add a few fields to group by, such as customer or service, and provide billing with varying windows and granularity.
