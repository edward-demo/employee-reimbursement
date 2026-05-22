**Add your own guidelines here**

# Version-Control File Naming Rules

- Active documents keep their normal filename.
- Archived versions go inside an `archive/` folder.
- Archived filenames must use this format:
  `DOCUMENT_NAME_vX.Y_YYYY-MM-DD.md`
- Example:
  `BUSINESS_REQUIREMENTS_v1.0_2026-05-12.md`
- Do not add dates or version numbers to the active/current document.
- Never overwrite archived versions.
- Before a major scope change, create an archive copy first.
- After archiving or changing a major document, update the related `changelog.md`.

# Documentation Source-of-Truth Rules

- The active BRD is the highest-level business source of truth.
- The active BRD must be located at `docs/00-business-requirements/BUSINESS_REQUIREMENTS.md`.
- All vision, use cases, rules, data, design, and technical notes should trace back to the BRD.
- If documents conflict, follow the active BRD for business intent and report the conflict before editing.
- Do not treat archived BRD files as active requirements unless the task explicitly asks for historical comparison.
- Do not create duplicate business requirement files outside the BRD folder.

# Documentation Directory Rules

- Store business requirements in `docs/00-business-requirements/`.
- Store use cases in `docs/01-use-cases/`.
- Store rules, workflows, calculations, and business logic notes in `docs/02-rules-and-logic/`.
- Store database, schema, Supabase, and integration documentation in `docs/03-data-and-integrations/`.
- Store design system documentation in `docs/04-design-system/`.
- Store implementation notes, setup notes, troubleshooting notes, and developer references in `docs/05-technical-notes/`.
- Do not create new top-level documentation folders unless explicitly requested.

# Use Case Version Control

- Use case files in `docs/03-use-cases/current/` are the active implementation reference.
- Treat files in the current use case folder as the source for current use case behavior.
- Keep use case IDs stable, such as `UC-001`, `UC-002`, etc.
- Do not renumber existing use cases unless explicitly instructed.
- Do not create duplicate filenames using labels like `final`, `new`, `updated`, or `latest`.
- Each use case should include version metadata near the top of the file:
  - Use Case ID
  - Version
  - Status
  - Last Updated
  - Aligned BRD Version
- Move superseded use case versions to an archive folder when historical copies are needed.
- Use the recommended archive pattern `docs/03-use-cases/archive/YYYY-MM-DD/`.
- Do not leave multiple competing versions in the current use case folder.
- Each use case should include a change log near the bottom of the file tracking version, date, and summary of change.
- Use cases should normally be updated after BRD impact is clear.
- Preferred update sequence: `BRD update -> Use case review/update -> Data/schema check -> UI/code update`.
- When updating a use case, verify that it remains aligned with the current BRD version.
- If the use case and BRD conflict, flag it for review before making implementation changes.

# Database Context Rules

- Before writing database-related code, SQL, policies, or migrations, read `docs/03-data-and-integrations/database-map.md`.
- Use the database map to identify the 3-5 relevant tables or views before editing.
- Do not inspect unrelated tables unless the task explicitly requires them.
- For exact columns, constraints, indexes, and views, refer to:
  - `docs/03-data-and-integrations/data-model.md`
  - `docs/03-data-and-integrations/schema.md`
  - `supabase/migrations/*`
- Do not invent database columns or relationships.
- Business records should reference internal `public.users.user_id`, not `auth.users.id`, unless the task is specifically about authentication identity mapping.

<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
