// Automated API Verification Script
// This script starts a local Next.js dev server, registers dummy users,
// creates and joins teams, submits projects, checks admin dashboard APIs, and cleans up.

const { spawn } = require("child_process");

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to extract cookie from set-cookie headers
function getCookieString(responseHeaders) {
  const setCookie = responseHeaders.getSetCookie 
    ? responseHeaders.getSetCookie() 
    : responseHeaders.get("set-cookie");
  
  if (!setCookie) return "";
  
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  const tokenCookie = cookies.find(c => c.startsWith("token="));
  if (!tokenCookie) return "";
  
  return tokenCookie.split(";")[0];
}

async function runTests() {
  console.log("\n🚀 Starting API verification checks with dummy data...");
  let errors = 0;
  
  // Generate random strings to avoid unique constraint violations
  const suffix = Math.random().toString(36).substring(2, 6);
  
  const adminData = {
    campus: "Aditya KKD",
    name: "saiakhil_test_" + suffix,
    sucNumber: "admin_" + suffix,
    password: "Password123!",
    section: "A",
    class: "CSE",
    rollNumber: "ADM01",
    rating: 5
  };

  const leadData = {
    campus: "Aditya KKD",
    name: "Lead Student " + suffix,
    sucNumber: "lead_" + suffix,
    password: "Password123!",
    section: "A",
    class: "CSE",
    rollNumber: "L01",
    rating: 5
  };

  const memberData = {
    campus: "Aditya KKD",
    name: "Member Student " + suffix,
    sucNumber: "mem_" + suffix,
    password: "Password123!",
    section: "A",
    class: "CSE",
    rollNumber: "M01",
    rating: 4
  };

  const member2Data = {
    campus: "Aditya KKD",
    name: "Member Student 2 " + suffix,
    sucNumber: "mem2_" + suffix,
    password: "Password123!",
    section: "A",
    class: "CSE",
    rollNumber: "M02",
    rating: 4
  };

  let adminCookie = "";
  let leadCookie = "";
  let memberCookie = "";
  let member2Cookie = "";
  let teamId = "";
  let joinCode = "";

  try {
    // 1. Register Admin
    console.log("\n1. Registering Admin user...");
    const regAdminRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData)
    });
    const regAdminJson = await regAdminRes.json();
    console.log(`Status: ${regAdminRes.status}`, regAdminJson);
    if (!regAdminRes.ok) throw new Error("Admin registration failed");
    adminCookie = getCookieString(regAdminRes.headers);

    // 2. Register Lead
    console.log("\n2. Registering Lead user...");
    const regLeadRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData)
    });
    const regLeadJson = await regLeadRes.json();
    console.log(`Status: ${regLeadRes.status}`, regLeadJson);
    if (!regLeadRes.ok) throw new Error("Lead registration failed");
    leadCookie = getCookieString(regLeadRes.headers);

    // 3. Register Member
    console.log("\n3. Registering Member user...");
    const regMemRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData)
    });
    const regMemJson = await regMemRes.json();
    console.log(`Status: ${regMemRes.status}`, regMemJson);
    if (!regMemRes.ok) throw new Error("Member registration failed");
    memberCookie = getCookieString(regMemRes.headers);

    // 3.5 Register Member 2
    console.log("\n3.5 Registering Member 2 user...");
    const regMem2Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member2Data)
    });
    const regMem2Json = await regMem2Res.json();
    console.log(`Status: ${regMem2Res.status}`, regMem2Json);
    if (!regMem2Res.ok) throw new Error("Member 2 registration failed");
    member2Cookie = getCookieString(regMem2Res.headers);

    // 4. Test Get Profile (me) for Lead
    console.log("\n4. Fetching Profile (me) for Lead...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { "Cookie": leadCookie }
    });
    const meJson = await meRes.json();
    console.log(`Status: ${meRes.status}`, { name: meJson.user?.name, role: meJson.user?.role });
    if (!meRes.ok) throw new Error("Me API failed");

    // 5. Create a Team (Lead)
    console.log("\n5. Creating a new team...");
    const createTeamRes = await fetch(`${BASE_URL}/api/team/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": leadCookie
      },
      body: JSON.stringify({ teamName: "Beta Testers " + suffix, maxSize: "3" })
    });
    const createTeamJson = await createTeamRes.json();
    console.log(`Status: ${createTeamRes.status}`, createTeamJson);
    if (!createTeamRes.ok) throw new Error("Create Team failed");
    teamId = createTeamJson.team.id;
    joinCode = createTeamJson.team.joinCode;

    // 6. Join the Team (Member)
    console.log(`\n6. Joining team with code ${joinCode}...`);
    const joinRes = await fetch(`${BASE_URL}/api/team/join`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": memberCookie
      },
      body: JSON.stringify({ joinCode })
    });
    const joinJson = await joinRes.json();
    console.log(`Status: ${joinRes.status}`, joinJson);
    if (!joinRes.ok) throw new Error("Join Team failed");

    // 6.5 Join the Team (Member 2)
    console.log(`\n6.5 Joining team with code ${joinCode} (Member 2)...`);
    const join2Res = await fetch(`${BASE_URL}/api/team/join`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": member2Cookie
      },
      body: JSON.stringify({ joinCode })
    });
    const join2Json = await join2Res.json();
    console.log(`Status: ${join2Res.status}`, join2Json);
    if (!join2Res.ok) throw new Error("Join Team (Member 2) failed");

    // 7. Get Team Members
    console.log("\n7. Fetching Team Members...");
    const membersRes = await fetch(`${BASE_URL}/api/team/members`, {
      headers: { "Cookie": leadCookie }
    });
    const membersJson = await membersRes.json();
    console.log(`Status: ${membersRes.status}`, {
      teamName: membersJson.team?.name,
      memberCount: membersJson.team?.members?.length
    });
    if (!membersRes.ok) throw new Error("Get Team Members failed");

    // 8. Submit Mini Project (Member)
    console.log("\n8. Submitting Mini Project (Member)...");
    const subMiniRes = await fetch(`${BASE_URL}/api/projects/submit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": memberCookie
      },
      body: JSON.stringify({
        type: "Mini",
        githubLink: "https://github.com/member/mini-repo",
        imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANS"
      })
    });
    const subMiniJson = await subMiniRes.json();
    console.log(`Status: ${subMiniRes.status}`, subMiniJson);
    if (!subMiniRes.ok) throw new Error("Submit Mini Project failed");

    // 8.5 Fetch and select a problem statement for the team
    console.log("\n8.5 Fetching and selecting a problem statement for the team...");
    const probFetchRes = await fetch(`${BASE_URL}/api/problems`);
    const probFetchJson = await probFetchRes.json();
    if (!probFetchRes.ok || !probFetchJson.problems || probFetchJson.problems.length === 0) {
      throw new Error("Failed to fetch problem statements for selection");
    }
    const problemId = probFetchJson.problems[0]._id;
    console.log(`Fetched problem: "${probFetchJson.problems[0].title}" (ID: ${problemId})`);

    const selectProbRes = await fetch(`${BASE_URL}/api/team/select-problem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": leadCookie
      },
      body: JSON.stringify({ problemId })
    });
    const selectProbJson = await selectProbRes.json();
    console.log(`Select Problem Status: ${selectProbRes.status}`, selectProbJson);
    if (!selectProbRes.ok) throw new Error("Select Problem Statement failed");

    // 9. Submit Main Project (Lead)
    console.log("\n9. Submitting Main Project (Lead)...");
    const subMainRes = await fetch(`${BASE_URL}/api/projects/submit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": leadCookie
      },
      body: JSON.stringify({
        type: "Main",
        githubLink: "https://github.com/lead/main-repo",
        imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANS"
      })
    });
    const subMainJson = await subMainRes.json();
    console.log(`Status: ${subMainRes.status}`, subMainJson);
    if (!subMainRes.ok) throw new Error("Submit Main Project failed");

    // 10. Check Project Status
    console.log("\n10. Fetching Project Status...");
    const statusRes = await fetch(`${BASE_URL}/api/projects/status`, {
      headers: { "Cookie": leadCookie }
    });
    const statusJson = await statusRes.json();
    console.log(`Status: ${statusRes.status}`, {
      hasMini: !!statusJson.miniProject,
      hasMain: !!statusJson.mainProject
    });
    if (!statusRes.ok) throw new Error("Fetch Project Status failed");

    // 11. Fetch Problem Statements
    console.log("\n11. Fetching Problem Statements...");
    const probRes = await fetch(`${BASE_URL}/api/problems`);
    const probJson = await probRes.json();
    console.log(`Status: ${probRes.status}`, { problemCount: probJson.problems?.length });
    if (!probRes.ok) throw new Error("Get Problems failed");

    // 12. Fetch Admin Data
    console.log("\n12. Fetching Admin Data Dashboard...");
    const adminDataRes = await fetch(`${BASE_URL}/api/admin/data`, {
      headers: { "Cookie": adminCookie }
    });
    const adminDataJson = await adminDataRes.json();
    console.log(`Status: ${adminDataRes.status}`, {
      studentsCount: adminDataJson.students?.length,
      teamsCount: adminDataJson.teams?.length,
      projectsCount: adminDataJson.projects?.length
    });
    if (!adminDataRes.ok) throw new Error("Get Admin Data failed");

    // 13. Delete Team (Clean up via Admin)
    console.log(`\n13. Cleaning up: Admin deleting team ${teamId}...`);
    const deleteTeamRes = await fetch(`${BASE_URL}/api/admin/team/delete`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": adminCookie
      },
      body: JSON.stringify({ teamId })
    });
    const deleteTeamJson = await deleteTeamRes.json();
    console.log(`Status: ${deleteTeamRes.status}`, deleteTeamJson);
    if (!deleteTeamRes.ok) throw new Error("Admin Delete Team failed");

    console.log("\n🎉 All API verification checks completed successfully!");
  } catch (err) {
    console.error("\n❌ API Test failed:", err.message);
    errors++;
  }

  process.exit(errors > 0 ? 1 : 0);
}

// Start local Next.js server in development mode
console.log("Starting Next.js development server...");
const nextProcess = spawn("npx", ["next", "dev", "-p", PORT.toString()], {
  stdio: "inherit",
  shell: true
});

// Allow the server 6 seconds to bind and initialize
setTimeout(() => {
  runTests().finally(() => {
    console.log("Stopping Next.js server...");
    nextProcess.kill();
  });
}, 6000);
