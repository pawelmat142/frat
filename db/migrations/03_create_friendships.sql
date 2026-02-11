/** Created by Pawel Malek **/

-- Friendships table for managing friend connections between users
CREATE TABLE jh_friendships (
    friendship_id BIGSERIAL PRIMARY KEY,
    requester_uid VARCHAR(255) NOT NULL,
    addressee_uid VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_friendship_pair UNIQUE (requester_uid, addressee_uid),
    CONSTRAINT chk_no_self_friendship CHECK (requester_uid <> addressee_uid)
);

COMMENT ON TABLE jh_friendships IS 'Friend connections between users';
COMMENT ON COLUMN jh_friendships.requester_uid IS 'UID of the user who sent the invitation';
COMMENT ON COLUMN jh_friendships.addressee_uid IS 'UID of the user who received the invitation';
COMMENT ON COLUMN jh_friendships.status IS 'Friendship status: PENDING, ACCEPTED, REJECTED';

-- Index for querying friendships by requester (outgoing)
CREATE INDEX idx_friendships_requester_status ON jh_friendships (requester_uid, status);

-- Index for querying friendships by addressee (incoming)
CREATE INDEX idx_friendships_addressee_status ON jh_friendships (addressee_uid, status);

-- Composite index for mutual friends CTE query performance
CREATE INDEX idx_friendships_accepted_both ON jh_friendships (status, requester_uid, addressee_uid)
    WHERE status = 'ACCEPTED';
