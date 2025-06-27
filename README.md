# 📊 PROSPR Plan - Admin and Reporting Enhancement

## 1. 📋 Project Context
This project enhances the PROSPR financial planning Google Sheet template with custom administrative tools and automated reporting features. The goal is to provide more powerful, controlled functionalities for analyzing a client's financial data. The solution is built entirely using Google Apps Script, integrating directly with the Google Sheets UI and Google services like Gmail.

## 2. 🎯 Core Requirements
The implementation focuses on two main deliverables as specified in the test assignment:

### 🔐 Requirement 1: Admin Menu with Access Control
- An "Admin" menu is added to the spreadsheet's main UI.
- Access to the menu's functions is protected by an administrator password, which is requested from the user via a UI prompt.
- Only after successful authentication are the admin-only tools revealed in a new, temporary "Admin Tools" menu.

### 📈 Requirement 2: Monthly Comparative Report Tool
Under the Admin menu, add a feature:
- Generate a compact report based on the “Monthly Budget” tab.
- For each main budget category (e.g., Shelter, Food, etc.), only show actual vs. planned totals.
- If any category shows a significant difference (e.g., 15–20%+ deviation): Insert a few lines between categories with a short explanation.
- Highlight the specific line item(s) responsible for the deviation.

Example output:

```
Shelter is over budget by 20%.
- Landscaping: $2,000 (Actual) vs $1,000 (Planned)
```

Format the output cleanly in:

- A separate sheet/tab, or A Gmail draft email (e.g., using GmailApp.createDraft()), with the summary ready to send to a client.


## 3. 💭 Assumptions
The following assumptions were made during the development of this solution:

- **Static Category Structure**: The solution assumes that the layout of the "Monthly Budget" sheet is static, where a main category section is identified by a header row (with a name in Column B but no value in Column D) and concluded by a total row (with a name in Column B and a value in Column D).
- **Current Period Only**: The report generation considers only the data for the current year/month that is open and displayed in the "Monthly Budget" sheet, without processing historical or future periods.
- **Email as Draft**: The email generation feature will only create and save a draft in the user's Gmail account. It will not send the email automatically.
- **Plain Text Report**: The report created in a new spreadsheet tab will be in a simple, plain-text format, similar in structure to the content generated for the email draft.
- **Definition of "Main Budget Category"**: The script identifies a main budget category section by looking for a header row and a corresponding total row in Column B. This ensures all such defined groupings, like "Income" and "Expenses & Debt Service," are included.
- **Zero-Planned Budget Deviations**: If a category has a planned budget of $0 and any actual spending occurs, this deviation is specifically highlighted in the report with a unique message, as a percentage deviation cannot be calculated.

## 4. ✨ Features
The final solution includes the following key features:

- **Password-Protected Admin Access**: A robust authentication flow protects the administrative functions. The password can be changed at any time.
- **Secure, No-Hardcoding Password Storage**: The administrator password is not hard-coded into the script. It is stored securely using Google Apps Script's PropertiesService, preventing exposure to users with read-only access and allowing the spreadsheet owner to change it continuously without editing the code.
- **Security Audit Logging**: The system automatically logs all admin authentication attempts (successful, failed, and cancelled) with user email identification for security monitoring and audit trail purposes.

## 5. 🚀 Demo and Report Format

### 🌐 Live Demo
The complete working solution can be accessed at: https://docs.google.com/spreadsheets/d/1iWqLeO79fmewgs78_y7FaYcW7wqp_0FS9_otGjZW0K8/edit?usp=sharing

**Admin Access:** To test the admin functionality, use the password `prospr` when prompted to access the Admin menu.

### 📄 Report Output Format
When generating reports (both email drafts and spreadsheet), the output follows this standardized format. For spreadsheet output, the report is created in a new tab named "Monthly_Comparative_Report":

```
                            MONTHLY COMPARATIVE REPORT
==================================================================================

CATEGORY: Person 1
 > Planned: $20000.00
 > Actual:  $2000.00

Person 1 is under budget by 90%.
 - 1. Salary 1 - After Tax: $2000.00 (Actual) vs $20000.00 (Planned)

----------------------------------------------------------------------------------

CATEGORY: Person 2
 > Planned: $0.00
 > Actual:  $2000.00

Person 2 is over the planned Budget of $0.
 - 2. Draw from Business: $2000.00 (Actual) vs $0.00 (Planned)

----------------------------------------------------------------------------------
```

## 6. 📁 Project Files

### Files Added/Modified in Latest Implementation
The following files were added or modified:

**📄 New Files Added:**
- `Admin.js` - Contains admin menu functionality and password authentication logic
- `README.md` - Project documentation and usage guidelines  
- `Report.js` - Monthly comparative report generation and formatting logic

These files together implement the complete PROSPR Plan enhancement with admin controls and automated reporting capabilities.

## 7. 📚 Library Deployment

### ProsprScript Library Integration
The modified files in this project can be integrated into the **ProsprScript** library by publishing a new version. This allows for centralized distribution and version control of the PROSPR Plan enhancements across multiple spreadsheet implementations.
