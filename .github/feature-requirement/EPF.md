###### [back](./feature-requirement.md)
# [EPF] Employee Profile


### [EPF.1] Employee Profile Creation

#### [EPF.1.1] After login, user can create an Employee Profile
#### [EPF.1.2] Employee Profile form fields are dynamically defined by BUSINESS_ADMIN in admin panel
#### [EPF.1.3] Supported field types: text, number, dropdown (single/multiselect), required/optional
#### [EPF.1.4] Example: certifications (dropdown, multiselect, predefined options)
#### [EPF.1.5] Profile data validation based on admin configuration
#### [EPF.1.6] Users can edit their Employee Profile at any time using the same form; fields previously completed will be prefilled for convenience.

---
<br>

### [EPF.2] Advanced Employee Profile search

#### [EPF.2.1] Search Employee Profiles using filters matching Employee Profile form fields
#### [EPF.2.2] Filter types correspond to admin-defined field types (text, number, dropdown, etc.)
#### [EPF.2.3] Support for complex queries (e.g., certifications contains X, experience > Y)

---
<br>

### [EPF.3] Employee Profile fields

- Fields available for completion when adding an Employee Profile and used to search for Employee Profile are configurable in the admin panel.
- See details in [[ADP.1.1] Employee Profile fields](./ADP.md#adp11-employee-profile-fields).

---
<br>


### [EPF.4] Security & Access Control

#### [EPF.4.1] Only BUSINESS_ADMIN & SYSTEM_ADMIN can access admin panel
#### [EPF.4.2] Profile creation and search restricted to authenticated users
#### [EPF.4.3] Data validation and sanitization (OWASP best practices)

---
<br>

#### Documentation Usage
This file documents all employee profile features and requirements. Update with each change or enhancement.

###### [back](./feature-requirement.md)
