---
type: BigQuery Dataset
title: POS
description: Square ticket and customer exports loaded nightly into BigQuery.
resource: https://console.cloud.google.com/bigquery?p=riverbend&d=pos
tags: [pos, square]
timestamp: 2026-05-28T00:00:00Z
---

Nightly ETL lands two curated tables: [orders](/data/warehouse/tables/orders.md) and [customers](/data/warehouse/tables/customers.md).

Menu launches (like [espresso tonic](/operations/kitchen/recipes/espresso-tonic.md)) show up as new `sku` values in orders within 24 hours.
