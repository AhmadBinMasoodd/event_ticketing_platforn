export const CacheKeys = {
    // Events
    myEvents(userId, query) {
        return `my-events:${userId}:page:${query.page || 1}:limit:${query.limit || 10}:search:${query.search || ""}:sort:${query.sort || "createdAt"}:order:${query.order || "asc"}`;
    },

    myEventsPattern(userId) {
        return `my-events:${userId}:*`;
    },

    event(eventId) {
        return `event:${eventId}`;
    },

    eventPattern(eventId) {
        return `event:${eventId}*`;
    },

    // Tickets
    myTickets(userId, query) {
        return `my-tickets:${userId}:page:${query.page || 1}:limit:${query.limit || 10}:status:${query.status || "all"}:sort:${query.sort || "createdAt"}:order:${query.order || "asc"}`;
    },

    ticket(ticketId) {
        return `ticket:${ticketId}`;
    },

    ticketPattern(userId) {
        return `my-tickets:${userId}:*`;
    },

    ticketByIdPattern(ticketId) {
        return `ticket:${ticketId}*`;
    },

    eventTickets(eventId, query) {
        return `event-tickets:${eventId}:page:${query.page || 1}:limit:${query.limit || 10}:status:${query.status || "all"}:sort:${query.sort || "createdAt"}:order:${query.order || "asc"}`;
    },

    eventTicketsPattern(eventId) {
        return `event-tickets:${eventId}:*`;
    },

    // Orders
    orders(userId, query) {
        return `orders:${userId}:page:${query.page || 1}:limit:${query.limit || 10}:status:${query.status || "all"}:search:${query.search || ""}:sort:${query.sort || "createdAt"}:order:${query.order || "asc"}`;
    },

    orderPattern(userId) {
        return `orders:${userId}:*`;
    },

    // Dashboards
    organizerDashboard(userId) {
        return `dashboard:organizer:${userId}`;
    },

    organizerDashboardPattern(userId) {
        return `dashboard:organizer:${userId}`;
    },

    customerDashboard(userId) {
        return `dashboard:customer:${userId}`;
    },

    customerDashboardPattern(userId) {
        return `dashboard:customer:${userId}`;
    },

    //ticket types
    ticketTypes(eventId) {
        return `ticket-types:${eventId}`;
    },

    ticketTypesPattern(eventId) {
        return `ticket-types:${eventId}*`;
    },
    // Public Events
    publishedEvents(query) {
        return `published-events:page:${query.page || 1}:limit:${query.limit || 10}:search:${query.search || ""}:city:${query.city || ""}:status:${query.status || ""}:sort:${query.sort || "eventDate"}:order:${query.order || "asc"}`;
    },

    publishedEventsPattern() {
        return `published-events:*`;
    },
};
