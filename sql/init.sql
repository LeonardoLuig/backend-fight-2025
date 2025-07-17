CREATE TYPE PROCESSOR_TYPE_ENUM AS ENUM ('default', 'fallback');

CREATE UNLOGGED TABLE payments (
    correlationId UUID PRIMARY KEY,
    amount DECIMAL NOT NULL,
    requestedAt TIMESTAMP NOT NULL,
    processorType PROCESSOR_TYPE_ENUM NOT NULL
);

CREATE INDEX paymentsRequestedAt ON payments (requestedAt);