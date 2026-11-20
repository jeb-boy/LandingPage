# Entity-Relationship Diagram (implemented database)

```mermaid
erDiagram
    users ||--o| user_settings : has
    users ||--o{ password_reset_tokens : requests
    users ||--o{ announcements : creates

    users {
        uuid id PK
        varchar full_name
        varchar email UK
        text password_hash
        varchar role
        varchar student_number
        varchar program
        varchar year_level
        text profile_photo_url
        timestamptz created_at
        timestamptz updated_at
    }

    user_settings {
        uuid user_id PK, FK
        boolean email_updates
        boolean notifications
        varchar theme
        timestamptz updated_at
    }

    password_reset_tokens {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz used_at
        timestamptz created_at
    }

    announcements {
        uuid id PK
        varchar title
        varchar category
        text summary
        text content
        text image_url
        timestamptz published_at
        boolean is_published
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
```

## Notes
- Roles: `student`, `faculty`, `admin`.
- Announcements are stored in PostgreSQL (no longer mock arrays).
- College profile, module catalog, and featured cards remain static configuration data suitable for a CMS config table in a later iteration.
