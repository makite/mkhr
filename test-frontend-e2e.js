/**
 * test-frontend-e2e.js
 * Comprehensive Frontend End-to-End Alignment Test Suite.
 * Validates the frontend Vite dev server (http://localhost:5173),
 * CORS preflight requests, routing parity, and all API contracts consumed by mkhr services.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

let token = null;
let passed = 0;
let failed = 0;
const failures = [];

async function req(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, ok: res.ok, headers: res.headers, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

function assert(description, condition, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${description}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${description} ${details}`);
    failures.push({ description, details });
  }
}

async function runFrontendE2E() {
  console.log("\n🌐 Starting MKHR Frontend — End-to-End Alignment Test Suite");
  console.log(`💻 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📡 Backend URL:  ${BACKEND_URL}`);
  console.log("=".repeat(65));

  // ── 1. Dev Server Health & HTML ──────────────────────────────────────────
  console.log("\n[1/7] Frontend & Backend Server Availability");
  {
    const rFront = await req(FRONTEND_URL);
    assert(
      "Frontend Vite server is running on http://localhost:5173",
      rFront.status === 200 && typeof rFront.data === "string" && rFront.data.includes("<div id=\"root\">"),
      `Status: ${rFront.status}`
    );

    const rBack = await req(`${BACKEND_URL}/health`);
    assert(
      "Backend Express server is running on http://localhost:3000",
      rBack.status === 200 && rBack.data?.status === "OK"
    );
  }

  // ── 2. CORS Preflight & Credentials ──────────────────────────────────────
  console.log("\n[2/7] Cross-Origin (CORS) Security & Headers");
  {
    const rCors = await req(`${BACKEND_URL}/api/auth/login`, {
      method: "OPTIONS",
      headers: {
        "Origin": FRONTEND_URL,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    const allowOrigin = rCors.headers?.get("access-control-allow-origin");
    const allowCreds = rCors.headers?.get("access-control-allow-credentials");

    assert(
      "Backend allows Origin http://localhost:5173",
      allowOrigin === FRONTEND_URL,
      `Received: ${allowOrigin}`
    );
    assert(
      "Backend allows Access-Control-Allow-Credentials",
      allowCreds === "true",
      `Received: ${allowCreds}`
    );
  }

  // ── 3. Frontend Authentication Contract ──────────────────────────────────
  console.log("\n[3/7] Frontend Login Flow & Session Contract (login-form.tsx)");
  {
    const rLogin = await req(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": FRONTEND_URL },
      body: JSON.stringify({ email: "admin@erp.com", password: "Admin@123" }),
    });

    assert(
      "POST /auth/login returns user and token for frontend storage",
      rLogin.status === 200 && rLogin.data?.success && rLogin.data?.data?.token
    );

    token = rLogin.data?.data?.token;

    // Check CurrentUser schema expected by dashboard-layout.tsx
    const rProfile = await req(`${BACKEND_URL}/api/auth/profile`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });

    const user = rProfile.data?.data?.user;
    assert(
      "GET /auth/profile returns user with expected CurrentUser shape",
      rProfile.status === 200 && user && user.email && user.role,
      `User: ${JSON.stringify(user?.email)}`
    );
  }

  // ── 4. Navigation & Menu Alignment ───────────────────────────────────────
  console.log("\n[4/7] Dynamic Navigation & Router Path Alignment");
  {
    const rNav = await req(`${BACKEND_URL}/api/navigation`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });

    assert(
      "GET /navigation returns menu items tree",
      rNav.status === 200 && Array.isArray(rNav.data?.data?.items || rNav.data?.items)
    );

    const items = rNav.data?.data?.items || rNav.data?.items || [];
    const flatPaths = [];
    const walk = (nodes) => {
      for (const n of nodes) {
        if (n.path) flatPaths.push(n.path);
        if (n.children) walk(n.children);
      }
    };
    walk(items);

    console.log(`     Discovered ${flatPaths.length} active menu links in database:`);
    flatPaths.forEach((p) => console.log(`       • ${p}`));

    // Known frontend router paths supported by router/index.tsx
    const supportedRoutes = [
      "/dashboard",
      "/system-admin/dashboard",
      "/users",
      "/system-admin/users",
      "/roles",
      "/system-admin/roles",
      "/system-admin/menu",
      "/system-admin/access",
      "/system-admin/company-profile",
      "/company-profile",
      "/hr-admin/dashboard",
      "/hr/dashboard",
      "/hr-admin/settings",
      "/hr/settings",
      "/settings",
      "/employees",
      "/hr/employees",
      "/employees/new",
      "/hr/actions-approval",
      "/actions-approval",
      "/hr/reports",
      "/reports",
    ];

    let allPathsMatched = true;
    for (const p of flatPaths) {
      const isHandled = supportedRoutes.includes(p) || p.startsWith("/system-admin") || p.startsWith("/hr") || p.startsWith("/payroll");
      if (!isHandled) {
        allPathsMatched = false;
        console.log(`       ⚠️ Unhandled menu path: ${p}`);
      }
    }

    assert(
      "Every menu item in database maps to a registered frontend route (No 404s)",
      allPathsMatched
    );
  }

  // ── 5. Lookup Contracts (Including TERMINATION_REASON) ────────────────────
  console.log("\n[5/7] Master Lookups Contract (employeeService.fetchLookupData)");
  {
    const lookupCodes = [
      "TITLE",
      "GENDER",
      "MARITAL_STATUS",
      "COUNTRY",
      "EMPLOYMENT_TYPE",
      "TERMINATION_REASON",
    ];

    for (const code of lookupCodes) {
      const r = await req(`${BACKEND_URL}/api/lookups/${code}`, {
        headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
      });

      assert(
        `GET /lookups/${code} returns active lookup values`,
        r.status === 200 && r.data?.success && Array.isArray(r.data?.data?.values) && r.data.data.values.length > 0,
        `Values count: ${r.data?.data?.values?.length || 0}`
      );
    }
  }

  // ── 6. Organization & Salary Matrix Data ─────────────────────────────────
  console.log("\n[6/7] Organization Structure & Salary Matrix (fetchOrganizationData)");
  {
    const rDepts = await req(`${BACKEND_URL}/api/departments`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /departments returns departments list",
      rDepts.status === 200 && (rDepts.data?.data?.departments || rDepts.data?.departments)
    );

    const rDeptTree = await req(`${BACKEND_URL}/api/departments/tree`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /departments/tree returns department hierarchy", rDeptTree.status === 200);

    const rBranches = await req(`${BACKEND_URL}/api/branches`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /branches returns branches list",
      rBranches.status === 200 && (rBranches.data?.data?.branches || rBranches.data?.branches)
    );

    const rBranchTree = await req(`${BACKEND_URL}/api/branches/tree`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /branches/tree returns branch hierarchy", rBranchTree.status === 200);

    const rScales = await req(`${BACKEND_URL}/api/scales`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /scales returns salary scales", rScales.status === 200);

    const rGrades = await req(`${BACKEND_URL}/api/grades`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /grades returns salary grades", rGrades.status === 200);

    const rMatrix = await req(`${BACKEND_URL}/api/salary-matrix/full`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /salary-matrix/full returns full grid for salary-matrix-tab",
      rMatrix.status === 200 && rMatrix.data?.success
    );
  }

  // ── 7. HR Actions & Benefits Catalogs ─────────────────────────────────────
  console.log("\n[7/7] HR Actions Approval & Benefits Contracts");
  {
    const rActions = await req(`${BACKEND_URL}/api/hr-actions?status=PENDING`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /hr-actions returns approval queue", rActions.status === 200);

    const rBenefitTypes = await req(`${BACKEND_URL}/api/benefits/types?includeInactive=true`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /benefits/types returns benefit catalog", rBenefitTypes.status === 200);

    const rBenefitAssign = await req(`${BACKEND_URL}/api/benefits/assignments?includeInactive=true`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert("GET /benefits/assignments returns assignments list", rBenefitAssign.status === 200);
  }

  // ── 8. Payroll Management & Compensation Contracts ────────────────────────
  console.log("\n[8/8] Payroll Management & Statutory Compensation Contracts");
  {
    const rPayrollDash = await req(`${BACKEND_URL}/api/payroll/dashboard/stats`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/dashboard/stats returns executive compensation analytics",
      rPayrollDash.status === 200 && rPayrollDash.data?.success
    );

    const rPeriods = await req(`${BACKEND_URL}/api/payroll/setup/periods`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/periods returns fiscal periods list",
      rPeriods.status === 200 && Array.isArray(rPeriods.data?.data)
    );

    const rCurrentPeriod = await req(`${BACKEND_URL}/api/payroll/setup/current-period`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/current-period returns active fiscal cycle",
      rCurrentPeriod.status === 200 && rCurrentPeriod.data?.data?.id
    );

    const rTransTypes = await req(`${BACKEND_URL}/api/payroll/setup/transaction-types`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/transaction-types returns compensation rule definitions",
      rTransTypes.status === 200 && Array.isArray(rTransTypes.data?.data)
    );

    const rTaxBrackets = await req(`${BACKEND_URL}/api/payroll/setup/tax-brackets`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/tax-brackets returns Proc 979/2016 statutory tax tiers",
      rTaxBrackets.status === 200 && Array.isArray(rTaxBrackets.data?.data)
    );

    const rBanks = await req(`${BACKEND_URL}/api/payroll/setup/banks`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/banks returns licensed commercial banks",
      rBanks.status === 200 && Array.isArray(rBanks.data?.data)
    );

    const rOvertime = await req(`${BACKEND_URL}/api/payroll/setup/overtime-rates`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/setup/overtime-rates returns Proc 1156/2019 overtime multipliers",
      rOvertime.status === 200 && Array.isArray(rOvertime.data?.data)
    );

    const rProfiles = await req(`${BACKEND_URL}/api/payroll/employees/profiles`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/employees/profiles returns employee disbursement profiles",
      rProfiles.status === 200 && Array.isArray(rProfiles.data?.data)
    );

    const rTransactions = await req(`${BACKEND_URL}/api/payroll/transactions`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/transactions returns active variable entries",
      rTransactions.status === 200 && Array.isArray(rTransactions.data?.data)
    );

    const rLoans = await req(`${BACKEND_URL}/api/payroll/transactions/loans`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/transactions/loans returns staff loan agreements",
      rLoans.status === 200 && Array.isArray(rLoans.data?.data)
    );

    const rCostSharing = await req(`${BACKEND_URL}/api/payroll/transactions/cost-sharing`, {
      headers: { "Authorization": `Bearer ${token}`, "Origin": FRONTEND_URL },
    });
    assert(
      "GET /payroll/transactions/cost-sharing returns higher education cost-sharing records",
      rCostSharing.status === 200 && Array.isArray(rCostSharing.data?.data)
    );
  }

  // ── Final Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(65));
  console.log("📊 FRONTEND END-TO-END ALIGNMENT RESULTS");
  console.log("=".repeat(65));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log("\nFailure Details:");
    failures.forEach((f, idx) => console.log(`  ${idx + 1}. ${f.description} -> ${f.details}`));
  } else {
    console.log("\n🎉 ALL FRONTEND END-TO-END CONTRACTS & ALIGNMENTS PASSED 100%!");
  }

  process.exit(failed > 0 ? 1 : 0);
}

runFrontendE2E().catch((err) => {
  console.error("Fatal error during test run:", err);
  process.exit(1);
});
