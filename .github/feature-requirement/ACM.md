###### [back](./feature-requirement.md)
# [ACM] Account Management


### [ACM.1] Registration

#### [ACM.1.1] TODO - presentation
#### [ACM.1.2] On registration, user receives role USER_FREE by default
#### [ACM.1.3] Registration is possible via two methods described in ACM.2
#### [ACM.1.4] After registration, a new entry is created in the `users` collection

---

### [ACM.2] Registration methods

#### [ACM.2.1] Email + password (JWT, RFC 7519)
- a. Required fields: email, password, full name (single field), communication languages (dropdown, multiselect)
- b. Email must be unique and not used by Google provider
<br>

#### [ACM.2.2] Google provider (OAuth)
- a. Google email must be unique and not used by email registration
- b. Full name and languages fields are required to fill after registration but, but pre-filled with data from Google if available

---

### [ACM.3] Login

#### [ACM.3.1] Login is possible via the same methods as registration (see ACM.2)
#### [ACM.3.2] Email + password method:
- a. User must provide email and password
- b. The last used email is suggested from browser/device cache

---

### [ACM.4] Roles

#### [ACM.4.1] USER_FREE
- a. Default role for all new users (assigned on registration)

#### [ACM.4.2] USER_PREMIUM
- a. Role may be assigned manually by SYSTEM_ADMIN
- b. Upgrade possible via TODO

#### [ACM.4.3] BUSINESS_ADMIN
- a. Role assigned manually by SYSTEM_ADMIN
- b. Permissions to manage employee profile fields and admin panel

#### [ACM.4.4] SYSTEM_ADMIN
- a. Role assigned manually by SYSTEM_ADMIN
- b. Permissions to EVERYTHING

---

#### [ACM.5] Security & Validation
- a. Enforce unique email across all registration methods
- b. Passwords securely hashed (OWASP best practices)
- c. JWT for session management
- d. Input validation and sanitization

---

#### [ACM.6] Languages Field
- a. The registration form must include a dropdown multiselect field for choosing available communication languages.
- b. Available languages are defined as LANGUAGES dictionary, COMMUNICATION group in Admin Panel by SYSTEM_ADMIN
- c. about dictionaries see [[ADP.3]](./ADP.md#adp3-dictionaries)

---

#### Documentation Usage
This file documents all account management features and requirements. Update with each change or enhancement.

###### [back](./feature-requirement.md)