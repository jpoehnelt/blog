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