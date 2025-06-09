# DEV-986: Questions & Answers (Q&A)

This document tracks all the questions and answers gathered so far for DEV-986, as well as open questions that still require clarification. Please update this file as new information becomes available.

---

## Answered Questions

### 1. **UI Filters**
- **Q:** What UI filters should be considered for testing?
- **A:** Only the currently available UI filters on the dashboard are relevant. There are no additional or special filters at this time.

### 2. **Data Format and Sample Data**
- **Q:** What is the format of the USCC performance file? Are sample payloads available?
- **A:** The file includes fields like `fa_num`, `group_id`, `place_date`, `event_date`, `event_type`, `event_amt`, `event_rsn`, `coll_path`. Sample payloads for SMS, RCS, and Email are available in the Postman collection. Dummy-safe values for QA are provided.

### 3. **Null Value Handling**
- **Q:** What should happen if a null value is detected in the return file?
- **A:** All fields must have values. If a null is detected, the record should be skipped (current behavior), but the desired behavior is to never have null fields at all.

### 4. **File Generation (Timing, Holidays)**
- **Q:** When and how are return files generated?
- **A:** Return files are generated daily after 5 pm and placed in an S3 bucket. No files are generated on Sundays or holidays. If a file is empty, it should contain just headers and a blank row.

### 5. **Environments**
- **Q:** Should tests cover both staging and production environments?
- **A:** Yes, tests should verify files in both staging and production environments.

### 6. **Date/Time Precision**
- **Q:** Should calculations be performed using only the date part, or should the time (hour/minute) also be considered?
- **A:** Calculations should use the full date and time (including hour and minute).

---

## Unanswered/Open Questions

### 1. **DPD Calculation**
- **Q:** Is DPD (days past due) provided in the data, or should it be calculated from event_date and place_date? If so, what is the exact logic?

### 2. **Cancel Events**
- **Q:** Are there any sample records with event_type = "Cancel"? If not, can you provide some, or clarify how to handle and test this scenario?

### 3. **Calculation Examples**
- **Q:** Can you provide sample input data and the expected output for each metric, including calculation steps (especially for edge cases)?

### 4. **Group_id Values**
- **Q:** Are there sample records for group_id = "I" and "C"? If so, can you provide them, or clarify if there are any special rules for these groups?

### 5. **Field Constraints**
- **Q:** Are there any character limits (min/max) for fields like acctNum and treatmentUserId?

---

*Please update this document as new answers or clarifications are received.* 