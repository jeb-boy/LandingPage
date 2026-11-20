# Inter-module agreements log

| Date | Partner module | Contact / group | Agreed endpoint | Gateway path env | Offline behavior | Status |
|------|----------------|-----------------|-----------------|------------------|------------------|--------|
| 2026-11-16 | Library | (partner group) | `GET /api/v1/library/summary` | `GATEWAY_LIBRARY_PATH` | HTTP 503 + `{ ok:false, online:false }` | Scaffold ready — set `GATEWAY_URL` |
| 2026-11-20 | Registrar | (partner group) | `GET /api/v1/registrar/me` | `GATEWAY_REGISTRAR_PATH` | Same offline contract | Scaffold ready |
| 2026-11-20 | Student Portal | (partner group) | `GET /api/v1/student/summary` | `GATEWAY_STUDENT_PORTAL_PATH` | Same | Scaffold ready |
| 2026-11-20 | Finance | (partner group) | `GET /api/v1/finance/summary` | `GATEWAY_FINANCE_PATH` | Same | Scaffold ready |
| 2026-11-20 | Faculty | (partner group) | `GET /api/v1/faculty/summary` | `GATEWAY_FACULTY_PATH` | Same | Scaffold ready |
| 2026-11-20 | Clinic | (partner group) | `GET /api/v1/clinic/summary` | `GATEWAY_CLINIC_PATH` | Same | Scaffold ready |
| 2026-11-20 | Inventory | (partner group) | `GET /api/v1/inventory/summary` | `GATEWAY_INVENTORY_PATH` | Same | Scaffold ready |

## How live Modules work
1. Guest users see the static module catalog only.
2. After login, the Modules page calls `GET /api/v1/integrations/modules?ids=...`.
3. Our API forwards the user's JWT to the shared gateway and fans out to each partner.
4. Each card shows **online / offline / error** and a short live summary when the partner responds.
5. Fill partner contacts and final URLs in this table before showcase.
