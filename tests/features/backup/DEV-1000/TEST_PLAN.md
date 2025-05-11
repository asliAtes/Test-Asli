# DEV-1000 Test Plan: Flag-Based Fetching Logic for Communication Reports (Email Case)

## 1. Objective
To validate the implementation of flag-based logic in the API Gateway Lambda for fetching communication reports (email case), ensuring that data is fetched from MongoDB or PostgreSQL (PSQL) based on the flag value.

---

## 2. Scope
- **In Scope:**
  - Lambda function logic for flag-based data source selection (MongoDB vs PSQL)
  - Fetching email report data from both MongoDB and PSQL
  - Flag management and deployment process
  - Data integrity and consistency checks
  - Migration script validation (optional, for completeness)
- **Out of Scope:**
  - SMS or other report types (unless explicitly included)
  - UI changes or frontend integration

---

## 3. Test Strategy
- **Functional Testing:**
  - Validate correct data source is used based on flag value
  - Validate correct data is returned for both MongoDB and PSQL
- **Regression Testing:**
  - Ensure no impact on unrelated Lambda functionality
- **Integration Testing:**
  - Test Lambda with both live MongoDB and PSQL instances
- **Negative Testing:**
  - Test with missing/invalid flag, unavailable DB, or malformed data

---

## 4. Test Cases

### 4.1. Flag-Based Source Selection
- **TC1:** Set flag to `true`, request report → Data fetched from MongoDB
- **TC2:** Set flag to `false`, request report → Data fetched from PSQL
- **TC3:** Change flag and redeploy Lambda, verify new source is used

### 4.2. Data Integrity
- **TC4:** Compare sample report data from MongoDB and PSQL for the same record (if migrated)
- **TC5:** Validate all required fields are present in the response (for both sources)

### 4.3. Error Handling
- **TC6:** Simulate MongoDB unavailable, flag=true → Proper error returned
- **TC7:** Simulate PSQL unavailable, flag=false → Proper error returned
- **TC8:** Invalid/missing flag value → Lambda defaults to expected behavior or returns error

### 4.4. Migration Validation (Optional)
- **TC9:** After migration, verify all legacy data is accessible via MongoDB (flag=true) and new data via PSQL (flag=false)

---

## 5. Data Requirements
- Access to both MongoDB and PSQL with sample report data
- At least one migrated record for cross-source validation
- Lambda deployment access to change and test flag

---

## 6. Acceptance Criteria
- Flag correctly determines data source (MongoDB or PSQL)
- Data is fetched and returned correctly from both sources
- Lambda can be redeployed with new flag value without code changes
- Proper error handling for unavailable sources or invalid flag
- Data integrity is maintained during and after migration

---

## 7. Traceability
- Each test case maps to a requirement or acceptance criterion above

---

## 8. Notes
- Coordinate with backend for migration script and data validation
- Document flag change and deployment process for go-live 