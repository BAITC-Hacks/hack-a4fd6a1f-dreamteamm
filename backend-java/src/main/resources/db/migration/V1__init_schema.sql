-- Track B Flyway Schema: Initial schema creation matching D1 / PostgreSQL specification

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    tags VARCHAR(500) NOT NULL DEFAULT '',
    readiness_score INT NOT NULL DEFAULT 0,
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT NOT NULL,
    attachment_key VARCHAR(255),
    attachment_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_contact VARCHAR(255) NOT NULL,
    pitch TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attachment_key VARCHAR(255),
    attachment_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    task_id INT REFERENCES tasks(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL DEFAULT 'platform',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_proposals_task_id ON proposals(task_id);
