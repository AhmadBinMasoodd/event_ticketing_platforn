# 🚀 MongoDB Aggregation Pipeline Cheat Sheet
### Event Ticketing Platform (Backend Developer Guide)

> A practical cheat sheet focused on the aggregations used in the Event Ticketing Platform.

---

# 📌 Aggregation Flow

Think of Aggregation as a pipeline.

```
Collection
    │
    ▼
$match
    │
    ▼
$lookup
    │
    ▼
$unwind
    │
    ▼
$group
    │
    ▼
$project
    │
    ▼
$sort
    │
    ▼
$skip
    │
    ▼
$limit
```

---

# 1️⃣ $match (WHERE)

Filters documents.

```js
{
  $match: {
    status: "paid"
  }
}
```

Equivalent SQL

```sql
SELECT *
FROM orders
WHERE status='paid'
```

### Project Example

```js
Order.aggregate([
    {
        $match: {
            status: OrderStatus.PAID
        }
    }
])
```

---

# 2️⃣ $project (SELECT)

Choose required fields.

```js
{
    $project:{
        amount:1,
        status:1,
        eventId:1
    }
}
```

Hide fields

```js
{
    $project:{
        __v:0
    }
}
```

---

# 3️⃣ $group (GROUP BY)

Most important stage.

### Count

```js
{
    $group:{
        _id:null,
        totalOrders:{
            $sum:1
        }
    }
}
```

### Sum

```js
{
    $group:{
        _id:null,
        revenue:{
            $sum:"$amount"
        }
    }
}
```

### Average

```js
{
    $group:{
        _id:null,
        average:{
            $avg:"$amount"
        }
    }
}
```

---

# 4️⃣ $lookup (JOIN)

Join collections.

Order → User

```js
{
    $lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"customer"
    }
}
```

Order → Event

```js
{
    $lookup:{
        from:"events",
        localField:"eventId",
        foreignField:"_id",
        as:"event"
    }
}
```

Ticket → TicketType

```js
{
    $lookup:{
        from:"tickettypes",
        localField:"ticketType",
        foreignField:"_id",
        as:"ticketType"
    }
}
```

---

# 5️⃣ $unwind

Converts array into object.

Before

```json
customer:[
    {
        "name":"Ahmad"
    }
]
```

After

```json
customer:{
    "name":"Ahmad"
}
```

```js
{
    $unwind:"$customer"
}
```

---

# 6️⃣ $sort

Newest First

```js
{
    $sort:{
        createdAt:-1
    }
}
```

Oldest First

```js
{
    $sort:{
        createdAt:1
    }
}
```

---

# 7️⃣ $limit

```js
{
    $limit:10
}
```

---

# 8️⃣ $skip

Pagination

```js
{
    $skip:20
}
```

Formula

```
skip=(page-1)*limit
```

---

# 9️⃣ $count

```js
[
    {
        $match:{
            status:"paid"
        }
    },
    {
        $count:"paidOrders"
    }
]
```

---

# 🔟 $addFields

Add computed field.

```js
{
    $addFields:{
        tax:100
    }
}
```

---

# 1️⃣1️⃣ $facet ⭐⭐⭐⭐⭐

Best for dashboards.

```js
[
    {
        $facet:{
            paidOrders:[
                {
                    $match:{
                        status:"paid"
                    }
                },
                {
                    $count:"count"
                }
            ],

            pendingOrders:[
                {
                    $match:{
                        status:"pending"
                    }
                },
                {
                    $count:"count"
                }
            ],

            revenue:[
                {
                    $group:{
                        _id:null,
                        revenue:{
                            $sum:"$amount"
                        }
                    }
                }
            ]
        }
    }
]
```

---

# 1️⃣2️⃣ $sum

```js
{
    $sum:"$amount"
}
```

Count

```js
{
    $sum:1
}
```

---

# 1️⃣3️⃣ $avg

```js
{
    $avg:"$purchasePrice"
}
```

---

# 1️⃣4️⃣ $min

```js
{
    $min:"$purchasePrice"
}
```

---

# 1️⃣5️⃣ $max

```js
{
    $max:"$purchasePrice"
}
```

---

# 1️⃣6️⃣ $push

Collect all documents.

```js
{
    $group:{
        _id:"$eventId",
        orders:{
            $push:"$$ROOT"
        }
    }
}
```

---

# 1️⃣7️⃣ $first

```js
{
    $first:"$amount"
}
```

---

# 1️⃣8️⃣ $last

```js
{
    $last:"$amount"
}
```

---

# 📊 Event Ticketing Examples

---

## Total Revenue

```js
Order.aggregate([
    {
        $match:{
            status:OrderStatus.PAID
        }
    },
    {
        $group:{
            _id:null,
            totalRevenue:{
                $sum:"$amount"
            }
        }
    }
])
```

---

## Paid Orders

```js
Order.aggregate([
    {
        $match:{
            status:OrderStatus.PAID
        }
    },
    {
        $count:"paidOrders"
    }
])
```

---

## Pending Orders

```js
Order.aggregate([
    {
        $match:{
            status:OrderStatus.PENDING
        }
    },
    {
        $count:"pendingOrders"
    }
])
```

---

## Tickets Sold Per Event

```js
Ticket.aggregate([
    {
        $group:{
            _id:"$event",
            ticketsSold:{
                $sum:1
            }
        }
    }
])
```

---

## Revenue Per Event

```js
Order.aggregate([
    {
        $match:{
            status:OrderStatus.PAID
        }
    },
    {
        $group:{
            _id:"$eventId",
            revenue:{
                $sum:"$amount"
            }
        }
    }
])
```

---

## Top Selling Event

```js
Ticket.aggregate([
    {
        $group:{
            _id:"$event",
            sold:{
                $sum:1
            }
        }
    },
    {
        $sort:{
            sold:-1
        }
    },
    {
        $limit:1
    }
])
```

---

## Monthly Revenue

```js
Order.aggregate([
    {
        $match:{
            status:OrderStatus.PAID
        }
    },
    {
        $group:{
            _id:{
                month:{
                    $month:"$paidAt"
                }
            },
            revenue:{
                $sum:"$amount"
            }
        }
    },
    {
        $sort:{
            "_id.month":1
        }
    }
])
```

---

## Recent Orders

```js
Order.aggregate([
    {
        $sort:{
            createdAt:-1
        }
    },
    {
        $limit:5
    }
])
```

---

# 🎯 Dashboard Metrics

## Customer Dashboard

- Total Tickets
- Upcoming Events
- Past Events
- Pending Orders
- Paid Orders

---

## Organizer Dashboard

- Total Events
- Published Events
- Draft Events
- Upcoming Events
- Past Events
- Tickets Sold
- Active Tickets
- Used Tickets
- Cancelled Tickets
- Pending Orders
- Paid Orders
- Revenue

---

## Admin Dashboard (Future)

- Total Users
- Total Organizers
- Total Events
- Total Orders
- Total Tickets
- Revenue
- Monthly Growth
- Top Events

---

# 💡 Aggregation Order to Remember

```
$match

↓

$lookup

↓

$unwind

↓

$group

↓

$project

↓

$sort

↓

$skip

↓

$limit
```

---

# ⭐ 80/20 Rule

Master these six operators first:

- ✅ $match
- ✅ $group
- ✅ $lookup
- ✅ $project
- ✅ $sort
- ✅ $facet

These are enough to solve **80–90% of backend interview and real-world dashboard problems.**