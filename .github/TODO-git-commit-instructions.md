# Git Commit Message Instructions

## Overview
These instructions help generate structured commit messages that follows standardized format and integrate with JIRA issue tracking, providing clear and useful information about changes to the codebase.
You are an expert programmer writing a commit message for my changes. Your goal is to create a commit message that follows general good commit message practices and strictly follows our team's format.

## Required Structure
```
[<FEATURE>] <TITLE>

<DESCRIPTION>
```

### Components Explained
- **FEATURE**: Extract by . If you cannot determine the ID from the branch name, just leave the placeholder `<JIRA-ISSUE-ID>`. (format: project code like `CWM_AFO` or `CWMUNISUP`, followed by a hyphen `-` and a number).  Examples: `CWM_AFO-1562`, `CWMUNISUP-941`.
- **SHORT-DESCRIPTION**: Concise summary of changes. In general up to 50 characters max. Use imperative form: "Add", "Fix", "Update", "Remove", "Refactor". 
- **LONG-DESCRIPTION**: More detailed explanation of changes, possibly with markdown formatting.
- **JIRA-LINK**: Full URL to JIRA ticket (format: https://jira-fbu.comarch.com/browse/JIRA-ISSUE-ID).


## Commit Message Guidelines

### General Guidelines
- Always consider all the changes made in the commit.
- Use imperative mood in the short description ("Add feature" not "Added feature")
- Be specific and informative while remaining concise
- Use markdown formatting for better readability when appropriate
- Explain the "why" behind changes, not just the "what"
- Include implementation details that would be valuable to other developers
- Include additional refactoring or improvements if applicable
- Include notable design decisions or technical challenges
- Highlight any side effects or breaking changes
- Note configuration or dependency updates
- If a feature is really simple and self-explanatory just a feature description is enough, but if it is more complex, include justification and implementation details.

### Bug Fix Commits
Include:
- Clear description of what the bug was
- Explanation of why it occurred
- Details about how it was fixed

### Feature Implementation Commits
Include:
- Justification - explanation of the business or technical need for the feature.
- Description of the feature being implemented
- Explanation of implementation approach


## Examples

### Bug Fix Example
```
CWMCRESUP-418 - fix webclient connection pool

### Problem
A connection pool with one channel is created for each request. As a result, it is not possible to reuse channels. The error was caused by creating a new logger instance in the bootstrap phase.

### Solution
Using the same logger instance causes 1 connection pool to be created for the entire webclient and connections are reused

[ticket](https://jira-fbu.comarch.com/browse/CWMCRESUP-418)
```

### Simple, Minor Feature Example
```
CWM_AFO-15711 Add session start validations for cbq

# Feature
- If the current date is later than the final OCDD completion date, the client cannot start any type of session
- Profiling needs to be done before Account Opening session. Client needs to update questionnaire if outdated before starting session

[ticket](https://jira-fbu.comarch.com/browse/CWM_AFO-15711)
```

### Major Feature Example
```
CWMCRESUP-2994 Search branches by name or externalId

### Justification
Client wants to have possibility to search branches by branchId and advisorId and see the on the screen when defining order reassignments.

### Feature
- `searchString` should be used to filter results by name or by externalId.
- 'externalIdn' should also be returned from `getBranches` service.

### Additionally
- Some refactoring in `BranchesProvider` - class was moved to advisor-investments module into its own package.
- Some internal methods refactoring to improve readbability. Logic should remain the same `nullSafeContainsIgnoreCaseAndAccents` was used to improve search utility.

[jira](https://jira-fbu.comarch.com/browse/CWMCRESUP-2994)
```

### Vast, Complicated Change Example
```
CWMUNISUP-1615 Replace `sendSignedOrders` service with `approveSession` with `signId` query param

### Problem
Process od approving session in uni mobile app was divided across two services (`sendSignedOrders` and `approveSession`) called consecutively. That was problematic because if something went wrong when calling `approveSession` (e.g. lost internet connection) then orders were already sent but session remained not approved which should not be possible from business point of view.

The mobile application is also available in versions without integration with signing service (IAM) and backward compatibility should be preserved. 

### Solution
New optional query param `signId` in `approveSession` service will be used as a replacement for calling `sendSignedOrders` and `approveSession` consecutively.

We should ensure that folowing flows will work properly:
- **In AFO:** `approveSession` (send orders just as it is now)
- **In mobile app old version (backward compatibility):** `sendSignedOrders` (send orders after signId verification) -> `approveSession` (does not require signId, does not send orders because they have been sent already)
- **In mobile app new version:** `approveSession` (send orders after `signId` verification) -> `getOrders`
- **In mobile app without IAM:** `approveSession` (send orders after `signId` verification, `advisorySessionId` will be sent as `signId` so core can mock a response from IAM) -> `getOrders`

### Implementation details
- Mark `sendSignedOrders` as deprecated.
- Validate orders sign in `approveSession`, `resendSignedOrders`, `sendSignedOrders`, `cancelSignedOrders` services.
- Store info about successful order sign validation in newly added tables (`CMT_SIGNED_OBJECT`, `CMT_SIGN_VALIDATED_EVENT`). Used only for audit purposes currently.

### Additionally
- Rename `SignedOrderService` -> `ISignedOrdersFetcher` and move to `advisor-investments` module
- Rename `portfolioService.getByExternalIds` -> `getIdByExternalIds` as method was returning portfolios
- Add `ToOrderMappingContext` for mapping collection of dtos to orders
- Change `GoalValueLimitationCheckerParameters.experienceEntry` field type to nullable instead of optional
- Some refactoring in `approveSession` - extracted `getModifiedStateClientGoalIds`, `validateRequiredReportsGenerated`, reduced some nesting, behaviour is preserved.

[jira](https://jira-fbu.comarch.com/browse/CWMUNISUP-1615)
```

## Anti-Patterns to avoid
- Don't use vague descriptions like "Fix bug" or "Update code"
- Don't include commented-out code explanations
- Never include passwords, tokens, or sensitive data
- Don't contain any whitespace errors
- Avoid too long commit messages that are hard to read. Include only relevant information.
