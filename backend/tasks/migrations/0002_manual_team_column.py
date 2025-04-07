from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            """
            DO $$
            BEGIN
                -- Create team table if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_name = 'tasks_team'
                ) THEN
                    CREATE TABLE tasks_team (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                END IF;

                -- Create team_members table if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_name = 'tasks_team_members'
                ) THEN
                    CREATE TABLE tasks_team_members (
                        id SERIAL PRIMARY KEY,
                        team_id INTEGER REFERENCES tasks_team(id) ON DELETE CASCADE,
                        user_id INTEGER REFERENCES users_user(id) ON DELETE CASCADE,
                        UNIQUE(team_id, user_id)
                    );
                END IF;

                -- Add team_id column to tasks_task if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'tasks_task'
                    AND column_name = 'team_id'
                ) THEN
                    ALTER TABLE tasks_task ADD COLUMN team_id integer;
                    ALTER TABLE tasks_task ADD CONSTRAINT tasks_task_team_id_fkey
                        FOREIGN KEY (team_id) REFERENCES tasks_team(id)
                        ON DELETE SET NULL;
                END IF;
            END $$;
            """,
            """
            DROP TABLE IF EXISTS tasks_team_members;
            DROP TABLE IF EXISTS tasks_team CASCADE;
            ALTER TABLE tasks_task DROP COLUMN IF EXISTS team_id;
            """
        ),
    ] 