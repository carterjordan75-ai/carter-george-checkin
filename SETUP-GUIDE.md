# Carter & George Check-In Kiosk — Setup Guide

Complete step-by-step instructions for deploying the patient check-in system across your 17 clinics.

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it: **"Carter & George - Patient Check-Ins"**
3. Note the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the ID (it's a long alphanumeric string between `/d/` and `/edit`)

---

## Step 2: Create and Deploy the Google Apps Script

### A. Create the Script Project

1. From your Google Sheet, go to **Tools → Script Editor**
2. This opens Google Apps Script in a new tab
3. Delete any default code and paste the entire contents of **`google-apps-script.gs`**

### B. Configure the Sheet ID

1. In the script, find this line at the top:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
   ```
2. Replace `'YOUR_GOOGLE_SHEET_ID'` with the ID you copied in Step 1
3. **Save** the project (Ctrl+S / Cmd+S)
4. Give it a name like **"Carter & George Check-In"**

### C. Initialize the Spreadsheet

1. In the script editor, select the **`setupSheet`** function from the dropdown
2. Click the **Run** button (▶)
3. Grant permissions when prompted (you'll need to verify your Google account)
4. You'll see a confirmation: **"Spreadsheet initialized with 17 clinic tabs!"**
5. Go back to your Google Sheet — you now have 17 tabs (one per clinic) with headers ready

### D. Deploy as a Web App

1. In the script editor, click **Deploy → New Deployment**
2. Click the **Select Type** dropdown and choose **Web app**
3. Configure:
   - **Execute as:** Your Google account
   - **Who has access:** Anyone
4. Click **Deploy**
5. You'll see a dialog with the **Deployment ID**
6. **Copy the full URL** shown (looks like: `https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercodeapp`)
7. Click **Copy deployment ID** and save it somewhere safe

---

## Step 3: Configure the HTML App

1. Open **`carter-george-checkin.html`** in a text editor
2. Find this line (around line 266):
   ```javascript
   GOOGLE_SHEETS_WEB_APP_URL: 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercodeapp',
   ```
3. Replace `{DEPLOYMENT_ID}` with the actual deployment ID from Step 2D
4. **Save** the file

---

## Step 4: Deploy to Tablets

### Option A: Direct URL (Recommended for Managed Tablets)

1. Upload `carter-george-checkin.html` to a web server OR use GitHub Pages:
   - Push the file to a GitHub repo
   - Enable GitHub Pages (Settings → Pages → Deploy from main branch)
   - Access at: `https://yourusername.github.io/repo-name/carter-george-checkin.html`

2. On each tablet:
   - Open Safari (or Chrome)
   - Go to the URL
   - Tap the **Share** button → **Add to Home Screen**
   - Name it "Carter & George" and tap **Add**
   - The app now runs full-screen like a native app

### Option B: Local File (For Offline-First Setup)

1. Copy `carter-george-checkin.html` to each tablet via:
   - USB file transfer
   - Email attachment
   - MDM solution (if you have device management)

2. Open the file in Safari/Chrome on the tablet

### Tablet Configuration Recommendations

- **Auto-lock:** Set to 3-5 minutes (screen will sleep after inactivity)
- **Brightness:** Set to maximum (50% minimum)
- **Orientation:** Lock to Portrait mode
- **Accessibility:** Disable text magnification
- **Network:** Connect to your clinic's WiFi or use a cellular plan

---

## Step 5: Test the System

### Desktop/Browser Test

1. Open `carter-george-checkin.html` in your browser
2. On first load, you'll see the **Clinic Selector** screen
3. Select any clinic — this saves your selection permanently
4. You should see the **Home Screen** with "Carter & George"
5. Tap **Check In**
6. Fill in the form:
   - First Name: "John"
   - Last Name: "Doe"
   - Date of Birth: "15/06/1990"
7. Tap **Confirm Check In**
8. You should see the **Thank You** screen with a progress bar
9. After 5 seconds, it returns to the home screen

### Verify Data in Google Sheet

1. Go back to your Google Sheet
2. Click the tab for the clinic you selected
3. You should see a new row with:
   - Date: Today's date
   - Time: Current time
   - First Name: "John"
   - Last Name: "Doe"
   - Date of Birth: "15/06/1990"
   - Week Number: (calculated automatically)

---

## Step 6: Test Offline Functionality

1. On a tablet or browser, open the check-in app
2. Disable WiFi/internet
3. Try checking in a patient
4. The app will fail to reach Google Sheets but will store the check-in locally
5. Re-enable internet — check-ins will be attempted on next load
6. Check the browser console (Inspect → Console) to see logs

**To retrieve offline logs:**
- Open browser console (Inspect → Console)
- Paste: `JSON.parse(localStorage.getItem('cg_offline_logs'))`
- This shows all offline check-ins

**Manual sync:** You can create a simple admin dashboard to sync offline logs back to Google Sheets (future enhancement).

---

## Step 7: Use the Google Sheets Tools

Once deployed, you can use the custom menu in Google Sheets to manage check-ins:

### Search Patient

1. In your Google Sheet, go to **Check-In Tools → Search Patient**
2. Enter a patient's first or last name
3. Results appear in a new **"Search Results"** sheet
4. Shows which clinic and when they checked in

### View Today's Check-Ins

1. Go to **Check-In Tools → View Today's Check-Ins**
2. A new **"Today's Summary"** sheet is created
3. Shows all check-ins across all 17 clinics for today
4. Useful for receptionist reports

---

## Troubleshooting

### "POST request fails, data won't save"

**Issue:** The URL in the HTML doesn't match the deployed Web App URL

**Fix:**
1. In Google Apps Script, go to **Deploy → Manage Deployments**
2. Copy the full URL from the latest deployment
3. Update the `GOOGLE_SHEETS_WEB_APP_URL` in the HTML file
4. Save and reload the app

### "Clinic selector shows every time I load"

**Issue:** localStorage is being cleared or disabled

**Fix:**
1. Check tablet browser settings — ensure cookies/storage are enabled
2. If using private browsing, switch to normal mode
3. Check if any browser extensions are blocking storage

### "Form won't submit"

**Issue:** DOB validation failing

**Fix:**
1. Ensure DOB is entered as **DD / MM / YYYY** (with spaces)
2. Date must be a valid past date (not future)
3. Year must be between 1900 and today

### "Script doesn't have permission to edit sheet"

**Issue:** Google Apps Script wasn't authorized properly

**Fix:**
1. In the script editor, run any function (e.g., `setupSheet`)
2. You'll get a permission dialog — click **Review permissions**
3. Select your Google account
4. Allow access to Google Sheets

### "Can't find the Deployment ID"

**Fix:**
1. In Google Apps Script, click **Deploy → New Deployment**
2. Select **Web app** as the type
3. The deployment dialog shows the full URL — copy everything after `/d/` and before `/usercodeapp`

---

## Ongoing Maintenance

### Weekly Tasks

- Check **Today's Summary** sheet to monitor check-in patterns
- Monitor offline logs if clinics have spotty internet
- Review **Search Patient** results for any data entry issues

### Monthly Tasks

- Verify all 17 clinic tabs have current check-in data
- Archive previous month's data (optional: move to a "Archive" sheet)
- Check browser console for any errors

### Tablet Maintenance

- Restart tablets weekly (improves performance)
- Check WiFi connectivity (especially after power outages)
- Update browser software when updates are available

---

## Customization & Enhancement Ideas

### Add Clinic Settings
- Allow staff to configure hours/holidays
- Auto-disable check-in during closed hours

### SMS Confirmation
- Send appointment confirmations via Twilio API

### Patient Database
- Link check-ins to a patient management system
- Auto-populate known patients

### Analytics Dashboard
- Create a Google Data Studio dashboard showing check-in trends
- Track busiest times/days per clinic

### Multi-Language Support
- Add clinic-specific languages
- Toggle between English/Spanish/etc.

---

## Support & Updates

### If You Need Help

1. Check the **troubleshooting** section above
2. Review the browser console for error messages (Inspect → Console)
3. Check the Google Apps Script execution logs (View → Execution Log)

### Future Updates

To update the HTML app across all tablets:
- If using GitHub Pages: Update the file in the repo (automatic)
- If using direct files: Re-upload or re-distribute via MDM

To update the Google Apps Script:
- Edit the script in Google Apps Script editor
- Changes take effect immediately (no redeploy needed for most updates)
- For new deployments, follow Step 2D again

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Tablet Browsers (17)                      │
│          carter-george-checkin.html (full-screen)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                    POST /doPost
                         │
┌─────────────────────────┴────────────────────────────────────┐
│        Google Apps Script Web App (Single Deployment)        │
│  - Receives check-in data from all 17 clinics                │
│  - Writes to appropriate clinic sheet                        │
│  - Handles offline logs (future feature)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Writes rows
                         │
┌─────────────────────────┴────────────────────────────────────┐
│      Google Sheet: "Carter & George - Patient Check-Ins"     │
│  ├─ Amersham (sheet tab)                                     │
│  ├─ Bedford (sheet tab)                                      │
│  ├─ ... (15 more clinic tabs)                                │
│  └─ Wokingham (sheet tab)                                    │
│                                                               │
│  Each sheet:                                                 │
│  ├─ Column A: Date                                           │
│  ├─ Column B: Time                                           │
│  ├─ Column C: First Name                                     │
│  ├─ Column D: Last Name                                      │
│  ├─ Column E: Date of Birth                                  │
│  └─ Column F: Week Number                                    │
└────────────────────────────────────────────────────────────┘
```

---

## Files Included

- **`carter-george-checkin.html`** — Main tablet app (single HTML file)
- **`google-apps-script.gs`** — Backend script (deploy to Apps Script)
- **`SETUP-GUIDE.md`** — This file

---

**Deployed by:** Carter & George Physiotherapy
**Last Updated:** 2025
**System Version:** 1.0
