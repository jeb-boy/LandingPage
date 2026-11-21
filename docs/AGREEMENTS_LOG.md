# Inter-module agreements log

| Date | Partner module | Contact / group | Agreed endpoint | Gateway path env | Offline behavior | Status |
|------|----------------|-----------------|-----------------|------------------|------------------|--------|
| 2026-11-16 | Library | (partner group) | `GET /api/v1/library/summary` | `GATEWAY_LIBRARY_PATH` | HTTP 503 + `{ ok:false, online:false }` | Pending live verification — partner gateway URL and successful response evidence still required |
| 2026-11-20 | Registrar | (partner group) | `GET /api/v1/registrar/me` | `GATEWAY_REGISTRAR_PATH` | Same offline contract | Pending live verification |
| 2026-11-20 | Student Portal | (partner group) | `GET /api/v1/student/summary` | `GATEWAY_STUDENT_PORTAL_PATH` | Same | Pending live verification |
| 2026-11-20 | Finance | (partner group) | `GET /api/v1/finance/summary` | `GATEWAY_FINANCE_PATH` | Same | Pending live verification |
| 2026-11-20 | Faculty | (partner group) | `GET /api/v1/faculty/summary` | `GATEWAY_FACULTY_PATH` | Same | Pending live verification |
| 2026-11-20 | Clinic | (partner group) | `GET /api/v1/clinic/summary` | `GATEWAY_CLINIC_PATH` | Same | Pending live verification |
| 2026-11-20 | Inventory | (partner group) | `GET /api/v1/inventory/summary` | `GATEWAY_INVENTORY_PATH` | Same | Pending live verification |

## How live Modules work
1. Guest users see the static module catalog only.
2. After login, the Modules page calls `GET /api/v1/integrations/modules?ids=...`.
3. Our API forwards the user's JWT to the shared gateway and fans out to each partner.
4. Each card shows **online / offline / error** and a short live summary when the partner responds.
5. Fill partner contacts and final URLs in this table before showcase.


## Evidence required before marking integration complete
- Record the shared gateway base URL (not a localhost URL) and the partner group's confirmed endpoint.
- Record the date/time, HTTP status, and a sanitized sample response from a successful request made through this Landing Page API.
- Stop the partner service or use an agreed test outage and record the Landing Page API's HTTP 503 offline response.
- Do not mark the integration as complete until both cases have been tested.
