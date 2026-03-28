# LOADS Troubleshooting Guide

This guide helps diagnose and resolve common issues with the LOADS heat load calculation platform.

## Calculation Issues

### Problem: Calculation Shows Negative Load

**Symptoms:**
- Total cooling load displays negative number
- Sensible load is negative
- Error message about calculation

**Root Cause:**
- Outdoor design temperature is LOWER than indoor setpoint
- Should always have: Outdoor Temp > Indoor Temp (for cooling mode)

**Solution:**

1. Go to **Zone Settings** → **Environmental Conditions**
2. Check **Design External Temperature**
   - Should be > your indoor setpoint
   - Sydney summer design: 35°C (outdoor) vs 22°C (indoor) ✓ Correct
   - Sydney winter design: 6°C (outdoor) vs 21°C (indoor) - Use for HEATING only

3. Verify **Climate Location** is set correctly
   - Click **Project Settings** → **Climate Location**
   - Ensure it's your correct city

4. Check **Design Room Temperature**
   - Cooling setpoint: 22–24°C (typical)
   - Should be lower than outdoor design temp

**Example Fix:**
```
Before:  Outdoor 22°C, Indoor 23°C → Negative load ✗
After:   Outdoor 35°C, Indoor 22°C → Positive load ✓
```

---

### Problem: Cooling Load is Zero or Very Low

**Symptoms:**
- Shows < 500 W for a 200 m² office
- No sensible load calculated
- Infiltration shows zero

**Root Cause:**
- Missing or incomplete zone properties
- Temperature difference too small
- No infiltration, solar, or internal loads entered

**Checklist:**

1. **Check Temperature Inputs:**
   - Design External Temp populated? (Not "0" or blank)
   - Indoor Temp reasonable? (18–28°C)
   - ΔT = Outdoor - Indoor should be > 0 for cooling

2. **Verify Envelope Properties:**
   - Wall U-Value entered? (0.1–3 range)
   - Window area > 0? (if south/east/west facing)
   - Has infiltration rate? (0.1–1 ACH typical)

3. **Check Internal Loads:**
   - Occupants field filled? (Even if 0, should be explicit)
   - Equipment load W/m² entered? (0 is valid, but check intentional)
   - Lighting load W/m² entered? (Default: 6 W/m²)

4. **Orientation:**
   - Is zone "Internal"? → No solar, no transmission through facade
   - Correct facade type selected?

---

### Problem: Load Calculation Seems Too High or Too Low

**Symptoms:**
- Result doesn't match hand calculation
- Differs from contractor's estimate by > 20%
- Supply air requirement seems unreasonable

**Debugging Steps:**

**1. Compare to Hand Calc (ASHRAE Method)**

```
Q_transmission = (Wall U-value × Wall Area) + (Glass U-value × Glass Area) × ΔT

Example: 100 m² zone with 30 m² glass
Wall area: 70 m², Wall U: 0.35, Glass U: 2.8, ΔT: 13°C

Q_trans = (0.35 × 70) + (2.8 × 30) × 13
        = (24.5 + 84) × 13
        = 1,411 W

LOADS result: 1,400 W ✓ (within 1% - correct!)
Your estimate: 800 W ✗ (Check your U-values)
```

**2. Check Unit Conversions**

| Field | Should Be | Common Error |
|-------|-----------|---------|
| U-value | 0.35 W/m²K | Entered 35 instead of 0.35 |
| Area | 50 m² | Entered in ft² instead |
| Temperature | °C | Entered in °F |
| Power | W | Confused W/m² with total W |

**3. Solar Gain Check (If South-Facing)**

```
Expected = Glass Area × SHGC × Solar Irradiance × Shading

Example: 20 m² south glass, SHGC 0.6, Sydney summer
Expected = 20 × 0.6 × 750 × 0.5 = 4,500 W (with 50% shading)

If LOADS shows:
< 2,000 W → Shading factor too high? SHGC wrong?
> 6,000 W → SHGC too high? Wrong orientation?
```

**4. Infiltration Check**

```
Expected = (ACH × Volume × ΔT × 1.213) / 3.6

Example: 100 m², 3 m high, 0.2 ACH, ΔT 13°C
Volume = 300 m³
Expected = (0.2 × 300 × 13 × 1.213) / 3.6 = 261 W

If LOADS shows ≈ 260 W → ✓ Correct
If LOADS shows 0 W → Infiltration not entered
```

---

### Problem: "Equipment Undersized" Warning

**Symptoms:**
- Warning says: "Equipment capacity 5 kW < required 6 kW"
- Can't validate project
- Need to add/upgrade equipment

**What It Means:**

The calculated zone cooling load exceeds the equipment capacity (with 5% safety margin).

**Solutions (in order of preference):**

1. **Verify Zone Load is Correct**
   - Re-check all inputs (especially U-values, SHGC, infiltration)
   - Hand calc to confirm

2. **Add Additional Equipment**
   - Install second FCU or smaller AHU in parallel
   - Each unit sized for portion of load

3. **Select Larger Equipment**
   - Choose higher-capacity model from manufacturer
   - Ensure electrical infrastructure supports

4. **Reduce Zone Load (If justified)**
   - Reduce occupancy estimate?
   - Lower equipment/lighting power density?
   - Improve envelope (lower U-values)?
   - Add shading (reduce solar gain)?

**⚠️ Do NOT ignore this warning!**
Undersized equipment will:
- Fail to reach design temperature
- Run continuously at full capacity
- Waste energy
- Fail on peak days

---

### Problem: "Equipment Oversized" Warning

**Symptoms:**
- Warning: "Equipment 10 kW > zone load 3 kW"
- Equipment much larger than calculated load
- Concerned about efficiency

**What It Means:**

Equipment capacity is more than 2× the zone load—likely unnecessary for design conditions.

**Why This Might Be OK:**

1. **Future expansion** - Planning for additional tenants/equipment
2. **Diversity factor** - Account for diversity if other zones operate part-load
3. **Multiple zones served** - Equipment serves multiple rooms (add loads)
4. **Peak vs. average** - Want buffer for uncertainty

**When to Downsize:**

1. **Single zone application** - No shared equipment, use right-sized unit
2. **Fixed loads** - Unlikely future changes
3. **Energy efficiency priority** - Oversized = part-load inefficiency

**What to Do:**

- Note reason in project (e.g., "Future expansion planned")
- Consider variable capacity equipment (VRF, variable speed compressor)
- Confirm with design engineer

---

## Data Entry Issues

### Problem: Can't Save Zone / "Validation Failed" Error

**Symptoms:**
- Red error message when clicking Save
- Form won't submit
- Lists required fields missing

**Solution:**

1. **Check for Red Highlight**
   - Any fields with red border or error message?
   - Read error message (e.g., "Area must be positive")

2. **Complete All Required Fields (marked with *)**
   - Area (m²)
   - Height (m)
   - Design temperatures
   - Occupancy

3. **Verify Data Ranges**
   - Area: 1–50,000 m² (reasonable)
   - Height: 1–10 m
   - SHGC: 0–1 (not 0–100)
   - Humidity: 20–80% RH

4. **Example Error Messages & Fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Area must be positive" | Area = 0 or negative | Enter area > 0 |
| "Area unreasonably large (> 50,000)" | Entered in ft² instead of m² | Divide by 10.76 |
| "SHGC must be 0–1" | Entered 0.6 as 60 | Enter as decimal (0–1) |
| "Name is required" | Left zone name blank | Add zone name |
| "Height should be 1–10 m" | Entered 0.5 m | Check floor-to-ceiling height |

5. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cache, then refresh page

---

### Problem: Can't Find Climate Location

**Symptoms:**
- Dropdown doesn't have my city
- Sydney/Melbourne not listed
- Error: "Invalid location"

**Solution:**

1. **Check Exact Spelling**
   - Sydney (not "Sydeny")
   - Melbourne (not "Melb")
   - Brisbane, Perth, Adelaide available?

2. **Scroll Dropdown**
   - Long list—scroll down to find your city
   - Type first letter to jump (S for Sydney)

3. **Request New Location**
   - City not listed? Email support:
   - Email: support@loads.hvac.example.com
   - Provide: City name, state, outdoor design temps
   - We'll add it

4. **Temporary Workaround**
   - Select closest major city
   - Manually override design temperature:
     - Click **Project Settings** → **Custom Temperature**
     - Enter your local design conditions

---

## Performance Issues

### Problem: Page Loads Slowly / Freezes

**Symptoms:**
- Takes > 5 seconds to load project
- Unresponsive when adding zones
- Browser tab becomes slow

**Solution:**

1. **Clear Browser Cache**
   - Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
   - Clear all cache and cookies
   - Refresh page

2. **Try Different Browser**
   - Chrome recommended
   - Edge, Firefox, Safari also supported
   - Avoid older IE

3. **Close Other Tabs**
   - LOADS heavy on RAM if many zones (50+)
   - Close unnecessary tabs
   - Restart browser

4. **Check Internet Connection**
   - Test speed: speedtest.net
   - Should be > 5 Mbps
   - If slow, may need to wait or contact ISP

5. **Contact Support**
   - If still slow: support@loads.hvac.example.com
   - Include project ID (found in URL)

---

## Authentication & Access

### Problem: Can't Login / Forgot Password

**Symptoms:**
- "Invalid email or password" error
- Locked out of account
- Forgot password link doesn't work

**Solution:**

1. **Check Email & Password**
   - Correct email address?
   - Password is case-sensitive
   - CAPS LOCK on? Turn it off

2. **Reset Password**
   - Click **"Forgot Password?"** on login page
   - Enter your email
   - Check inbox (and spam folder) for reset link
   - Follow link to set new password

3. **Account Locked**
   - After 5 failed login attempts, account locked 30 minutes
   - Wait and try again
   - Or reset password (above)

4. **Email Not Recognized**
   - Make sure you're registered with that email
   - Check organization admin (may need to invite you)
   - Contact: support@loads.hvac.example.com

---

### Problem: "Permission Denied" Error

**Symptoms:**
- See project list but can't open project
- Can't edit zone
- "You don't have access to this resource"

**Solution:**

1. **Check Organization**
   - You're in same org as project?
   - Project owner can see it → contact org admin if not assigned

2. **Check User Role**
   - Engineer role: Can create/edit projects
   - Viewer role: Can only view
   - Contact org admin to upgrade permissions

3. **Project Was Transferred**
   - Project moved to different organization?
   - Request re-assignment from new org admin

---

## Export & Reporting

### Problem: Can't Export / Download Fails

**Symptoms:**
- Click Export, nothing happens
- Download starts but fails partway
- Error: "Export failed"

**Solution:**

1. **Check Internet Connection**
   - Large exports (50+ zones) need stable connection
   - Try export again if briefly disconnected

2. **Clear Browser Downloads**
   - Delete partial/failed downloads in ~/Downloads
   - Free up disk space

3. **Try Different Format**
   - Can't export to PDF? Try Excel first
   - PDF sometimes slower to generate

4. **Check Pop-up Blocker**
   - Browser may block download popup
   - Whitelist loads.hvac.example.com

5. **Try Different Browser**
   - Chrome recommended for exports
   - Edge, Firefox usually work too

---

## Equipment Issues

### Problem: Can't Add Equipment to Zone

**Symptoms:**
- "Zone not found" error
- Can't assign equipment to zone
- Equipment appears but no zone link

**Solution:**

1. **Zone Must Exist First**
   - Create zone before adding equipment
   - Refresh page if just created zone

2. **Correct Zone ID**
   - Equipment form shows available zones
   - Select correct zone from dropdown

3. **Zone Requires Calculation**
   - Some fields require zone to be calculated first
   - Click "Recalculate" → then add equipment

---

### Problem: Maintenance Task Not Reminding Me

**Symptoms:**
- Overdue maintenance not shown
- No email reminder
- Next due date seems wrong

**Solution:**

1. **Check Completion Status**
   - In Maintenance list, find task
   - If marked "complete", next due should be in future
   - If showing as overdue, click "Mark Complete"

2. **Email Notifications**
   - Check email preferences: Account → Notifications
   - Enable "Maintenance Due" reminders
   - Check spam folder

3. **Frequency Calculation**
   - If last completed Jan 15 + 90 days = due Apr 15
   - Show calendar in maintenance tab to verify

4. **Manual Reminders**
   - Export maintenance schedule
   - Add to your project calendar (Outlook, Google Calendar)

---

## Calculation Validation

### How to Manually Validate a Zone Load

Use this checklist to verify LOADS calculations:

**Step 1: Transmission Heat**
```
Q_trans = [(U_wall × A_wall) + (U_glass × A_glass)] × ΔT

Example: 50 m² wall (U=0.35) + 10 m² glass (U=2.8), ΔT=13°C
Q = [(0.35 × 50) + (2.8 × 10)] × 13
  = [17.5 + 28] × 13 = 591 W

LOADS should show ≈ 590 W
```

**Step 2: Solar Gain (if south-facing)**
```
Q_solar = A_glass × SHGC × Irradiance × Shading

Example: 10 m² south glass, SHGC 0.6, Sydney 750 W/m², 50% shading
Q = 10 × 0.6 × 750 × 0.5 = 2,250 W

LOADS should show ≈ 2,250 W
```

**Step 3: Occupancy**
```
Q = Occupants × (Sensible + Latent)

Example: 10 people, 22°C room (≈ 74 W sensible, 56 W latent)
Q = 10 × (74 + 56) = 1,300 W

LOADS should show ≈ 1,300 W
```

**Step 4: Infiltration**
```
Q = (ACH × Volume × ΔT × 1.213) / 3.6

Example: 0.2 ACH, 300 m³, ΔT 13°C
Q = (0.2 × 300 × 13 × 1.213) / 3.6 = 261 W

LOADS should show ≈ 260 W
```

**Step 5: Total**
```
Total = Trans + Solar + Occupancy + Infiltration
      = 591 + 2,250 + 1,300 + 261 = 4,402 W

With 15% safety = 4,402 × 1.15 = 5,062 W

LOADS should show ≈ 4,400 W (without safety)
                   ≈ 5,060 W (with safety)
```

If LOADS result ≈ your hand calc: ✓ **Correct!**
If difference > 10%: Review inputs and validate step-by-step

---

## Still Need Help?

### Resources

- **In-App Help** - Click "?" on any page
- **User Guide** - https://loads.hvac.example.com/help
- **Methodology** - See METHODOLOGY.md (included in project)
- **API Docs** - https://api.loads.hvac.example.com/docs

### Contact Support

- **Email:** support@loads.hvac.example.com
- **Phone:** +61-2-1234-5678 (9 AM–5 PM AEST)
- **Chat:** Available in-app (see bottom right)
- **Status:** https://status.loads.hvac.example.com

### Provide Feedback

Found a bug or want a feature?
- Click **"Feedback"** (bottom right)
- Describe issue
- Include project ID (helps us reproduce)
- We'll respond within 24 hours

---

## FAQ

**Q: Can I work offline?**
A: Not yet. Internet connection required. Feature in development.

**Q: How accurate are LOADS calculations?**
A: ±10% of actual peak load (within industry standard). See METHODOLOGY.md.

**Q: Can I import from HVAC design tools?**
A: Not yet. Manual entry or CSV import in development. Contact support for custom integrations.

**Q: How long does calculation take?**
A: < 1 second for typical project (50 zones). Larger projects (1000+ zones) may take 10–30 seconds.

**Q: Can I share projects with my team?**
A: Yes. Project Settings → Share → Add team member email.

**Q: What happens to my data if my subscription ends?**
A: Your projects stay on your account. Read-only access until subscription renewed.

---

Good luck! 🎯 Your HVAC designs will be more accurate and faster with LOADS.
