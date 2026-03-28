# LOADS Heat Load Calculation Platform - User Guide for Contractors

Welcome to LOADS! This guide walks you through calculating heat loads for your HVAC designs.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Project](#creating-your-first-project)
3. [Adding Zones (Rooms/Spaces)](#adding-zones)
4. [Entering Zone Properties](#entering-zone-properties)
5. [Understanding Calculation Results](#understanding-results)
6. [Managing Equipment](#managing-equipment)
7. [Scheduling Maintenance](#maintenance)
8. [Exporting Results](#exporting)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### 1. Login to LOADS

Visit: `https://loads.hvac.example.com`

Log in with your contractor account:
- Email
- Password

### 2. Familiarize Yourself with the Dashboard

The main dashboard shows:
- **Your Projects** - List of all heat load designs
- **Recent Activity** - Changes and updates
- **Quick Actions** - Create new project, import data

---

## Creating Your First Project

### Step 1: Create a New Project

Click **"New Project"** button on dashboard.

**Enter Project Information:**
- **Project Name** - e.g., "ABC Building Level 1 HVAC"
- **Address** - Building location
- **Building Class** - A, B, C, D (office/commercial classification)
- **Climate Location** - Select from dropdown (e.g., Sydney, Melbourne)
  - Automatically sets design outdoor temperatures

**Save Project** → You're now ready to add zones!

### Step 2: Review Project Settings (Optional)

Go to **Project Settings** to:
- Change climate location (updates outdoor design temperature)
- Create custom facade types (wall/window profiles)
- Set reference loads for common space types
- Configure AHU scheduling

---

## Adding Zones

A "Zone" = a room or space that will have its own HVAC supply.

### Step 1: Create a New Zone

Click **"+ Add Zone"** on the project page.

**Zone Information:**
- **Zone Name** - e.g., "Office A", "Conference Room 1"
- **Zone ID/Tag** - Unique identifier (e.g., "L1-01", "HWC-01")
- **Floor** - Which level is this zone on
- **Area (m²)** - Floor area of the space
- **Height (m)** - Floor-to-ceiling height (typical: 2.7–3.5 m)

### Step 2: Envelope Properties

These define how much heat enters through walls, windows, and roof.

**Orientation & Facade:**
- **Orientation** - N, S, E, W, or Internal
  - Affects solar gain calculation
  - Internal zones: no solar gain, no transmission through facade
- **Facade Type** - Select from library:
  - FT01 (standard brick + glazing)
  - FT02 (high performance)
  - Partition (internal wall)
  - Custom (define your own)

**Window/Glass Properties:**
- **Window Width (m)** - Total width of glazing
- **Window Height (m)** - Total height of glazing
- **Glass U-Value (W/m²K)** - Thermal conductance
  - Double glazing: 2.8–3.5
  - Low-E coating: 1.5–2.0
- **SHGC (Solar Heat Gain Coefficient)** - 0 to 1
  - Standard glass: 0.6–0.7
  - Tinted glass: 0.3–0.5
  - Low-E: 0.2–0.4
- **Shading Factor** - 0 to 1
  - 1.0 = no shading (fully exposed)
  - 0.5 = 50% shading (e.g., blinds, overhangs)
  - 0 = fully shaded

**Roof Properties (if applicable):**
- **Has Roof** - Checkbox (only if zone is on top floor)
- **Exposed Roof Area (m²)** - Horizontal roof area above zone
- **Roof Type** - Pitched or flat
- **Roof U-Value** - Insulation quality (typical: 0.15–0.25)

**Wall Properties:**
- **Wall U-Value** - Envelope conductance
  - Brick cavity: 0.25–0.35
  - Concrete block: 0.35–0.50
  - Insulated: 0.15–0.25

### Step 3: Occupancy

**Number of Occupants** - How many people will be in this zone during peak load

LOADS automatically calculates heat from people:
- Sensible: 70–100 W/person (depends on temperature)
- Latent: 50–60 W/person (moisture)

**Custom Rate (Optional)** - Override default per-person heat

### Step 4: Internal Loads

**Lighting Load (W/m²):**
- LED office: 6–10 W/m²
- Fluorescent office: 10–15 W/m²
- Warehouse: 3–8 W/m²
- Lab: 15–20 W/m²

**Equipment Load (W/m²):**
- General office: 10–20 W/m²
- Server room: 200–1000 W/m²
- Lab: 30–100 W/m²
- Kitchen: 100–300 W/m²

**Or Enter Point Loads:**
- Instead of per-m² load, enter total watts
- e.g., "500 W of computer equipment"

### Step 5: Supply Air & Ventilation

**Supply Air Temperature (°C):**
- Typical: 12–14°C
- Affects required airflow
- Lower = more airflow needed

**Outdoor Air (OA) Method:**
- **General** - AS 1668.2 standard (7.5 L/s per person)
- **Green Star** - Enhanced ventilation (11.25 L/s per person)
- **Custom** - Enter your own rate

**Air Change Requirements (Optional):**
- ACH for supply air
- ACH for outdoor air
- Used for labs and special spaces

### Step 6: Environmental Conditions

**Cooling Design Temperature (°C):**
- Target indoor temperature during peak load (typically 22–24°C)

**Heating Design Temperature (°C):**
- Winter setpoint (typically 20–21°C)

**Design Humidity:**
- Minimum RH: 40–45%
- Maximum RH: 55–60%

---

## Understanding Calculation Results

Once you've entered zone data, LOADS calculates cooling and heating loads automatically.

### Results Display

**Total Cooling Load:**
- **Sensible (W)** - Heat that changes temperature
- **Latent (W)** - Heat from moisture removal
- **Total (kW)** - Combined sensible + latent
- **With Safety Factor (kW)** - Total × 1.15 (15% margin)

### Load Breakdown (% of Total)

Understand what's driving the load:

| Component | Typical Range |
|-----------|--------|
| Solar Gain (south-facing) | 10–30% |
| Transmission (envelope) | 20–40% |
| Occupancy (people) | 10–20% |
| Equipment & Lighting | 20–50% |
| Infiltration | 5–15% |

**Example Office Zone (200 m², south-facing):**
- Transmission: 750 W (25%)
- Solar: 2,000 W (40%)
- Occupancy: 800 W (16%)
- Equipment + Lighting: 600 W (12%)
- Infiltration: 250 W (7%)
- **Total: 4,400 W → 5,060 W with 15% safety**

### Supply Air Calculation

LOADS calculates required supply airflow:

```
Supply Air (L/s) = Total Sensible Load / (1.213 × ΔT)

Where: ΔT = Design Room Temp - Supply Air Temp
```

**Example:**
```
Sensible: 3,500 W
ΔT = 22°C (room) - 12°C (SA) = 10°C

Supply Air = 3,500 / (1.213 × 10) = 289 L/s (1,040 m³/h)
```

### Warnings & Flags

LOADS warns if:
- **Transmission dominates** (> 80% of load) → Check envelope properties
- **Negative loads** → Temperature setpoint error
- **Very high occupancy** → Check room size vs. occupants
- **Oversized supply air** → May indicate calculation error

---

## Managing Equipment

### Adding Equipment

Click **"Equipment"** tab, then **"+ Add Equipment"**.

**Equipment Types:**
- **AHU** (Air Handling Unit) - Central supply
- **FCU** (Fan Coil Unit) - Local terminal
- **Fan** - Exhaust or circulation
- **Pump** - Chilled water circulation

**Key Specifications:**
- **Name** - e.g., "Main AHU", "FCU Zone A"
- **Model & Manufacturer** - For reference
- **Air Flow Rate (m³/s)** - For AHU/FCU/Fan
- **Cooling Capacity (kW)** - Sensible + Latent
- **Power Input (W)** - Electrical input
- **COP / Efficiency** - Energy efficiency (typical: 3–5 for compressors)
- **Refrigerant Type** - R410A, R32, R454B (low-GWP preferred)
- **Refrigerant Charge (kg)** - For safety tracking

### Equipment Validation

LOADS warns if:
- **Equipment undersized** - Capacity < Zone Load × 0.95
  - **Action:** Add more equipment or larger unit
- **Equipment oversized** - Capacity > Zone Load × 2
  - **Warning:** May indicate inefficiency or future expansion plan

---

## Scheduling Maintenance

Keep your equipment running efficiently!

### Add Maintenance Task

For each equipment:

1. Click **"Maintenance"** tab
2. Click **"+ Schedule Maintenance"**

**Task Details:**
- **Type** - Filter change, refrigerant recharge, service, calibration
- **Frequency (days)** - e.g., 90 days for filter
- **Description** - Notes for service team

### Mark Completed

When maintenance is done:
- Click equipment
- Find "Filter Change" task
- Click **"Mark Completed"**
- Automatically schedules next due date (90 days later)

### Upcoming Maintenance

View all upcoming maintenance on **"Maintenance Schedule"** page:
- Sorted by due date
- Color-coded (red = overdue, yellow = due soon, green = ok)

---

## Exporting Results

### Export to PDF

Click **"Export"** → Choose:
- **Heat Load Report** - Calculation details, zone list, loads
- **Equipment Schedule** - Equipment specs, capacities, efficiency
- **Maintenance Log** - Scheduled tasks, completion history

### Export to Excel

Tabular format for:
- Linking to AutoCAD/BIM models
- Importing to proposal templates
- Sharing with team

---

## Troubleshooting

### My calculations seem wrong

**Check 1: Design Temperatures**
```
Outdoor temp should be HIGHER than indoor (for cooling)
✓ Outdoor: 35°C, Indoor: 22°C → ✓ Correct
✗ Outdoor: 22°C, Indoor: 35°C → ✗ Wrong
```

**Check 2: Unit Conversions**
- All inputs are SI units:
  - Area: m²
  - Power: W (not kW)
  - U-values: W/m²K
  - Temperatures: °C

**Check 3: Facade Properties**
- Glass SHGC should be 0–1
- Verify U-values against building spec sheets

**Check 4: Occupancy**
- Don't credit heating load (heating = transmission only)
- Occupancy increases sensible load in cooling

### "Equipment Undersized" Warning

Your equipment can't handle the zone load.

**Solutions:**
1. **Add another unit** - Parallel equipment
2. **Select larger equipment** - Higher capacity model
3. **Review zone load** - Reduce internal loads if possible:
   - Lower occupancy estimate
   - Reduce lighting/equipment assumption
   - Verify window solar properties

### Zone Load Seems Too High

**Common Causes:**

1. **Solar gain (south-facing)**
   - High SHGC (should be < 0.6 for standard)
   - Large window area
   - Solution: Reduce SHGC, add shading, or reduce window area

2. **High internal loads**
   - Equipment or lighting density too high?
   - Verify W/m² assumptions match actual equipment
   - Use "Equipment Point Load" if known

3. **Infiltration or transmission**
   - Check wall/roof U-values against building spec
   - Typical brick: 0.35 W/m²K (not 3.5!)

### Calculation Won't Run

**Error: "Validation failed"**

Check:
- All required fields filled (marked with *)
- No negative numbers
- Temperatures in reasonable range (10–40°C)
- Area and height are positive

**Error: "Zone not found"**

Ensure zone exists before trying to calculate. Refresh page if just added zone.

---

## Best Practices

### 1. Document Your Assumptions

For each project, note:
- Weather data source (BOM, ASHRAE)
- Internal load assumptions (per capita, equipment schedule)
- Design conditions (summer/winter)
- Safety factor applied

### 2. Validate Against Hand Calcs

For important projects:
- Do a quick hand calculation using ASHRAE method
- Compare LOADS result (tolerance: ±5%)
- Escalate discrepancies

### 3. Get Contractor Sign-Off

Before final design:
- Review loads with mechanical engineer
- Verify equipment selections
- Confirm supply air temperatures feasible
- Document assumptions

### 4. Use Presets for Common Spaces

LOADS includes templates:
- General Office → 10 W/m² lighting, 15 W/m² equipment
- Server Room → 200 W/m² equipment, 21°C setpoint
- Lab → 10 W/m² lighting, 50 W/m² equipment, 1.0 ACH

Start with template, then customize.

### 5. Plan for Future Expansion

Use safety factor to account for:
- Future occupancy growth
- Equipment upgrades
- Monitoring equipment additions

---

## Support & Getting Help

### In-App Help

Click **"?"** icon on any page for field descriptions.

### Knowledge Base

Visit: `https://help.loads.hvac.example.com`

Topics:
- Calculation methodology
- Equipment selection guides
- Common design patterns

### Contact Support

- **Email:** support@loads.hvac.example.com
- **Phone:** +61-2-1234-5678
- **Chat:** Available during business hours (9 AM–5 PM AEST)

### Report a Bug

Found an issue? Click **"Feedback"** → **"Report Bug"** with:
- What happened
- What you expected
- Screenshots if helpful
- Your project ID (helps us reproduce)

---

## Glossary

- **ACH** - Air Changes per Hour (infiltration/ventilation rate)
- **AHU** - Air Handling Unit (central HVAC equipment)
- **COP** - Coefficient of Performance (cooling efficiency)
- **DB** - Dry Bulb Temperature (standard thermometer reading)
- **FCU** - Fan Coil Unit (room-level cooling)
- **OA** - Outdoor Air (fresh air requirement)
- **RH** - Relative Humidity (%)
- **SA** - Supply Air
- **SHGC** - Solar Heat Gain Coefficient (window solar factor)
- **U-Value** - Thermal Transmittance (W/m²K)
- **WB** - Wet Bulb Temperature (humidity-adjusted temperature)

---

## Next Steps

1. **Create your first project** - Follow [Creating Your First Project](#creating-your-first-project)
2. **Add 2–3 test zones** - Practice with familiar building
3. **Compare to existing design** - Validate our results vs. your hand calcs
4. **Get team feedback** - Share results with your engineering team
5. **Scale to production** - Use LOADS for all future projects!

Good luck with your heat load design! 🎯
