# LOADS Heat Load Calculation Methodology

## Overview

LOADS is an HVAC heat load calculation platform designed for large commercial projects. It uses the **HAP (Hourly Analysis Program) methodology** enhanced with Australian building standards for calculating cooling and heating loads.

## Calculation Method

### Heat Load Formula

```
Total Heat Load = Transmission + Solar Gain + Internal Loads + Infiltration
```

All values are expressed in Watts (W), with results shown in kilowatts (kW).

---

## 1. Transmission Heat Loss/Gain (Conduction)

Heat transfer through building envelope (walls, windows, roof).

### Formula

```
Q_transmission = U_value × Area × ΔT

Where:
  U_value: Thermal transmittance (W/m²K)
  Area: Surface area (m²)
  ΔT: Temperature difference between indoor and outdoor (°C)
```

### Example

Office with brick wall (U=0.4 W/m²K) + glazing (U=2.8 W/m²K):

```
Wall area: 50 m², Glass area: 10 m²
ΔT = 22°C (indoor) - 35°C (outdoor) = -13°C

Q_wall = 0.4 × 50 × 13 = 260 W
Q_glass = 2.8 × 10 × 13 = 364 W
Q_total_transmission = 624 W
```

### Typical U-Values

| Material | U-Value (W/m²K) |
|----------|-----------------|
| Single brick wall | 0.35–0.40 |
| Cavity brick (50mm) | 0.25–0.30 |
| Concrete block | 0.40–0.50 |
| Single glazing | 5.5–6.0 |
| Double glazing (standard) | 2.8–3.5 |
| Double glazing (low-E) | 1.5–2.0 |
| Insulated roof | 0.15–0.25 |

---

## 2. Solar Heat Gain (Windows)

Heat from solar radiation through glass.

### Formula

```
Q_solar = A_window × SHGC × Solar_Irradiance × Shading_Factor

Where:
  A_window: Glazing area (m²)
  SHGC: Solar Heat Gain Coefficient (0–1, dimensionless)
  Solar_Irradiance: Solar radiation (W/m²)
  Shading_Factor: Reduction due to blinds/overhangs (0–1)
```

### Solar Irradiance by Orientation

| Orientation | Summer Irradiance (W/m²) | Notes |
|-------------|--------------------------|-------|
| North (N) | 200–400 | Lowest in Southern Hemisphere |
| South (S) | 600–800 | Highest in Southern Hemisphere |
| East (E) | 400–700 | Morning peak |
| West (W) | 400–700 | Afternoon peak |
| Roof (horizontal) | 900–1000 | Highest across all orientations |

### Example

South-facing office window in Sydney summer:

```
Glass area: 10 m², SHGC: 0.6, Irradiance: 750 W/m², Shading: 50%

Q_solar = 10 × 0.6 × 750 × 0.5 = 2,250 W
```

### SHGC Typical Values

| Glass Type | SHGC |
|-----------|------|
| Clear single | 0.8–0.9 |
| Clear double | 0.6–0.7 |
| Tinted double | 0.3–0.5 |
| Low-E coating | 0.2–0.4 |

---

## 3. Internal Loads (People, Equipment, Lighting)

Heat generated inside the zone.

### 3.1 Occupancy Load

```
Q_occupancy = Number of People × Heat per Person

Sensible: 70–100 W/person (depends on activity, temp)
Latent: 50–60 W/person (moisture from respiration/perspiration)
```

**Activity-Based Loads (at 23°C):**

| Activity | Sensible (W) | Latent (W) | Total |
|----------|--------------|-----------|-------|
| Seated, light work | 74 | 56 | 130 |
| Seated, moderately active | 90 | 68 | 158 |
| Standing, light activity | 104 | 72 | 176 |
| Standing, moderate activity | 120 | 88 | 208 |

**Temperature Adjustment:**
Occupancy load increases with temperature. LOADS automatically interpolates:
- At 18°C: sensible ~50 W/person
- At 23°C: sensible ~74 W/person
- At 28°C: sensible ~110 W/person

### 3.2 Equipment Load

Heat from computers, machinery, appliances.

```
Q_equipment = Equipment Power (W/m²) × Area (m²)
```

**Typical Densities:**

| Space Type | Equipment (W/m²) |
|-----------|-------------------|
| General office | 10–20 |
| Open-plan office | 15–25 |
| Server room | 200–1000 |
| Laboratory | 30–100 |
| Kitchen | 100–300 |
| Retail | 20–40 |

### 3.3 Lighting Load

Heat from lights (converted to sensible load).

```
Q_lighting = Lighting Power (W/m²) × Area (m²)
```

**Typical Densities:**

| Space Type | Lighting (W/m²) |
|-----------|-----------------|
| LED office | 6–10 |
| Fluorescent office | 10–15 |
| Retail | 15–25 |
| Warehouse | 3–8 |
| Lab | 15–20 |

---

## 4. Infiltration (Air Leakage)

Heat loss/gain from outdoor air entering through cracks and gaps.

### Formula

```
Q_infiltration = (ACH × Volume × ΔT × Cp × ρ) / 3600

Where:
  ACH: Air Changes per Hour (typical: 0.1–1.0)
  Volume: Room volume (m³)
  ΔT: Temperature difference (°C)
  Cp: Specific heat of air (1,005 J/kg·K)
  ρ: Air density (1.2 kg/m³ at 20°C)
  3600: Conversion factor (seconds to hours)
```

### Example

```
ACH: 0.2, Volume: 1,000 m³, ΔT: 13°C

Q_infiltration = (0.2 × 1,000 × 13 × 1,005 × 1.2) / 3600 = 858 W
```

### Typical ACH Values

| Building Type | ACH |
|---------|-----|
| Sealed modern building | 0.1–0.3 |
| Standard commercial | 0.3–0.5 |
| Older buildings | 0.5–1.0 |
| Naturally ventilated | 1.0–2.0 |

---

## 5. Latent Load (Humidity)

Moisture removed to control room humidity.

### Formula

```
Q_latent ≈ Sensible Load × (Outdoor RH% - Indoor RH%) × 0.5
```

More precisely:

```
Q_latent = m_air × (W_outdoor - W_indoor) × L_v

Where:
  m_air: Mass flow of air (kg/s)
  W: Humidity ratio (kg water / kg dry air)
  L_v: Latent heat of vaporization (2,450 kJ/kg)
```

**Typical Design Conditions (Sydney):**

- Outdoor: 35°C DB, 25°C WB (70% RH)
- Indoor: 22°C DB, 45% RH

Latent load is approximately 30–40% of sensible cooling load in humid climates.

---

## 6. Safety Factor

A safety margin applied to account for:
- Uncertainties in weather data
- Margin for equipment degradation
- Diversity factors not captured in steady-state calculations

**Default: 1.15 (15% safety margin)**

**Common Range: 1.1–1.2**

```
Total with Safety = Total Cooling Load × Safety Factor
```

---

## Heating Load Calculation

Winter heating load considers:

```
Q_heating = Transmission Loss (Winter Conditions)
```

- No solar gain (assumed worst case: cloudy)
- No internal loads credited (conservative)
- Outdoor temperature: Winter design DB (e.g., 6°C Sydney)

**Latent Load:** Not applicable (heating removes moisture from outside air)

---

## Calculation Standards & References

### Australian Standards

- **AS 1668.2** - Outdoor Air Requirements for Occupied Spaces (ventilation)
- **AS/NZS 3823.2** - Thermal Insulation (building envelope)
- **Building Code of Australia (BCA)** - Climate zones and design conditions

### International Standards

- **ASHRAE Handbook - Fundamentals** - Heat load calculations, weather data
- **CIBSE Guide A** - Environmental Design (UK/AU reference)
- **ISO 13789** - Calculation of heat loss through building envelope

### Methodology

- **HAP (Hourly Analysis Program)** - Proprietary HVAC design tool
- Steady-state load calculation (ASHRAE method)
- Peak cooling load (no diversity across zones)

---

## Design Outdoor Conditions

### Sydney, NSW Example

| Season | DB (°C) | WB (°C) | RH (%) |
|--------|---------|---------|--------|
| Summer (peak) | 37 | 25 | 55 |
| Summer (design) | 35 | 24 | 60 |
| Winter (design) | 6 | 4 | 85 |

**Source:** BOM (Bureau of Meteorology), ASHRAE 2017

---

## Psychrometric Properties

LOADS uses the **psychrolib** library to calculate precise humidity properties:

- Enthalpy (kJ/kg)
- Humidity ratio (kg water / kg dry air)
- Dew point (°C)
- Wet bulb temperature (°C)

All calculations maintain strict psychrometric accuracy for latent load assessment.

---

## Assumptions & Limitations

### Assumptions

1. **Steady-State Calculation**
   - Peak load (instantaneous, not averaged)
   - Does not account for thermal mass or time lag
   - Conservative for equipment sizing

2. **No Diversity**
   - All zones at peak load simultaneously
   - Total system capacity = sum of zone loads + safety factor
   - Typical diversity factor: 0.7–0.9 (not applied here)

3. **Standard Occupancy Schedule**
   - Default: 9 AM–6 PM weekdays
   - 100% occupancy when schedule active
   - No part-load diversity

4. **Uniform Conditions**
   - Interior conditions uniform across zone
   - No temperature stratification
   - No air short-circuiting

### Limitations

- **Not suitable for:**
  - Transient analyses (warm-up time, recovery)
  - Dynamic building energy modeling
  - Detailed HVAC control simulation
  - Supply air sizing for tight tolerances (< ±2°C)

- **Design conservatism:**
  - Peak load (not average)
  - No credit for thermal mass
  - No diversity across zones

---

## Calculation Accuracy

**Expected Accuracy: ±10% of actual peak load**

Deviations occur due to:
- Weather data uncertainty (±2–3°C)
- Internal load assumptions (±20% typical variance)
- Building envelope properties (±15% uncertainty in U-values)
- Occupancy patterns (±50% variance from assumed schedules)

**Validation Against Real Projects:**

LOADS results should match:
- Contractor hand calculations (typically within 5%)
- HVAC commissioning measurements (within 10–15% peak)
- Energy modeling tools (same assumptions, within 5%)

---

## References & Further Reading

1. **ASHRAE Handbook – Fundamentals**
   - Chapter 18: Heating, Cooling, and Humidifying Load Calculation
   - Chapter 1: Psychrometrics

2. **CIBSE Guide A – Environmental Design**
   - Chapter 2: Weather and solar data
   - Section A2-4: Internal heat gains

3. **Australian Building Codes (BCA 2022)**
   - Climate zones and design conditions

4. **Trane HAP Manual**
   - Industry-standard design tool reference

5. **Psychrolib Documentation**
   - Psychrometric calculations (open source)
   - https://github.com/psychrometrics/psychrolib

---

## Contact & Support

For questions about methodology or assumptions:
- Email: support@loads.hvac.example.com
- Technical documentation: https://docs.loads.hvac.example.com
- Industry references: [Listed above]
