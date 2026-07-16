---
type: BigQuery Table
title: Orders
description: One row per completed Square ticket.
resource: https://console.cloud.google.com/bigquery?p=riverbend&d=pos&t=orders
tags: [pos, orders]
timestamp: 2026-07-01T00:00:00Z
---

# Schema

| Column | Type | Description |
| --- | --- | --- |
| `order_id` | STRING | Square ticket id. |
| `customer_id` | STRING | FK to [customers](/data/warehouse/tables/customers.md). |
| `sku` | STRING | Line-item SKU (e.g. `espresso-tonic`). |
| `total_usd` | NUMERIC | Ticket total in USD. |

Part of the [POS dataset](/data/warehouse/datasets/pos.md).

See also a [missing concept](/data/warehouse/tables/does-not-exist.md).
