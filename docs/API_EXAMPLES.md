# API Examples

## Create article
POST `/api/articles`

```json
{
  "title": "Judul artikel",
  "excerpt": "Ringkasan",
  "content": "Isi artikel",
  "authorId": "USER_ID",
  "status": "DRAFT"
}
```

## Create issue
POST `/api/issues`

```json
{
  "title": "Judul isu",
  "summary": "Ringkasan isu",
  "status": "REPORTED",
  "verificationStatus": "IN_REVIEW"
}
```

For temporary development testing, send an `x-user-role` header with an allowed role.
