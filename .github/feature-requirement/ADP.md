###### [back](./feature-requirement.md)
# [ADP] Admin Panel


### [ADP.2] Security & Access Control

#### [ADP.2.1] Only ADMIN & SUPERADMIN can access admin panel
---


### [ADP.3] Dictionaries

#### [ADP.3.1] Dictionaries are used for powering dropdown controls 
examples:
- LANGUAGES
- CERTIFICATIONS (for Employee Profile form & search)
#### [ADP.3.2] Dictionaries can contain groups, which are distinct parts of the full dictionary. This helps prevent duplication of predefined items across the application.
- Example: the LANGUAGES dictionary has 100 items, the COMMUNICATION group contains 15 items, so the communication languages control will have 15 options.
The TRANSLATE group contains 3 items, so the application will have 3 language versions.
#### [ADP.3.3] Dictionaries can be managed by ADMIN
#### [ADP.3.5] Dictionaries are stored in `dictionaries` collection
#### [ADP.3.6] Dictionaries are kept in server cache during app working
#### [ADP.3.7] Dictionaries are kept in browser/device cache with 1 day lifetime
#### [ADP.3.8] Dictionaries may be exported to JSON
#### [ADP.3.9] Dictionaries may be imported from JSON
#### [ADP.3.10] Dictionaries have a table-like structure. 
- Each dictionary contains columns such as code, tKey (translation key), and order (starting from 0). 
- Each dictionary can also include additional columns (parameters for dictionary items/elements).
- Each column has a defined type, e.g. number, string, date, stringlist.
- Each column has a defined that is required or not.

---


#### [ADP.3.11] Admin Panel Dictionary Management Features
- View a list of all dictionaries with details such as code, version, status, and update timestamps.
- Add new dictionaries directly from the admin panel.
- Import dictionaries from JSON files.
- Click on a dictionary to view or edit its details.

---

#### Documentation Usage
This file documents all Admin Panel features and requirements. Update with each change or enhancement.

###### [back](./feature-requirement.md)
