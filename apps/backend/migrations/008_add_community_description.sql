ALTER TABLE communities 
ADD COLUMN description VARCHAR(500) NOT NULL;

ALTER TABLE communities
RENAME COLUMN community_name TO name;
