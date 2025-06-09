# Critical Requirements for Outreach Log Validation

This document lists the critical recurring problems that must be validated for each outreach log file:

- All lines must end with CR+LF (\r\n)
- File must NOT have a `.crlf` extension
- No null values in any field
- File must end with a blank row
- Headers must be present and in ALL CAPS
- On Sundays and holidays, file must be empty except for header and blank row

Other requirements are out of scope for this validation suite.

## 1. CR + LF Validation
Required Information:
- [ ] File generation service/component location
- [ ] Current line ending implementation
- [ ] Expected hex values (0D0A)
- [ ] File processing pipeline steps
- [ ] Tools/commands used for file generation

## 2. File Extension
Required Information:
- [ ] Current file naming pattern
- [ ] Extension assignment process
- [ ] Correct extension format
- [ ] File name validation process
- [ ] Any automatic renaming scripts

## 3. Null Value Prevention
Required Information:
- [ ] List of fields that must not be null
- [ ] Acceptable default values
- [ ] Current validation process
- [ ] Data sources for each field
- [ ] Error handling for null values

## 4. Additional End Row
Required Information:
- [ ] Expected format of end row
- [ ] Current implementation method
- [ ] Verification process
- [ ] Impact on file processing
- [ ] How it's currently added

## 5. Sunday Processing
Required Information:
- [ ] Sunday file format specification
- [ ] Expected empty file structure
- [ ] Verification requirements
- [ ] Processing schedule
- [ ] Monitoring requirements

## 6. Header Validation
Required Information:
- [ ] Complete header list
- [ ] Header order requirements
- [ ] Format specifications
- [ ] Case sensitivity rules
- [ ] Validation process

## Test Data Requirements
For each issue:
- [ ] Sample valid files
- [ ] Sample invalid files
- [ ] Edge case examples
- [ ] Production error examples

## Validation Tools
- [ ] Current validation tools/scripts
- [ ] Required new tools
- [ ] Automated check requirements
- [ ] Manual verification processes

## Error Handling
- [ ] Error notification requirements
- [ ] Recovery procedures
- [ ] Documentation requirements
- [ ] Escalation process 