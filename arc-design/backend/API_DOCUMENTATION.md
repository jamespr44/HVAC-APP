# LOADS Heat Load Calculation Platform - API Documentation

## Base URL

```
https://api.loads.hvac.example.com
```

All endpoints require authentication via Bearer token in the `Authorization` header.

## Authentication

All API requests must include a valid JWT Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained through authentication endpoints (managed separately).

## Response Format

All responses are JSON. Successful responses return:

```json
{
  "data": {...} or [...]
}
```

Error responses return:

```json
{
  "error": "Human-readable error message",
  "details": [
    { "field": "fieldName", "message": "Specific validation error" }
  ],
  "statusCode": 400
}
```

## Error Codes

- **400 Bad Request** - Validation failure or invalid request
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Conflict (e.g., concurrent edit)
- **500 Internal Server Error** - Unexpected server error

---

## Projects

### List Projects

```
GET /api/projects
```

Returns all projects for the authenticated organization.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orgId": "...",
    "name": "ABC Building HVAC Design",
    "address": "123 Main St, Sydney NSW 2000",
    "climateLocation": "Sydney",
    "buildingClass": "A",
    "status": "active",
    "createdBy": "...",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
]
```

---

## Equipment

### List Equipment in Project

```
GET /api/projects/{projectId}/equipment
```

Returns all equipment items in a project.

**Parameters:**
- `projectId` (path) - UUID of the project

**Response:**
```json
[
  {
    "id": "eq-001",
    "projectId": "proj-001",
    "orgId": "org-001",
    "zoneId": "zone-001",
    "equipmentType": "ahu",
    "name": "Main AHU",
    "model": "VAV-2500",
    "manufacturer": "HVAC Corp",
    "airFlowRateM3Sec": 2.5,
    "sensibleCapacityW": 7000,
    "latentCapacityW": 3000,
    "totalCapacityW": 10000,
    "powerInputW": 2500,
    "copOrEfficiency": 4.0,
    "refrigerantType": "R410A",
    "refrigerantChargeKg": 3.0,
    "inOperation": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
]
```

### Get Equipment by ID

```
GET /api/projects/{projectId}/equipment/{equipmentId}
```

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment

**Response:** Single equipment object (see List Equipment response)

### Create Equipment

```
POST /api/projects/{projectId}/equipment
```

Create a new equipment item.

**Parameters:**
- `projectId` (path) - UUID of the project

**Request Body:**
```json
{
  "equipmentType": "ahu",
  "name": "Main AHU",
  "model": "VAV-2500",
  "manufacturer": "HVAC Corp",
  "airFlowRateM3Sec": 2.5,
  "sensibleCapacityW": 7000,
  "latentCapacityW": 3000,
  "powerInputW": 2500,
  "copOrEfficiency": 4.0,
  "refrigerantType": "R410A",
  "refrigerantChargeKg": 3.0,
  "inOperation": true,
  "zoneId": "zone-001"
}
```

**Validation Rules:**
- `equipmentType`: Required. One of: ahu, fcu, fan, pump
- `name`: Required. Non-empty string
- `airFlowRateM3Sec`: Required for ahu/fcu/fan. Must be positive
- `copOrEfficiency`: If provided, must be between 0.5 and 10
- `refrigerantType`: If provided, must be one of: R410A, R32, R454B, R290
- `refrigerantChargeKg`: If provided, warns if < 0.5 or > 50 kg

**Response:** Created equipment object (201 Created)

**Example Error Response:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "name", "message": "Equipment name is required" },
    { "field": "airFlowRateM3Sec", "message": "Air flow rate must be positive" }
  ],
  "statusCode": 400
}
```

### Update Equipment

```
PATCH /api/projects/{projectId}/equipment/{equipmentId}
```

Update existing equipment item. Only provide fields to update.

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment

**Request Body:** (partial)
```json
{
  "sensibleCapacityW": 8000,
  "inOperation": false
}
```

**Response:** Updated equipment object

**Automatic Change Tracking:**
- Changes are logged in the `zone_changes` table
- Change summary includes before/after values
- Used for version history and audit trail

### Delete Equipment

```
DELETE /api/projects/{projectId}/equipment/{equipmentId}
```

Delete an equipment item permanently.

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment

**Response:** 204 No Content (success)

---

## Equipment Maintenance

### List Maintenance Records

```
GET /api/projects/{projectId}/equipment/{equipmentId}/maintenance
```

List all maintenance records for an equipment item, ordered by next due date.

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment

**Response:**
```json
[
  {
    "id": "maint-001",
    "equipmentId": "eq-001",
    "orgId": "org-001",
    "maintenanceType": "filter_change",
    "scheduledDate": "2024-03-15T00:00:00Z",
    "description": "Change main filter and check pressure drop",
    "lastCompletedDate": "2024-01-15T10:30:00Z",
    "nextDueDate": "2024-04-15T00:00:00Z",
    "frequencyDays": 90,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
]
```

### Create Maintenance Record

```
POST /api/projects/{projectId}/equipment/{equipmentId}/maintenance
```

Create a new maintenance schedule for equipment.

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment

**Request Body:**
```json
{
  "maintenanceType": "filter_change",
  "scheduledDate": "2024-03-15",
  "frequencyDays": 90,
  "description": "Change main filter and check pressure drop"
}
```

**Validation Rules:**
- `maintenanceType`: Required. One of: filter_change, refrigerant_recharge, service, calibration
- `frequencyDays`: Required. Must be positive (days until next due date)

**Response:** Created maintenance record (201 Created)

### Mark Maintenance Complete

```
PATCH /api/projects/{projectId}/equipment/{equipmentId}/maintenance/{maintenanceId}/complete
```

Mark a maintenance task as completed and automatically schedule the next due date.

**Parameters:**
- `projectId` (path) - UUID of the project
- `equipmentId` (path) - UUID of the equipment
- `maintenanceId` (path) - UUID of the maintenance record

**Request Body:** Empty

**Response:**
```json
{
  "id": "maint-001",
  "equipmentId": "eq-001",
  "lastCompletedDate": "2024-03-15T14:22:00Z",
  "nextDueDate": "2024-06-13T00:00:00Z",
  "frequencyDays": 90
}
```

### Update Maintenance Record

```
PATCH /api/projects/{projectId}/equipment/{equipmentId}/maintenance/{maintenanceId}
```

Update an existing maintenance record.

**Request Body:** (partial)
```json
{
  "frequencyDays": 120,
  "description": "Updated description"
}
```

**Response:** Updated maintenance record

### Delete Maintenance Record

```
DELETE /api/projects/{projectId}/equipment/{equipmentId}/maintenance/{maintenanceId}
```

Delete a maintenance record.

**Response:** 204 No Content

---

## Version Control / Change History

### Get Version History for Project

```
GET /api/projects/{projectId}/versions?limit=100
```

Get all changes made to zones and equipment in a project, ordered by most recent first.

**Parameters:**
- `projectId` (path) - UUID of the project
- `limit` (query) - Maximum number of versions to return (default: 100)

**Response:**
```json
[
  {
    "id": "change-001",
    "zoneId": "zone-001",
    "orgId": "org-001",
    "userId": "user-001",
    "versionNumber": 5,
    "changedFields": {
      "areaM2": { "from": 100, "to": 120 },
      "occupants": { "from": 8, "to": 10 }
    },
    "reason": "Update zone",
    "createdAt": "2024-01-20T14:22:00Z"
  }
]
```

### Get Change History for Specific Zone

```
GET /api/projects/{projectId}/zones/{zoneId}/changes
```

Get all changes for a specific zone.

**Parameters:**
- `projectId` (path) - UUID of the project
- `zoneId` (path) - UUID of the zone

**Response:** Array of change records (see above)

### Compare Two Versions

```
GET /api/projects/{projectId}/versions/{versionA}/{versionB}
```

Get the differences between two versions.

**Parameters:**
- `projectId` (path) - UUID of the project
- `versionA` (path) - Version number (lower)
- `versionB` (path) - Version number (higher)

**Response:**
```json
{
  "from": {
    "versionNumber": 3,
    "changedFields": {...}
  },
  "to": {
    "versionNumber": 5,
    "changedFields": {...}
  },
  "diff": {
    "fieldsChanged": ["areaM2", "occupants"],
    "changes": {...}
  }
}
```

### Rollback to Version

```
POST /api/projects/{projectId}/versions/{versionNumber}/rollback
```

Rollback a zone to a previous version (restores the data as it was at that version).

**Parameters:**
- `projectId` (path) - UUID of the project
- `versionNumber` (path) - Version number to rollback to

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "message": "Rolled back to version 3"
}
```

**Notes:**
- Creates a new version record documenting the rollback
- Cannot rollback to versions marked as permanent
- Automatically notifies users of the rollback via change tracking

---

## Zones

### List Zones

```
GET /api/projects/{projectId}/zones
```

Returns all zones (rooms/spaces) in a project.

**Response:** Array of zone objects

### Get Zone

```
GET /api/projects/{projectId}/zones/{zoneId}
```

Get a specific zone.

**Response:** Single zone object

### Create Zone

```
POST /api/projects/{projectId}/zones
```

Create a new zone.

**Request Body:**
```json
{
  "floorId": "floor-001",
  "name": "Office A",
  "tag": "L1-01",
  "areaM2": 200,
  "heightM": 3.0,
  "orientation": "south",
  "wallUValue": 0.4,
  "windowAreaM2": 40,
  "windowUValue": 2.8,
  "windowSHGC": 0.6,
  "occupants": 8,
  "lightingWm2": 10,
  "equipmentWm2": 15
}
```

**Response:** Created zone object (201 Created)

### Update Zone

```
PUT /api/projects/{projectId}/zones/{zoneId}
```

Update a zone. Changes are automatically tracked.

**Request Body:** (partial)
```json
{
  "areaM2": 220,
  "occupants": 10
}
```

**Response:** Updated zone object

**Automatic Change Tracking:**
- All field changes are logged with before/after values
- Change reason can be provided in request body as `changeReason` field
- Version history is maintained automatically

### Delete Zone

```
DELETE /api/projects/{projectId}/zones/{zoneId}
```

Delete a zone.

**Response:** 204 No Content

---

## Heat Load Calculations

### Calculate Zone Loads

```
POST /api/projects/{projectId}/calculate
```

Recalculate heat loads for all zones in a project.

**Parameters:**
- `projectId` (path) - UUID of the project

**Request Body:** Empty (uses all zone data in project)

**Response:**
```json
{
  "results": [
    {
      "zoneId": "zone-001",
      "totalSensibleW": 3500,
      "totalLatentW": 1500,
      "totalCoolingW": 5000,
      "totalWithSafetyW": 5750,
      "breakdown": {
        "transmission": 25,
        "solar": 15,
        "internal": 45,
        "infiltration": 15
      },
      "supplyAirFlowLs": 185,
      "supplyAirTemp": 11.5
    }
  ]
}
```

**Notes:**
- Uses HAP-based calculation method
- Includes sensible, latent, and total cooling loads
- Applies 1.15 safety factor by default
- Calculates required supply air flow and temperature
- Results are stored in zone `calc_*` fields

---

## Error Handling

### Validation Error Example

```bash
curl -X POST https://api.loads.hvac.example.com/api/projects/proj-001/equipment \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentType": "ahu",
    "name": "",
    "copOrEfficiency": 15
  }'
```

**Response:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "name", "message": "Equipment name is required" },
    { "field": "copOrEfficiency", "message": "COP/Efficiency should be between 0.5 and 10" },
    { "field": "airFlowRateM3Sec", "message": "Air flow rate (m³/s) is required for air-based equipment" }
  ],
  "statusCode": 400
}
```

### Authorization Error Example

```bash
curl https://api.loads.hvac.example.com/api/projects
```

**Response:**
```json
{
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Rate Limiting

API requests are rate-limited to:
- 100 requests per minute per user
- 1000 requests per hour per organization

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1609459200
```

---

## Example Workflows

### Workflow 1: Create Project and Add Equipment

```bash
# 1. Create project
curl -X POST https://api.loads.hvac.example.com/api/projects \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Building",
    "address": "123 Main St",
    "climateLocation": "Sydney"
  }'
# Response: { "id": "proj-001", ... }

# 2. Create zone
curl -X POST https://api.loads.hvac.example.com/api/projects/proj-001/zones \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "floorId": "floor-001",
    "name": "Office A",
    "areaM2": 200,
    "heightM": 3.0
  }'
# Response: { "id": "zone-001", ... }

# 3. Add equipment
curl -X POST https://api.loads.hvac.example.com/api/projects/proj-001/equipment \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentType": "ahu",
    "name": "Main AHU",
    "zoneId": "zone-001",
    "airFlowRateM3Sec": 2.5,
    "totalCapacityW": 10000
  }'
# Response: { "id": "eq-001", ... }
```

### Workflow 2: Track Equipment Maintenance

```bash
# 1. Create maintenance task
curl -X POST https://api.loads.hvac.example.com/api/projects/proj-001/equipment/eq-001/maintenance \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "maintenanceType": "filter_change",
    "frequencyDays": 90,
    "description": "Replace main filter"
  }'

# 2. Mark as completed (reschedules for next 90 days)
curl -X PATCH https://api.loads.hvac.example.com/api/projects/proj-001/equipment/eq-001/maintenance/maint-001/complete \
  -H "Authorization: Bearer token"

# 3. View upcoming maintenance
curl https://api.loads.hvac.example.com/api/projects/proj-001/equipment/eq-001/maintenance \
  -H "Authorization: Bearer token"
```

---

## Support & Issues

For API issues or questions, contact:
- Email: support@loads.hvac.example.com
- Documentation: https://docs.loads.hvac.example.com
- Status: https://status.loads.hvac.example.com
