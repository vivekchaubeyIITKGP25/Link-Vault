# Database Schema (MongoDB / Mongoose)

This project uses MongoDB with Mongoose models defined in `backend/models/User.js` and `backend/models/Content.js`.

## Collections

- `users` (from model `User`)
- `contents` (from model `Content`)

## `users` Collection

| Field | Type | Required | Default | Constraints / Notes |
| --- | --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Auto | MongoDB primary key |
| `name` | String | Yes | None | Trimmed |
| `email` | String | Yes | None | Unique, lowercased, trimmed |
| `passwordHash` | String | Yes | None | Hashed password (bcrypt in controller) |
| `resetTokenHash` | String | No | `null` | Password reset token hash |
| `resetTokenExpires` | Date | No | `null` | Password reset token expiry |
| `createdAt` | Date | No | `Date.now` | Creation time |

Indexes:

- Unique index on `email`

## `contents` Collection

| Field | Type | Required | Default | Constraints / Notes |
| --- | --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Auto | MongoDB primary key |
| `uniqueId` | String | Yes | None | Unique share identifier, indexed |
| `owner` | ObjectId | Yes | None | Ref: `User`, indexed |
| `type` | String | Yes | None | Enum: `text`, `file` |
| `textContent` | String | No | `null` | Used when `type = text` |
| `fileName` | String | No | `null` | Used when `type = file` |
| `fileUrl` | String | No | `null` | Public URL for file |
| `filePath` | String | No | `null` | Local storage path |
| `fileSize` | Number | No | `null` | Size in bytes |
| `mimeType` | String | No | `null` | File MIME type |
| `password` | String | No | `null` | Optional content password |
| `oneTimeView` | Boolean | No | `false` | One-time viewing mode |
| `viewCount` | Number | No | `0` | Incremented on each successful access |
| `maxViews` | Number | No | `null` | Optional view cap |
| `expiresAt` | Date | Yes | None | Expiry timestamp, indexed |
| `createdAt` | Date | No | `Date.now` | Creation time |
| `hasBeenViewed` | Boolean | No | `false` | Legacy/summary one-time flag |
| `ownerPreviewUsed` | Boolean | No | `false` | Owner one-time preview consumed |
| `recipientViewUsed` | Boolean | No | `false` | Recipient one-time view consumed |

Indexes:

- Unique index on `uniqueId`
- Index on `owner`
- Index on `expiresAt` (regular index, not a TTL index)

## Relationships

- `contents.owner` -> `users._id` (many contents belong to one user)

## Runtime Constraints (Controller-Level)

From `backend/controllers/contentController.js`:

- Upload must include exactly one payload type: text or file.
- `expiryDateTime` must be a valid future date if provided.
- If `expiryDateTime` is absent, `expiresAt` is computed from `expiryMinutes` or default config.
- If `oneTimeView` is enabled, access is tracked separately for owner and recipient.
- If `maxViews` is set and reached, content becomes inaccessible.
- Expired content is removed by access checks and by periodic cleanup (`backend/scripts/cleanup.js`).

Note: content `password` is currently stored as plain text in the `contents` collection.
