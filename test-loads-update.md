# Heat Loads Update Testing Report

## Issue Summary
User reports: "the actual loads don't seem to update if i add equipment or change façade load"

## Root Cause Analysis

### Architecture Discovered
The system has TWO COMPLETELY SEPARATE equipment systems:

1. **Zone-level equipment** (frontend client-side Zustand state):
   - Fields: `equipmentWm2` (W/m²) and `equipmentPointLoadW` (fixed W)
   - Stored in: `zoneStore.ts` local state
   - Used in: `calculateZone()` function line 165
   - Calculation: `const equipmentW = Math.max(zone.equipmentPointLoadW, zone.equipmentWm2 * zone.areaM2);`

2. **Equipment catalog** (database backend):
   - Stored in: `/api/projects/{projectId}/equipment` endpoint
   - Created/edited through: Equipment page (EquipmentTable, EquipmentModal)
   - NOT used in: `calculateZone()` function

### Data Flow for Zone Changes

**Façade Type/Orientation Changes:**
```
User changes facade dropdown in Zones.tsx (line 221)
  ↓
set('facadeType', value) / set('facadeOrientation', value)  [line 215]
  ↓
updateZone(zoneId, {facadeType: newValue})  [line 36 in Zones.tsx]
  ↓
Zustand updateZone() calls calculateZone()  [line 276 in zoneStore.ts]
  ↓
calculateZone() looks up facade data from projectStore.customFacadeTypes  [line 146]
  ↓
Re-renders zone results with new glassSolarW and wallTransmissionW
```

✅ **This flow SHOULD work correctly.**

**Equipment Catalog Changes:**
```
User adds equipment through Equipment page
  ↓
Equipment is POSTed to /api/projects/{projectId}/equipment
  ↓
Equipment is stored in database
  ↓
Zone calculations in calculateZone() never check equipment table
  ✗ LOADS DO NOT UPDATE
```

**Zone Equipment Field Changes:**
```
User changes equipmentWm2 in Zones.tsx (line 305)
  ↓
num('equipmentWm2', value)  [calls set()]
  ↓
updateZone() calls calculateZone()
  ↓
calculateZone() uses this field: equipmentW = Math.max(equipmentPointLoadW, equipmentWm2 * areaM2)
  ↓
Re-renders zone results with new equipmentW
```

✅ **This flow SHOULD work correctly.**

## Hypothesis

The façade and zone equipment changes SHOULD trigger recalculation properly based on the code. However, the Equipment page additions DON'T trigger updates because they're stored in a separate database table that the frontend never reads.

### Possible Issues to Test

1. **Is facade recalculation working?**
   - Go to a zone
   - Change facadeType dropdown
   - Check if total sensible load changes
   - Expected: Yes, should change immediately

2. **Is zone equipment field working?**
   - Go to a zone's "Loads" tab
   - Change "Equipment" W/m² value
   - Check if "Equipment Used" field updates
   - Expected: Yes, should update immediately

3. **Does Equipment page save to database?**
   - Go to Equipment page
   - Add an AHU with 50 kW capacity
   - Refresh page
   - Expected: Equipment should still be there (persisted)

4. **Are Equipment page additions used in calculations?**
   - Add equipment through Equipment page
   - Check zone calculation results
   - Expected: Currently NOT used (this is the architectural issue)

## Solution Required

To fix the "equipment doesn't update loads" issue, one of these approaches is needed:

### Option A: Connect Equipment Catalog to Zone Calculations (RECOMMENDED)
1. Modify `calculateZone()` to query equipment from database
2. Sum up equipment capacities for zones where equipment is assigned
3. Add equipment total to zone load calculation

**Pros:**
- Centralized equipment tracking
- Automatic updates when equipment is added
- Better maintenance and capacity management

**Cons:**
- Requires backend API call from frontend calculation
- Performance impact for real-time calculations
- Introduces server dependency for frontend state

### Option B: Keep Separate Systems (Current Design)
1. Equipment page is for maintenance tracking only
2. Users must manually enter equipment loads in zone form (equipmentWm2)
3. Equipment catalog doesn't affect calculations

**Pros:**
- Pure frontend calculation (fast, no server calls)
- Clear separation of concerns
- No performance impact

**Cons:**
- User confusion (added equipment doesn't affect loads)
- Manual double-entry of equipment loads
- Current behavior is broken/unexpected

### Option C: Hybrid Approach
1. Equipment page is for maintenance tracking
2. Calculate total equipment capacity from Equipment catalog
3. Provide "Quick Fill" button in Zones form to populate equipmentWm2 from catalog
4. User reviews and adjusts as needed

**Pros:**
- Best of both worlds
- User control + convenience
- Still fast frontend calculations

**Cons:**
- Requires UI changes
- Still requires manual confirmation

## Recommendation

**Option A (Connect Equipment to Zone Calculations)** - This is what users would expect based on the UI/UX of having an Equipment Management page.

The Equipment page currently does nothing to affect zone loads, which contradicts the user's expectation and the feature's purpose.

## Next Steps

1. Confirm façade changes ARE triggering recalculation (test in browser)
2. Decide on equipment integration approach
3. If choosing Option A: Modify `calculateZone()` to fetch and sum equipment loads
4. Add tests to ensure equipment updates propagate to zone results
5. Update documentation to clarify equipment impact on calculations
