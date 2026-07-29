export const CacheKeys = {
    myEvents(userId, query) {
        return `my-events:${userId}:page:${query.page || 1}:limit:${query.limit || 10}:search:${query.search || ""}:sort:${query.sort || "createdAt"}:order:${query.order || "asc"}`;
    },

    event(eventId) {
        return `event:${eventId}`;
    },

    myTickets(userId, query) {
        return `my-tickets:${userId}:page:${query.page || 1}:limit:${query.limit || 10}`;
    },

    organizerDashboard(userId) {
        return `dashboard:organizer:${userId}`;
    },

    customerDashboard(userId) {
        return `dashboard:customer:${userId}`;
    },

    publishedEvents(query) {
        return `published-events:page:${query.page || 1}:limit:${query.limit || 10}:search:${query.search || ""}:city:${query.city || ""}:status:${query.status || ""}:sort:${query.sort || "eventDate"}:order:${query.order || "asc"}`;
    }
};
